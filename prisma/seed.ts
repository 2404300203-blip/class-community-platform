import { Prisma, PrismaClient, ResourceType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO_INVITE_CODE, defaultModuleStates, seedData } from "../lib/data";

const prisma = new PrismaClient();

function moduleConfig(moduleId: string) {
  return (defaultModuleStates[moduleId]?.config || {}) as Prisma.InputJsonValue;
}

function moduleRollback(moduleId: string) {
  return (defaultModuleStates[moduleId]?.rollback ||
    undefined) as Prisma.InputJsonValue | undefined;
}

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const classroom = await prisma.classroom.upsert({
    where: { inviteCode: DEMO_INVITE_CODE },
    update: {
      name: seedData.classroom.name,
      slogan: seedData.classroom.slogan,
    },
    create: {
      id: seedData.classroom.id,
      name: seedData.classroom.name,
      inviteCode: DEMO_INVITE_CODE,
      slogan: seedData.classroom.slogan,
    },
  });

  for (const user of seedData.users) {
    await prisma.user.upsert({
      where: { studentId: user.studentId },
      update: {
        name: user.name,
        className: user.className,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        classroomId: classroom.id,
      },
      create: {
        id: user.id,
        name: user.name,
        studentId: user.studentId,
        className: user.className,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        joinedAt: new Date(user.joinedAt),
        passwordHash,
        classroomId: classroom.id,
      },
    });
  }

  for (const post of seedData.posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {},
      create: {
        id: post.id,
        type: post.type,
        subject: post.subject,
        duration: post.duration,
        content: post.content,
        tags: post.tags,
        image: post.image,
        createdAt: new Date(post.createdAt),
        userId: post.userId,
        classroomId: classroom.id,
        likes: {
          create: post.likes.map((userId) => ({ userId })),
        },
      },
    });
  }

  for (const comment of seedData.comments) {
    await prisma.comment.upsert({
      where: { id: comment.id },
      update: {},
      create: {
        id: comment.id,
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
        createdAt: new Date(comment.createdAt),
      },
    });
  }

  await prisma.resource.upsert({
    where: { id: "resource-seed-1" },
    update: {},
    create: {
      id: "resource-seed-1",
      title: "高数极限题型整理",
      subject: "高等数学",
      type: ResourceType.note,
      description: "按题型整理了常见极限求法，适合考前快速复盘。",
      tags: ["极限", "复习"],
      createdAt: new Date("2026-06-05T08:10:00.000Z"),
      authorId: "u-chen",
      classroomId: classroom.id,
    },
  });

  await prisma.resource.upsert({
    where: { id: "resource-seed-2" },
    update: {},
    create: {
      id: "resource-seed-2",
      title: "Python 数据处理入门清单",
      subject: "程序设计",
      type: ResourceType.link,
      url: "https://docs.python.org/zh-cn/3/tutorial/",
      description: "适合刚开始学 Python 的同学，先看基础语法和数据结构部分。",
      tags: ["Python", "入门"],
      createdAt: new Date("2026-06-04T12:20:00.000Z"),
      authorId: "u-lin",
      classroomId: classroom.id,
    },
  });

  for (const state of Object.values(defaultModuleStates)) {
    await prisma.moduleInstallState.upsert({
      where: {
        classroomId_moduleId: {
          classroomId: classroom.id,
          moduleId: state.moduleId,
        },
      },
      update: {
        enabled: state.enabled,
        installedVersion: state.installedVersion,
        config: moduleConfig(state.moduleId),
        status: state.status,
        error: state.error,
        rollback: moduleRollback(state.moduleId),
      },
      create: {
        classroomId: classroom.id,
        moduleId: state.moduleId,
        enabled: state.enabled,
        installedVersion: state.installedVersion,
        config: moduleConfig(state.moduleId),
        status: state.status,
        error: state.error,
        rollback: moduleRollback(state.moduleId),
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
