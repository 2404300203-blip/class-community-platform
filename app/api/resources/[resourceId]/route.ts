import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  try {
    const user = await requireUser();
    const { resourceId } = await params;
    const resource = await prisma.resource.findFirst({
      where: { id: resourceId, classroomId: user.classroomId },
    });
    if (!resource) {
      return NextResponse.json({ error: "资料不存在" }, { status: 404 });
    }
    if (resource.authorId !== user.id) {
      return NextResponse.json({ error: "只能删除自己分享的资料" }, { status: 403 });
    }
    await prisma.resource.delete({ where: { id: resourceId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: "请先登录" }, { status: error.status });
    }
    throw error;
  }
}
