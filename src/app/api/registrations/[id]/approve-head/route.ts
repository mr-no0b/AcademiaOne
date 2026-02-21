import { NextRequest, NextResponse } from 'next/server';
import { RegistrationFacade } from '@/facades/RegistrationFacade';
import { withAuth, withRoles, withErrorHandler, compose, AuthenticatedRequest } from '@/middleware/decorators';

const registrationFacade = new RegistrationFacade();

async function approveByHeadHandler(req: AuthenticatedRequest, context: { params: { id: string } }) {
  const user = req.user!;
  const registrationId = context.params.id;

  const registration = await registrationFacade.approveByHead(registrationId, user.userId);

  return NextResponse.json({
    success: true,
    registration,
  });
}

export const POST = compose(
  withErrorHandler,
  withRoles(['teacher'])
)(approveByHeadHandler);
