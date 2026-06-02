import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getTokenStatus() {
  const tokenSetting = await prisma.setting.findUnique({
    where: { key: "github.token" },
  });
  const usernameSetting = await prisma.setting.findUnique({
    where: { key: "github.username" },
  });
  const validatedAtSetting = await prisma.setting.findUnique({
    where: { key: "github.tokenValidatedAt" },
  });

  const configured = !!tokenSetting?.value;
  const username = usernameSetting?.value || null;
  const validatedAt = validatedAtSetting?.value || null;

  return {
    configured,
    valid: configured && !!username && !!validatedAt,
    username,
    validatedAt,
  };
}

export async function GET() {
  try {
    const status = await getTokenStatus();
    return NextResponse.json(status);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub token status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Validate token against GitHub API
    let username: string;
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AgentBoard-CE",
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: "Invalid token", valid: false },
          { status: 400 }
        );
      }

      const userData = await response.json();
      username = userData.login;
    } catch {
      return NextResponse.json(
        { error: "Failed to validate token with GitHub API" },
        { status: 502 }
      );
    }

    // Save token, username, and validation timestamp
    await prisma.setting.upsert({
      where: { key: "github.token" },
      update: { value: token },
      create: { key: "github.token", value: token },
    });

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
      configured: true,
      valid: true,
      username,
      validatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to save GitHub token" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.setting.deleteMany({
      where: {
        key: { in: ["github.token", "github.username", "github.tokenValidatedAt"] },
      },
    });

    return NextResponse.json({
      configured: false,
      valid: false,
      username: null,
      validatedAt: null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove GitHub token" },
      { status: 500 }
    );
  }
}
