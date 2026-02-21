import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { Course } from '@/models/Course';
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

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    const query: any = {};
    if (departmentId) {
      query.departmentId = departmentId;
    }

    const courses = await Course.find(query)
      .sort({ code: 1 })
      .lean();

    // Populate department and teacher information
    const coursesWithDetails = await Promise.all(
      courses.map(async (course: any) => {
        const department = await Department.findById(course.departmentId).select('name code').lean();
        const teacher = course.teacherId 
          ? await User.findOne({ userId: course.teacherId }).select('firstName lastName email').lean()
          : null;
        return { 
          ...course, 
          department,
          teacher
        };
      })
    );

    return NextResponse.json({
      success: true,
      courses: coursesWithDetails,
    });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
