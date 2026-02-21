import { NextRequest, NextResponse } from 'next/server';
import { AttendanceFacade } from '@/facades/AttendanceFacade';
import { AuthTokenService } from '@/lib/auth';

const attendanceFacade = new AttendanceFacade();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = AuthTokenService.verifyToken(token);

    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { classroomId, date, lectureNumber, presentStudents, absentStudents } = body;

    if (!classroomId || !date || !lectureNumber || !presentStudents || !absentStudents) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const attendance = await attendanceFacade.markAttendance({
      classroomId,
      teacherId: user.userId,
      date: new Date(date),
      lectureNumber,
      presentStudents,
      absentStudents,
    });

    return NextResponse.json({
      success: true,
      attendance,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}
