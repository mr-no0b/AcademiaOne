import { NextRequest, NextResponse } from 'next/server';
import { RegistrationFacade } from '@/facades/RegistrationFacade';
import { withAuth, withRoles, withErrorHandler, compose, AuthenticatedRequest } from '@/middleware/decorators';

const registrationFacade = new RegistrationFacade();

async function initiatePaymentHandler(req: AuthenticatedRequest, context: { params: { id: string } }) {
  const user = req.user!;
  const registrationId = context.params.id;

  const result = await registrationFacade.initiatePayment(registrationId, user.userId);

  return NextResponse.json({
    success: true,
    ...result,
  });
}

export const POST = compose(
  withErrorHandler,
  withRoles(['student'])
)(initiatePaymentHandler);
