import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { serializePost } from "@/lib/server/serializers";
import type { PostType } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json().catch(() => null)) as
      | {
          type?: PostType;
          content?: string;
          tags?: string[];
          subject?: string;
          duration?: number;
          image?: string;
        }
      | null;

    const type = body?.type;
    const content = body?.content?.trim() || "";
    if (type !== "learning" && type !== "daily") {
      return NextResponse.json({ error: "动态类型不正确" }, { status: 400 });
    }
    if (content.length < 5) {
      return NextResponse.json({ error: "再多写一点吧，至少需要 5 个字" }, { status: 400 });
    }
    const subject = body?.subject?.trim() || "";
    const duration = body?.duration;
    if (type === "learning" && !subject) {
      return NextResponse.json({ error: "请填写学科或学习方向" }, { status: 400 });
    }
    if (
      type === "learning" &&
      (!duration || duration < 1 || duration > 600)
    ) {
      return NextResponse.json({ error: "请输入 1 至 600 分钟的学习时长" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        type,
        content,
        tags: (body?.tags || []).slice(0, 4),
        subject: type === "learning" ? subject : null,
        duration: type === "learning" ? duration : null,
        image: body?.image,
        userId: user.id,
        classroomId: user.classroomId,
      },
      include: { likes: true },
    });

    return NextResponse.json({ post: serializePost(post) });
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: "请先登录" }, { status: error.status });
    }
    throw error;
  }
}
