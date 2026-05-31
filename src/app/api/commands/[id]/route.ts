import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commandTemplateSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const command = await prisma.commandTemplate.findUnique({
      where: { id },
      include: { project: true, commandRuns: { orderBy: { startedAt: "desc" }, take: 10 } },
    });

    if (!command) {
      return NextResponse.json(
        { error: "Command not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(command);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch command" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = commandTemplateSchema.parse(body);

    const command = await prisma.commandTemplate.update({
      where: { id },
      data: validatedData,
      include: { project: true },
    });

    return NextResponse.json(command);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update command" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.commandTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete command" },
      { status: 500 }
    );
  }
}
