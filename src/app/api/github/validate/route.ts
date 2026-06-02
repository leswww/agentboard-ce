import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const tokenSetting = await prisma.setting.findUnique({
      where: { key: "github.token" },
    });

    if (!tokenSetting?.value) {
      return NextResponse.json(
        { error: "No GitHub token configured", valid: false },
        { status: 400 }
      );
    }

    const token = tokenSetting.value;

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AgentBoard-CE",
      },
    });

    if (!response.ok) {
      // Clear username and validation status on failure
      await prisma.setting.deleteMany({
        where: { key: { in: ["github.username", "github.tokenValidatedAt"] } },
      });

      return NextResponse.json({
        valid: false,
        error: response.status === 401 ? "Token is invalid or expired" : "GitHub API error",
      });
    }

    const userData = await response.json();
    const username = userData.login;

    await prisma.setting.upsert({
      where: { key: "github.username" },
      update: { value: username },
      create: { key: "github.username", value: username },
    });

    await prisma.setting.upsert({
      where: { key: "github.tokenValidatedAt" },
      update: { value: new Date().toISOString() },
      create: { key: "github.tokenValidatedAt", value: new Date().toISOString() },
    });

    return NextResponse.json({
      valid: true,
      username,
      validatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to validate GitHub token" },
      { status: 500 }
    );
  }
}
