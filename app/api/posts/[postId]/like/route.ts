import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { serializePost } from "@/lib/server/serializers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const user = await requireUser();
    const { postId } = await params;
    const post = await prisma.post.findFirst({
      where: { id: postId, classroomId: user.classroomId },
      include: { likes: true },
    });
    if (!post) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }

    const liked = post.likes.some((like) => like.userId === user.id);
    if (liked) {
      await prisma.postLike.delete({
        where: { postId_userId: { postId, userId: user.id } },
      });
    } else {
      await prisma.postLike.create({
        data: { postId, userId: user.id },
      });
    }

    const updated = await prisma.post.findUniqueOrThrow({
      where: { id: postId },
      include: { likes: true },
    });
    return NextResponse.json({ post: serializePost(updated) });
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: "请先登录" }, { status: error.status });
    }
    throw error;
  }
}
