import mongoose, { Schema } from 'mongoose';
import { IUser } from '@/types';

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], required: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  departmentId: { type: String, index: true },
  currentSemester: { type: String, enum: ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'] },
  isAdvisor: { type: Boolean, default: false },
  isDepartmentHead: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
