import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Result } from "@/models/Result";
import { Registration } from "@/models/Registration";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(req.url);
  const intakeSession = searchParams.get("session");
  const semester = searchParams.get("semester");

  let teacherObjId: mongoose.Types.ObjectId;
  try {
    teacherObjId = new mongoose.Types.ObjectId(session.user.id);
  } catch {
    return NextResponse.json({ error: "Invalid teacher id" }, { status: 400 });
  }

  // Build student query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {
    advisorId: teacherObjId,
    role: "student",
    isActive: true,
  };
  if (semester) query.currentSemester = semester;

  const advisees = await User.find(query)
    .select("name userId session currentSemester departmentId")
    .populate("departmentId", "name shortName")
    .sort({ name: 1 })
    .lean();

  const studentIds = advisees.map((s) => (s as { _id: mongoose.Types.ObjectId })._id);

  const latestRegistrations = await Registration.find({
    studentId: { $in: studentIds },
    status: { $ne: "rejected" },
  })
    .select("studentId academicYear createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const registrationSessionMap = new Map<string, string>();
  for (const registration of latestRegistrations) {
    const studentId = registration.studentId.toString();
    if (!registrationSessionMap.has(studentId)) {
      registrationSessionMap.set(studentId, registration.academicYear);
    }
  }

  // Get latest published CGPA per student via aggregation
  const latestResults = await Result.aggregate([
    { $match: { studentId: { $in: studentIds }, isPublished: true } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$studentId", cgpa: { $first: "$cgpa" } } },
  ]);

  const cgpaMap = new Map<string, number>(
    latestResults.map((r: { _id: mongoose.Types.ObjectId; cgpa: number }) => [
      r._id.toString(),
      r.cgpa,
    ])
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = advisees
    .map((s: any) => {
      const studentId = s._id.toString();
      return {
        _id: studentId,
        name: s.name as string,
        userId: s.userId as string,
        session: (s.session as string) || registrationSessionMap.get(studentId) || "—",
        currentSemester: (s.currentSemester as string) ?? "—",
        department: (s.departmentId as { name: string } | null)?.name ?? "—",
        cgpa: cgpaMap.get(studentId) ?? null,
      };
    })
    .filter((s) => !intakeSession || s.session === intakeSession);

  return NextResponse.json({ success: true, data, total: data.length });
}
