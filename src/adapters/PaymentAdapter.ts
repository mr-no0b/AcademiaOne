import { IPaymentAdapter } from './interfaces';

// Mock Payment Adapter - simulates payment gateway
export class MockPaymentAdapter implements IPaymentAdapter {
  async initiatePayment(data: { 
    amount: number; 
    studentId: string; 
    registrationId: string;
    description: string;
  }): Promise<{ 
    success: boolean; 
    paymentId: string; 
    paymentUrl?: string;
  }> {
    // Simulate payment initiation
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Mock Payment Initiated:', {
      ...data,
      paymentId,
    });

    return {
      success: true,
      paymentId,
      paymentUrl: `/payment/mock/${paymentId}`,
    };
  }

  async verifyPayment(paymentId: string): Promise<{ 
    success: boolean; 
    status: 'pending' | 'completed' | 'failed';
  }> {
    // Mock verification - always returns completed
    console.log('Mock Payment Verified:', paymentId);
    
    return {
      success: true,
      status: 'completed',
    };
  }
}

// Future: Real payment gateway adapter
export class StripePaymentAdapter implements IPaymentAdapter {
  async initiatePayment(data: { 
    amount: number; 
    studentId: string; 
    registrationId: string;
    description: string;
  }): Promise<{ 
    success: boolean; 
    paymentId: string; 
    paymentUrl?: string;
  }> {
    // TODO: Integrate with Stripe
    throw new Error('Stripe integration not yet implemented');
  }

  async verifyPayment(paymentId: string): Promise<{ 
    success: boolean; 
    status: 'pending' | 'completed' | 'failed';
  }> {
    // TODO: Integrate with Stripe
    throw new Error('Stripe integration not yet implemented');
  }
}
