import { NextRequest, NextResponse } from 'next/server';
import { RegistrationFacade } from '@/facades/RegistrationFacade';
import { withAuth, withRoles, withErrorHandler, compose, AuthenticatedRequest } from '@/middleware/decorators';

const registrationFacade = new RegistrationFacade();

async function submitRegistrationHandler(req: AuthenticatedRequest) {
  const user = req.user!;
  const body = await req.json();
  const { semester, courseIds } = body;

  if (!semester || !courseIds || courseIds.length === 0) {
    return NextResponse.json(
      { error: 'Semester and course IDs are required' },
      { status: 400 }
    );
  }

  const registration = await registrationFacade.submitRegistration(
    user.userId,
    semester,
    courseIds
  );

  return NextResponse.json({
    success: true,
    registration,
  }, { status: 201 });
}

async function getMyRegistrationsHandler(req: AuthenticatedRequest) {
  const user = req.user!;

  const registrations = await registrationFacade.getRegistrationsByStudent(user.userId);

  return NextResponse.json({
    success: true,
    registrations,
  });
}

export const POST = compose(
  withErrorHandler,
  withRoles(['student'])
)(submitRegistrationHandler);

export const GET = compose(
  withErrorHandler,
  withRoles(['student'])
)(getMyRegistrationsHandler);
