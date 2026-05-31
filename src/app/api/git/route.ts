import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    if (!existsSync(path)) {
      return NextResponse.json({
        currentBranch: null,
        isDirty: false,
        files: [],
        error: "Path does not exist",
      });
    }

    const git = simpleGit(path);

    try {
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        return NextResponse.json({
          currentBranch: null,
          isDirty: false,
          files: [],
          error: "Not a git repository",
        });
      }

      const status = await git.status();
      const branch = await git.branchLocal();

      return NextResponse.json({
        currentBranch: branch.current,
        isDirty: status.files.length > 0,
        files: status.files.map((f) => f.path),
      });
    } catch {
      return NextResponse.json({
        currentBranch: null,
        isDirty: false,
        files: [],
        error: "Failed to read git status",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check git status" },
      { status: 500 }
    );
  }
}
