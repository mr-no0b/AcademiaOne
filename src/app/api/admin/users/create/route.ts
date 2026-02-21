import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { User } from '@/models/User';
import { PasswordService } from '@/lib/auth';
import { withAuth, withRoles, withErrorHandler, compose } from '@/middleware/decorators';

async function createUserHandler(req: NextRequest) {
  await connectMongo();

  const body = await req.json();
  const { 
    userId, 
    password, 
    role, 
    firstName, 
    lastName, 
    email, 
    departmentId,
    currentSemester,
    isAdvisor,
    isDepartmentHead
  } = body;

  // Validation
  if (!userId || !password || !role || !firstName || !lastName || !email) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existing = await User.findOne({ 
    $or: [{ userId }, { email }] 
  });
  
  if (existing) {
    return NextResponse.json(
      { error: 'User ID or email already exists' },
      { status: 409 }
    );
  }

  // Hash password
  const hashedPassword = await PasswordService.hashPassword(password);

  // Create user
  const user = await User.create({
    userId,
    password: hashedPassword,
    role,
    firstName,
    lastName,
    email,
    departmentId,
    currentSemester,
    isAdvisor: isAdvisor || false,
    isDepartmentHead: isDepartmentHead || false,
    isActive: true,
  });

  return NextResponse.json({
    success: true,
    user: {
      userId: user.userId,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      departmentId: user.departmentId,
    },
  }, { status: 201 });
}

export const POST = compose(
  withErrorHandler,
  withRoles(['admin'])
)(createUserHandler);
