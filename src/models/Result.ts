import mongoose, { Schema } from 'mongoose';
import { IResult } from '@/types';

const ResultSchema = new Schema<IResult>({
  studentId: { type: String, required: true, index: true },
  departmentId: { type: String, required: true, index: true },
  semester: { 
    type: String, 
    enum: ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'],
    required: true 
  },
  academicYear: { type: String, required: true },
  courseResults: [{
    courseId: { type: String, required: true },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    gradePoint: { type: Number, required: true },
    letterGrade: { type: String, required: true },
  }],
  semesterGPA: { type: Number, required: true },
  cumulativeCGPA: { type: Number, required: true },
  departmentRank: { type: Number },
  publishedAt: { type: Date, default: Date.now },
  publishedBy: { type: String, required: true },
}, { timestamps: true });

ResultSchema.index({ studentId: 1, semester: 1, academicYear: 1 }, { unique: true });
ResultSchema.index({ departmentId: 1, semester: 1, academicYear: 1 });

export const Result = mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);
