import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AuthTokenService, PasswordService } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectMongo();

    const body = await req.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ userId, isActive: true });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await PasswordService.comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = AuthTokenService.generateToken({
      userId: user.userId,
      role: user.role,
      departmentId: user.departmentId,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        userId: user.userId,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        departmentId: user.departmentId,
        currentSemester: user.currentSemester,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
