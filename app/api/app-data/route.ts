import { NextResponse } from "next/server";
import { defaultModuleStates } from "@/lib/data";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import {
  serializeClassroom,
  serializeComment,
  serializeModuleState,
  serializePost,
  serializeResource,
  serializeUser,
} from "@/lib/server/serializers";

export async function GET() {
  try {
    const currentUser = await requireUser();
    const [users, posts, comments, resources, moduleStates] = await Promise.all([
      prisma.user.findMany({
        where: { classroomId: currentUser.classroomId },
        orderBy: { joinedAt: "asc" },
      }),
      prisma.post.findMany({
        where: { classroomId: currentUser.classroomId },
        include: { likes: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.comment.findMany({
        where: { post: { classroomId: currentUser.classroomId } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.resource.findMany({
        where: { classroomId: currentUser.classroomId },
        include: { author: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.moduleInstallState.findMany({
        where: { classroomId: currentUser.classroomId },
      }),
    ]);

    const modules = {
      ...structuredClone(defaultModuleStates),
      ...Object.fromEntries(
        moduleStates.map((state) => [state.moduleId, serializeModuleState(state)]),
      ),
    };

    return NextResponse.json({
      classroom: serializeClassroom(currentUser.classroom),
      currentUserId: currentUser.id,
      users: users.map(serializeUser),
      posts: posts.map(serializePost),
      comments: comments.map(serializeComment),
      resources: resources.map(serializeResource),
      modules,
    });
  } catch (error) {
    if (error instanceof Response) {
      return NextResponse.json({ error: "请先登录" }, { status: error.status });
    }
    throw error;
  }
}
