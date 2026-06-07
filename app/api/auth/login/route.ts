import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/server/db";
import { createSession } from "@/lib/server/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { studentId?: string; password?: string }
    | null;
  const studentId = body?.studentId?.trim() || "";
  const password = body?.password || "";

  if (!studentId || !password) {
    return NextResponse.json({ error: "请填写学号和密码" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { studentId } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "学号或密码不正确" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
