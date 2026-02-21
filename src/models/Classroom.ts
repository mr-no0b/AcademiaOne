import mongoose, { Schema } from 'mongoose';
import { IClassroom, IAnnouncement, IAssignment, ISubmission } from '@/types';

const ClassroomSchema = new Schema<IClassroom>({
  courseId: { type: String, required: true, index: true },
  semester: { 
    type: String, 
    enum: ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'],
    required: true 
  },
  teacherId: { type: String, required: true, index: true },
  departmentId: { type: String, required: true, index: true },
  academicYear: { type: String, required: true, index: true },
  enrolledStudents: [{ type: String }],
  totalPlannedClasses: { type: Number, required: true, default: 40 },
}, { timestamps: true });

ClassroomSchema.index({ courseId: 1, semester: 1, academicYear: 1 });
ClassroomSchema.index({ teacherId: 1, academicYear: 1 });

const AnnouncementSchema = new Schema<IAnnouncement>({
  classroomId: { type: String, required: true, index: true },
  teacherId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

const AssignmentSchema = new Schema<IAssignment>({
  classroomId: { type: String, required: true, index: true },
  teacherId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  resourceLinks: [{ type: String }],
  dueDate: { type: Date, required: true },
  maxMarks: { type: Number, required: true },
}, { timestamps: true });

const SubmissionSchema = new Schema<ISubmission>({
  assignmentId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  submissionLink: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  marksObtained: { type: Number },
  feedback: { type: String },
  gradedAt: { type: Date },
  gradedBy: { type: String },
});

SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Classroom = mongoose.models.Classroom || mongoose.model<IClassroom>('Classroom', ClassroomSchema);
export const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
export const Assignment = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
export const Submission = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
