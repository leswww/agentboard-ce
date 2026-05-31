import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await prisma.prReviewDraft.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: "PR review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch PR review" },
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
    await prisma.prReviewDraft.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete PR review" },
      { status: 500 }
    );
  }
}
