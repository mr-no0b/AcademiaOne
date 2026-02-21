import mongoose, { Schema } from 'mongoose';
import { IElection, ICandidate, IVote } from '@/types';

const ElectionSchema = new Schema<IElection>({
  departmentId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  state: { 
    type: String, 
    enum: ['created', 'nomination_open', 'nomination_closed', 'voting_open', 'voting_closed', 'results_published'],
    required: true,
    default: 'created',
    index: true
  },
  nominationStartDate: { type: Date, required: true },
  nominationEndDate: { type: Date, required: true },
  votingStartDate: { type: Date, required: true },
  votingEndDate: { type: Date, required: true },
  createdBy: { type: String, required: true },
}, { timestamps: true });

ElectionSchema.index({ departmentId: 1, state: 1 });

const CandidateSchema = new Schema<ICandidate>({
  electionId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  manifesto: { type: String, required: true },
  isApproved: { type: Boolean, default: false, index: true },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  voteCount: { type: Number, default: 0 },
}, { timestamps: true });

CandidateSchema.index({ electionId: 1, studentId: 1 }, { unique: true });
CandidateSchema.index({ electionId: 1, isApproved: 1 });

const VoteSchema = new Schema<IVote>({
  electionId: { type: String, required: true, index: true },
  voterId: { type: String, required: true, index: true },
  candidateId: { type: String, required: true },
  votedAt: { type: Date, default: Date.now },
});

VoteSchema.index({ electionId: 1, voterId: 1 }, { unique: true });

export const Election = mongoose.models.Election || mongoose.model<IElection>('Election', ElectionSchema);
export const Candidate = mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);
export const Vote = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);
