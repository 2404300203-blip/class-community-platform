import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { serializeClassroom, serializeUser } from "@/lib/server/serializers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: serializeUser(user),
    classroom: serializeClassroom(user.classroom),
  });
}
