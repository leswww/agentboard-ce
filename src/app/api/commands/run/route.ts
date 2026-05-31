import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spawn } from "child_process";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { command, projectId, workingDirectory, commandTemplateId } = body;

    if (!command) {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Create command run record
    const commandRun = await prisma.commandRun.create({
      data: {
        command,
        projectId: projectId || null,
        commandTemplateId: commandTemplateId || null,
        workingDirectory: workingDirectory || process.cwd(),
        status: "running",
        startedAt: new Date(),
      },
    });

    // Execute command
    const result = await new Promise<{ exitCode: number; output: string }>((resolve) => {
      const parts = command.split(" ");
      const cmd = parts[0];
      const args = parts.slice(1);

      const child = spawn(cmd, args, {
        cwd: workingDirectory || process.cwd(),
        shell: true,
        env: { ...process.env },
      });

      let output = "";

      child.stdout.on("data", (data) => {
        output += data.toString();
      });

      child.stderr.on("data", (data) => {
        output += data.toString();
      });

      child.on("close", (code) => {
        resolve({
          exitCode: code ?? 1,
          output,
        });
      });

      child.on("error", (err) => {
        resolve({
          exitCode: 1,
          output: `Error: ${err.message}`,
        });
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        child.kill("SIGTERM");
        resolve({
          exitCode: 1,
          output: output + "\n\nCommand timed out after 30 seconds",
        });
      }, 30000);
    });

    const durationMs = Date.now() - startTime;

    // Update command run record
    const updatedRun = await prisma.commandRun.update({
      where: { id: commandRun.id },
      data: {
        output: result.output,
        exitCode: result.exitCode,
        status: result.exitCode === 0 ? "success" : "failed",
        endedAt: new Date(),
        durationMs,
      },
    });

    return NextResponse.json(updatedRun);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to run command" },
      { status: 500 }
    );
  }
}
