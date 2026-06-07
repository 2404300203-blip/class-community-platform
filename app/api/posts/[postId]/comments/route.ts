import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { serializeComment } from "@/lib/server/serializers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const user = await requireUser();
    const { postId } = await params;
    const body = (await request.json().catch(() => null)) as
      | { content?: string }
      | null;
    const content = body?.content?.trim() || "";
    if (!content) {
      return NextResponse.json({ error: "请填写评论内容" }, { status: 400 });
    }

    const post = await prisma.post.findFirst({
      where: { id: postId, classroomId: user.classroomId },
    });
    if (!post) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: user.id,
        content,
      },
    });
    return NextResponse.json({ comment: serializeComment(comment) });
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: "请先登录" }, { status: error.status });
    }
    throw error;
  }
}
