import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
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
        { error: "Project is not linked to a GitHub repository", errorType: "no-repo" },
        { status: 400 }
      );
    }

    // Get token
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
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=50`;

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

    const issues = await response.json();

    // Filter out pull requests
    const filteredIssues = issues
      .filter((issue: Record<string, unknown>) => !issue.pull_request)
      .map((issue: Record<string, unknown>) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        author: (issue.user as Record<string, unknown>)?.login,
        labels: ((issue.labels as Array<Record<string, unknown>>) || []).map((l) => ({
          name: l.name,
          color: l.color,
        })),
        comments: issue.comments,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        url: issue.html_url,
      }));

    return NextResponse.json({
      ok: true,
      owner,
      repo,
      issues: filteredIssues,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub issues" },
      { status: 500 }
    );
  }
}
