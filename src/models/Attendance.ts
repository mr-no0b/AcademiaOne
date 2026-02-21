import mongoose, { Schema } from 'mongoose';
import { IAttendance } from '@/types';

const AttendanceSchema = new Schema<IAttendance>({
  classroomId: { type: String, required: true, index: true },
  teacherId: { type: String, required: true },
  date: { type: Date, required: true, index: true },
  lectureNumber: { type: Number, required: true },
  presentStudents: [{ type: String }],
  absentStudents: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

AttendanceSchema.index({ classroomId: 1, date: 1 });
AttendanceSchema.index({ classroomId: 1, lectureNumber: 1 });

export const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
