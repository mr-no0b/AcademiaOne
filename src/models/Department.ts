import mongoose, { Schema } from 'mongoose';
import { IDepartment } from '@/types';

const DepartmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, index: true },
  headId: { type: String, index: true },
}, { timestamps: true });

export const Department = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);
