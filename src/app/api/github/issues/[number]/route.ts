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
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${number}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tokenSetting.value}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AgentBoard-CE",
      },
    });

    if (response.status === 404) {
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }

    if (response.status === 403) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded", errorType: "rate-limit" },
        { status: 429 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "GitHub API error" },
        { status: response.status }
      );
    }

    const issue = await response.json();

    return NextResponse.json({
      ok: true,
      issue: {
        number: issue.number,
        title: issue.title,
        state: issue.state,
        author: issue.user?.login,
        labels: (issue.labels || []).map((l: Record<string, unknown>) => ({
          name: l.name,
          color: l.color,
        })),
        body: issue.body,
        comments: issue.comments,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        url: issue.html_url,
        repository: `${owner}/${repo}`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub issue" },
      { status: 500 }
    );
  }
}
