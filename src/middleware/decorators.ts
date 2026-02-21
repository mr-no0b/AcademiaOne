import { NextRequest, NextResponse } from 'next/server';
import { AuthTokenService, TokenPayload } from '@/lib/auth';
import { UserRole } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

// Authentication Decorator/Middleware
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = AuthTokenService.verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Attach user to request
    const authReq = req as AuthenticatedRequest;
    authReq.user = payload;

    return handler(authReq);
  };
}

// Role-based Authorization Decorator
export function withRoles(allowedRoles: UserRole[]) {
  return function (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
      const user = req.user!;

      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Forbidden: Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(req);
    });
  };
}

// Validation Decorator
export function withValidation<T>(
  validateFn: (data: any) => { valid: boolean; errors?: string[] }
) {
  return function (handler: (req: NextRequest, data: T) => Promise<NextResponse>) {
    return async (req: NextRequest): Promise<NextResponse> => {
      try {
        const body = await req.json();
        const validation = validateFn(body);

        if (!validation.valid) {
          return NextResponse.json(
            { error: 'Validation failed', errors: validation.errors },
            { status: 400 }
          );
        }

        return handler(req, body as T);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid request body' },
          { status: 400 }
        );
      }
    };
  };
}

// Rate Limiting Decorator (Simple in-memory version)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(maxRequests: number, windowMs: number) {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest): Promise<NextResponse> => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      
      const record = rateLimitMap.get(ip);
      
      if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return handler(req);
      }

      if (record.count >= maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        );
      }

      record.count++;
      return handler(req);
    };
  };
}

// Error Handler Decorator
export function withErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error: any) {
      console.error('API Error:', error);
      
      return NextResponse.json(
        { 
          error: 'Internal server error', 
          message: error.message || 'An unexpected error occurred' 
        },
        { status: 500 }
      );
    }
  };
}

// Combine multiple decorators helper
export function compose(...decorators: any[]) {
  return decorators.reduceRight((acc, decorator) => decorator(acc));
}
