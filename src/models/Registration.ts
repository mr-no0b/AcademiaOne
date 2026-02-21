import mongoose, { Schema } from 'mongoose';
import { IRegistration } from '@/types';

const RegistrationSchema = new Schema<IRegistration>({
  studentId: { type: String, required: true, index: true },
  semester: { 
    type: String, 
    enum: ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'],
    required: true 
  },
  departmentId: { type: String, required: true, index: true },
  courseIds: [{ type: String, required: true }],
  state: { 
    type: String, 
    enum: [
      'draft', 'submitted', 'advisor_approved', 'advisor_rejected',
      'head_approved', 'head_rejected', 'payment_pending', 
      'payment_completed', 'admitted', 'cancelled'
    ],
    required: true,
    default: 'draft',
    index: true
  },
  advisorId: { type: String },
  advisorApprovedAt: { type: Date },
  advisorRejectionReason: { type: String },
  headApprovedAt: { type: Date },
  headRejectionReason: { type: String },
  paymentId: { type: String },
  paidAt: { type: Date },
  admittedAt: { type: Date },
}, { timestamps: true });

RegistrationSchema.index({ studentId: 1, semester: 1 });
RegistrationSchema.index({ state: 1, departmentId: 1 });

export const Registration = mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema);
