import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (!project.githubOwner || !project.githubRepo) {
      return NextResponse.json(
        { error: "Project is not linked to a GitHub repository" },
        { status: 400 }
      );
    }

    const tokenSetting = await prisma.setting.findUnique({
      where: { key: "github.token" },
    });

    if (!tokenSetting?.value) {
      return NextResponse.json(
        { error: "No GitHub token configured" },
        { status: 400 }
      );
    }

    const owner = project.githubOwner;
    const repo = project.githubRepo;
    const headers = {
      Authorization: `Bearer ${tokenSetting.value}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "AgentBoard-CE",
    };

    // Fetch PR detail, files, and commits in parallel
    const [prResponse, filesResponse, commitsResponse] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}/commits?per_page=30`, { headers }),
    ]);

    if (prResponse.status === 404) {
      return NextResponse.json(
        { error: "Pull request not found" },
        { status: 404 }
      );
    }

    if (prResponse.status === 403) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded", errorType: "rate-limit" },
        { status: 429 }
      );
    }

    if (!prResponse.ok) {
      return NextResponse.json(
        { error: "GitHub API error" },
        { status: prResponse.status }
      );
    }

    const pr = await prResponse.json();

    let files: Array<Record<string, unknown>> = [];
    if (filesResponse.ok) {
      files = await filesResponse.json();
    }

    let commits: Array<Record<string, unknown>> = [];
    if (commitsResponse.ok) {
      commits = await commitsResponse.json();
    }

    const changedFiles = files.map((f: Record<string, unknown>) => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
      patch: typeof f.patch === "string" ? f.patch.slice(0, 1000) : undefined,
    }));

    const commitsSummary = commits.map((c: Record<string, unknown>) => {
      const commit = c.commit as Record<string, unknown>;
      const author = commit.author as Record<string, unknown> | undefined;
      return {
        sha: (c.sha as string).slice(0, 7),
        message: ((commit.message as string) || "").split("\n")[0],
        author: author?.name || (c.author as Record<string, unknown>)?.login || "unknown",
        date: author?.date,
      };
    });

    return NextResponse.json({
      ok: true,
      pullRequest: {
        number: pr.number,
        title: pr.title,
        state: pr.state,
        draft: pr.draft,
        author: pr.user?.login,
        head: pr.head?.ref,
        base: pr.base?.ref,
        mergeable: pr.mergeable,
        body: pr.body,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        url: pr.html_url,
        repository: `${owner}/${repo}`,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFilesCount: pr.changed_files,
        labels: (pr.labels || []).map((l: Record<string, unknown>) => ({
          name: l.name,
          color: l.color,
        })),
      },
      changedFiles,
      commits: commitsSummary,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub pull request" },
      { status: 500 }
    );
  }
}
