import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { defaultModuleStates } from "@/lib/data";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { serializeModuleState } from "@/lib/server/serializers";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const user = await requireUser();
    if (user.role !== "maintainer") {
      return NextResponse.json({ error: "只有班级维护者可以管理模块" }, { status: 403 });
    }

    const { moduleId } = await params;
    const defaultState = defaultModuleStates[moduleId];
    if (!defaultState) {
      return NextResponse.json({ error: "模块不存在" }, { status: 404 });
    }

    const body = (await request.json().catch(() => null)) as
      | {
          enabled?: boolean;
          installedVersion?: string;
          config?: Record<string, unknown>;
          status?: "ready" | "error";
          error?: string;
          rollback?: unknown;
        }
      | null;

    const state = await prisma.moduleInstallState.upsert({
      where: {
        classroomId_moduleId: {
          classroomId: user.classroomId,
          moduleId,
        },
      },
      update: {
        enabled: Boolean(body?.enabled),
        installedVersion: body?.installedVersion || defaultState.installedVersion,
        config: (body?.config || {}) as Prisma.InputJsonValue,
        status: body?.status || "ready",
        error: body?.error || null,
        rollback: (body?.rollback || undefined) as Prisma.InputJsonValue | undefined,
      },
      create: {
        classroomId: user.classroomId,
        moduleId,
        enabled: Boolean(body?.enabled),
        installedVersion: body?.installedVersion || defaultState.installedVersion,
        config: (body?.config || {}) as Prisma.InputJsonValue,
        status: body?.status || "ready",
        error: body?.error || null,
        rollback: (body?.rollback || undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    return NextResponse.json({ state: serializeModuleState(state) });
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: "请先登录" }, { status: error.status });
    }
    throw error;
  }
}
