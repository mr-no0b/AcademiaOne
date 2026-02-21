import mongoose, { Schema } from 'mongoose';
import { INotice, INote, IBookRecommendation, INotification } from '@/types';

const NoticeSchema = new Schema<INotice>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['central', 'departmental'], required: true, index: true },
  departmentId: { type: String, index: true },
  publishedBy: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
  expiresAt: { type: Date },
  attachments: [{ type: String }],
}, { timestamps: true });

NoticeSchema.index({ type: 1, departmentId: 1, createdAt: -1 });
NoticeSchema.index({ isPinned: -1, createdAt: -1 });

const NoteSchema = new Schema<INote>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  driveLink: { type: String, required: true },
  departmentId: { type: String, required: true, index: true },
  semester: { 
    type: String, 
    enum: ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'],
    required: true,
    index: true
  },
  courseId: { type: String, index: true },
  uploadedBy: { type: String, required: true },
  tags: [{ type: String }],
  downloadCount: { type: Number, default: 0 },
}, { timestamps: true });

NoteSchema.index({ departmentId: 1, semester: 1, createdAt: -1 });
NoteSchema.index({ courseId: 1, createdAt: -1 });

const BookRecommendationSchema = new Schema<IBookRecommendation>({
  courseId: { type: String, required: true, index: true },
  teacherId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  edition: { type: String },
  isbn: { type: String },
  link: { type: String },
  description: { type: String },
}, { timestamps: true });

const NotificationSchema = new Schema<INotification>({
  recipientId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedEntity: {
    type: { type: String },
    id: { type: String },
  },
  isRead: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now },
});

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notice = mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);
export const Note = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
export const BookRecommendation = mongoose.models.BookRecommendation || mongoose.model<IBookRecommendation>('BookRecommendation', BookRecommendationSchema);
export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
