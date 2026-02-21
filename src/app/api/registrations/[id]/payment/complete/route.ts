import { NextRequest, NextResponse } from 'next/server';
import { RegistrationFacade } from '@/facades/RegistrationFacade';
import { withAuth, withRoles, withErrorHandler, compose, AuthenticatedRequest } from '@/middleware/decorators';

const registrationFacade = new RegistrationFacade();

async function completePaymentHandler(req: AuthenticatedRequest, context: { params: { id: string } }) {
  const registrationId = context.params.id;
  const body = await req.json();
  const { paymentId } = body;

  if (!paymentId) {
    return NextResponse.json(
      { error: 'Payment ID is required' },
      { status: 400 }
    );
  }

  const registration = await registrationFacade.completePayment(registrationId, paymentId);

  return NextResponse.json({
    success: true,
    registration,
  });
}

export const POST = compose(
  withErrorHandler,
  withRoles(['student'])
)(completePaymentHandler);
