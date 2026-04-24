import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

function generateRandomPassword(length = 12) {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += charset[randomInt(charset.length)];
  }
  return password;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const user = await User.findById(id).select("-password").populate("departmentId", "name code").populate("advisorId", "name userId").lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: user });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const body = await req.json();
  if (body.action === "reset_password") {
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Use your profile to change your own password." },
        { status: 400 }
      );
    }

    const newPassword = generateRandomPassword();
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { password: await bcrypt.hash(newPassword, 12) } },
      { new: true }
    )
      .select("-password")
      .lean();

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(
      { success: true, data: user, temporaryPassword: newPassword },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const { name, email, role, departmentId, advisorId, currentSemester, isActive, password, session: userSession, profileImage } = body;

  if (id === session.user.id && isActive === false) {
    return NextResponse.json(
      { error: "You cannot deactivate your own admin account." },
      { status: 400 }
    );
  }

  if (id === session.user.id && password) {
    return NextResponse.json(
      { error: "Use your profile to change your own password." },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (role !== undefined) update.role = role;
  if (departmentId !== undefined) update.departmentId = departmentId || null;
  if (advisorId !== undefined) update.advisorId = advisorId || null;
  if (currentSemester !== undefined) update.currentSemester = currentSemester;
  if (isActive !== undefined) update.isActive = isActive;
  if (password) update.password = await bcrypt.hash(password, 12);
  if (userSession !== undefined) update.session = userSession || null;
  if (profileImage !== undefined) update.profileImage = profileImage || null;

  const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true })
    .select("-password")
    .populate("advisorId", "name userId")
    .lean();

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: user });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.id === id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }
  await connectDB();
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
