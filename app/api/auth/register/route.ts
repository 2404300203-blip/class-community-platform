import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/server/db";
import { createSession } from "@/lib/server/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        name?: string;
        studentId?: string;
        className?: string;
        password?: string;
        inviteCode?: string;
      }
    | null;

  const name = body?.name?.trim() || "";
  const studentId = body?.studentId?.trim() || "";
  const className = body?.className?.trim() || "";
  const password = body?.password || "";
  const inviteCode = body?.inviteCode?.trim().toUpperCase() || "";

  if (name.length < 2) {
    return NextResponse.json({ error: "请填写至少 2 个字的昵称" }, { status: 400 });
  }
  if (!studentId) {
    return NextResponse.json({ error: "请填写学号" }, { status: 400 });
  }
  if (!className) {
    return NextResponse.json({ error: "请填写班级" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "密码至少需要 6 位" }, { status: 400 });
  }

  const classroom = await prisma.classroom.findUnique({
    where: { inviteCode },
  });
  if (!classroom) {
    return NextResponse.json({ error: "邀请码不正确，请检查后重试" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { studentId } });
  if (existing) {
    return NextResponse.json({ error: "该学号已注册，请直接登录" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      studentId,
      className,
      avatar: name.slice(0, 1),
      bio: "很高兴和大家一起记录成长。",
      passwordHash,
      classroomId: classroom.id,
      role: "member",
    },
  });
  await createSession(user.id);

  return NextResponse.json({ ok: true });
}
