import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const state = searchParams.get("state") || "open";

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
        { error: "Project is not linked to a GitHub repository", errorType: "no-repo" },
        { status: 400 }
      );
    }

    const tokenSetting = await prisma.setting.findUnique({
      where: { key: "github.token" },
    });

    if (!tokenSetting?.value) {
      return NextResponse.json(
        { error: "No GitHub token configured", errorType: "no-token" },
        { status: 400 }
      );
    }

    const owner = project.githubOwner;
    const repo = project.githubRepo;
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=50&sort=updated&direction=desc`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tokenSetting.value}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AgentBoard-CE",
      },
    });

    if (response.status === 403) {
      const rateLimitReset = response.headers.get("X-RateLimit-Reset");
      return NextResponse.json(
        {
          error: "GitHub API rate limit exceeded",
          errorType: "rate-limit",
          resetAt: rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toISOString() : null,
        },
        { status: 429 }
      );
    }

    if (response.status === 404) {
      return NextResponse.json(
        { error: "Repository not found on GitHub", errorType: "not-found" },
        { status: 404 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "GitHub API error", errorType: "api-error" },
        { status: response.status }
      );
    }

    const pullRequests = await response.json();

    const filteredPRs = pullRequests.map((pr: Record<string, unknown>) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      draft: pr.draft,
      author: (pr.user as Record<string, unknown>)?.login,
      head: (pr.head as Record<string, unknown>)?.ref,
      base: (pr.base as Record<string, unknown>)?.ref,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      url: pr.html_url,
      changedFiles: pr.changed_files,
      additions: pr.additions,
      deletions: pr.deletions,
      mergeable: pr.mergeable,
      labels: ((pr.labels as Array<Record<string, unknown>>) || []).map((l) => ({
        name: l.name,
        color: l.color,
      })),
    }));

    return NextResponse.json({
      ok: true,
      owner,
      repo,
      pullRequests: filteredPRs,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub pull requests" },
      { status: 500 }
    );
  }
}
