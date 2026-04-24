import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Current password and new password are required." },
      { status: 400 }
    );
  }

  if (String(newPassword).length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 }
    );
  }

  await connectDB();
  const user = await User.findById(session.user.id).select("password");
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    String(currentPassword),
    user.password
  );
  if (!isCurrentPasswordValid) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 }
    );
  }

  user.password = await bcrypt.hash(String(newPassword), 12);
  await user.save();

  return NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
