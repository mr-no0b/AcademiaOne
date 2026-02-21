import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { Department } from '@/models/Department';
import { User } from '@/models/User';
import { AuthTokenService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = AuthTokenService.verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectMongo();

    const departments = await Department.find()
      .sort({ code: 1 })
      .lean();

    // Populate head information
    const departmentsWithHeads = await Promise.all(
      departments.map(async (dept: any) => {
        if (dept.headId) {
          const head = await User.findOne({ userId: dept.headId }).select('firstName lastName email').lean();
          return { ...dept, head };
        }
        return dept;
      })
    );

    return NextResponse.json({
      success: true,
      departments: departmentsWithHeads,
    });
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}
