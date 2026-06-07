import { ResourceType } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { serializeResource } from "@/lib/server/serializers";

const resourceTypeMap: Record<string, ResourceType> = {
  笔记: ResourceType.note,
  试卷: ResourceType.paper,
  课件: ResourceType.slide,
  链接: ResourceType.link,
  其他: ResourceType.other,
};

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function GET() {
  try {
    const user = await requireUser();
    const resources = await prisma.resource.findMany({
      where: { classroomId: user.classroomId },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ resources: resources.map(serializeResource) });
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: "请先登录" }, { status: error.status });
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json().catch(() => null)) as
      | {
          title?: string;
          subject?: string;
          type?: string;
          url?: string;
          description?: string;
          tags?: string[];
        }
      | null;
    const title = body?.title?.trim() || "";
    const subject = body?.subject?.trim() || "";
    const description = body?.description?.trim() || "";
    const type = resourceTypeMap[body?.type || ""] || ResourceType.other;

    if (title.length < 2) {
      return NextResponse.json({ error: "请填写资料标题" }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: "请填写学科或方向" }, { status: 400 });
    }
    if (description.length < 5) {
      return NextResponse.json({ error: "请简单说明这份资料适合怎么用" }, { status: 400 });
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        subject,
        type,
        url: normalizeUrl(body?.url || ""),
        description,
        tags: (body?.tags || []).slice(0, 5),
        authorId: user.id,
        classroomId: user.classroomId,
      },
      include: { author: true },
    });
    return NextResponse.json({ resource: serializeResource(resource) });
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: "请先登录" }, { status: error.status });
    }
    throw error;
  }
}
