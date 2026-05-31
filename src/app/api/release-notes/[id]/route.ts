import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = await prisma.releaseNote.findUnique({
      where: { id },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Release note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch release note" },
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
    await prisma.releaseNote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete release note" },
      { status: 500 }
    );
  }
}
