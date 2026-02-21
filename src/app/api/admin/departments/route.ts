import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { Department } from '@/models/Department';
import { withAuth, withRoles, withErrorHandler, compose } from '@/middleware/decorators';

async function createDepartmentHandler(req: NextRequest) {
  await connectMongo();

  const body = await req.json();
  const { name, code, headId } = body;

  if (!name || !code) {
    return NextResponse.json(
      { error: 'Name and code are required' },
      { status: 400 }
    );
  }

  // Check if code already exists
  const existing = await Department.findOne({ code });
  if (existing) {
    return NextResponse.json(
      { error: 'Department code already exists' },
      { status: 409 }
    );
  }

  const department = await Department.create({ name, code, headId });

  return NextResponse.json({
    success: true,
    department,
  }, { status: 201 });
}

async function getDepartmentsHandler(req: NextRequest) {
  await connectMongo();

  const departments = await Department.find().sort({ name: 1 });

  return NextResponse.json({
    success: true,
    departments,
  });
}

export const POST = compose(
  withErrorHandler,
  withRoles(['admin'])
)(createDepartmentHandler);

export const GET = compose(
  withErrorHandler,
  withAuth
)(getDepartmentsHandler);
