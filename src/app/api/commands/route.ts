import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commandTemplateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const commands = await prisma.commandTemplate.findMany({
      orderBy: { updatedAt: "desc" },
      include: { project: true },
    });
    return NextResponse.json(commands);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch commands" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = commandTemplateSchema.parse(body);

    const command = await prisma.commandTemplate.create({
      data: validatedData,
      include: { project: true },
    });

    return NextResponse.json(command, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create command" },
      { status: 500 }
    );
  }
}
