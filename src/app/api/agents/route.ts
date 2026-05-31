import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { agentProfileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const agents = await prisma.agentProfile.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = agentProfileSchema.parse(body);

    const agent = await prisma.agentProfile.create({
      data: validatedData,
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
