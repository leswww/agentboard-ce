import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import { existsSync } from "fs";
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

    const localPath = project.localPath;

    if (!localPath) {
      return NextResponse.json({
        ok: false,
        errorType: "no-path",
        currentBranch: null,
        isDirty: false,
        modifiedFiles: [],
        stagedFiles: [],
        untrackedFiles: [],
        commits: [],
        remoteUrl: null,
        lastRefreshed: new Date().toISOString(),
      });
    }

    if (!existsSync(localPath)) {
      return NextResponse.json({
        ok: false,
        errorType: "invalid-path",
        currentBranch: null,
        isDirty: false,
        modifiedFiles: [],
        stagedFiles: [],
        untrackedFiles: [],
        commits: [],
        remoteUrl: null,
        lastRefreshed: new Date().toISOString(),
      });
    }

    const git = simpleGit(localPath);

    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      return NextResponse.json({
        ok: false,
        errorType: "not-git",
        currentBranch: null,
        isDirty: false,
        modifiedFiles: [],
        stagedFiles: [],
        untrackedFiles: [],
        commits: [],
        remoteUrl: null,
        lastRefreshed: new Date().toISOString(),
      });
    }

    const [status, branch, log] = await Promise.all([
      git.status(),
      git.branchLocal(),
      git.log({ maxCount: 5 }),
    ]);

    let remoteUrl: string | null = null;
    try {
      const remotes = await git.getRemotes(true);
      const origin = remotes.find((r) => r.name === "origin");
      remoteUrl = origin?.refs?.fetch || origin?.refs?.push || null;
    } catch {
      // No remotes configured
    }

    return NextResponse.json({
      ok: true,
      errorType: null,
      currentBranch: branch.current,
      isDirty: status.files.length > 0,
      modifiedFiles: status.modified,
      stagedFiles: status.staged,
      untrackedFiles: status.not_added,
      commits: log.all.map((c) => ({
        hash: c.hash.slice(0, 7),
        message: c.message,
        author: c.author_name,
        date: c.date,
      })),
      remoteUrl,
      lastRefreshed: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to check git status" },
      { status: 500 }
    );
  }
}
