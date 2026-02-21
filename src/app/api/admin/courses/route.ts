import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { Course } from '@/models/Course';
import { withAuth, withRoles, withErrorHandler, compose } from '@/middleware/decorators';

async function createCourseHandler(req: NextRequest) {
  await connectMongo();

  const body = await req.json();
  const { code, title, credits, departmentId, semester, description } = body;

  if (!code || !title || !credits || !departmentId || !semester) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Check if code already exists
  const existing = await Course.findOne({ code });
  if (existing) {
    return NextResponse.json(
      { error: 'Course code already exists' },
      { status: 409 }
    );
  }

  const course = await Course.create({
    code,
    title,
    credits,
    departmentId,
    semester,
    description,
  });

  return NextResponse.json({
    success: true,
    course,
  }, { status: 201 });
}

async function getCoursesHandler(req: NextRequest) {
  await connectMongo();

  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get('departmentId');
  const semester = searchParams.get('semester');

  const query: any = {};
  if (departmentId) query.departmentId = departmentId;
  if (semester) query.semester = semester;

  const courses = await Course.find(query).sort({ code: 1 });

  return NextResponse.json({
    success: true,
    courses,
  });
}

export const POST = compose(
  withErrorHandler,
  withRoles(['admin'])
)(createCourseHandler);

export const GET = compose(
  withErrorHandler,
  withAuth
)(getCoursesHandler);
