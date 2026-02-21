import mongoose, { Schema } from 'mongoose';
import { ICourse } from '@/types';

const CourseSchema = new Schema<ICourse>({
  code: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  credits: { type: Number, required: true },
  departmentId: { type: String, required: true, index: true },
  semester: { 
    type: String, 
    enum: ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'],
    required: true,
    index: true
  },
  description: { type: String },
}, { timestamps: true });

CourseSchema.index({ departmentId: 1, semester: 1 });

export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
