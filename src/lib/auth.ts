import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  departmentId?: string;
}

// JWT Token utilities
export class AuthTokenService {
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}

// Password utilities
export class PasswordService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// Authorization helpers
export class AuthorizationService {
  static hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(userRole);
  }

  static isAdmin(userRole: UserRole): boolean {
    return userRole === 'admin';
  }

  static isTeacher(userRole: UserRole): boolean {
    return userRole === 'teacher';
  }

  static isStudent(userRole: UserRole): boolean {
    return userRole === 'student';
  }

  static canAccessDepartment(userDepartmentId: string | undefined, targetDepartmentId: string): boolean {
    if (!userDepartmentId) return false;
    return userDepartmentId === targetDepartmentId;
  }
}
