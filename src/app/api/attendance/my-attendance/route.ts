import { NextRequest, NextResponse } from 'next/server';
import { AttendanceFacade } from '@/facades/AttendanceFacade';
import { withAuth, withRoles, withErrorHandler, compose, AuthenticatedRequest } from '@/middleware/decorators';

const attendanceFacade = new AttendanceFacade();

async function getMyAttendanceHandler(req: AuthenticatedRequest) {
  const user = req.user!;

  const attendanceStats = await attendanceFacade.getStudentAttendanceForAllClassrooms(user.userId);

  return NextResponse.json({
    success: true,
    attendance: attendanceStats,
  });
}

export const GET = compose(
  withErrorHandler,
  withRoles(['student'])
)(getMyAttendanceHandler);
