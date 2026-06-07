import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const user = await requireUser();
    const { postId } = await params;
    const post = await prisma.post.findFirst({
      where: { id: postId, classroomId: user.classroomId },
    });
    if (!post) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }
    if (post.userId !== user.id) {
      return NextResponse.json({ error: "只能删除自己发布的内容" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id: postId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: "请先登录" }, { status: error.status });
    }
    throw error;
  }
}
