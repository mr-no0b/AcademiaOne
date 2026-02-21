import mongoose, { Schema } from 'mongoose';
import { IForumQuestion, IForumAnswer, IForumReputation } from '@/types';

const ForumQuestionSchema = new Schema<IForumQuestion>({
  authorId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String, index: true }],
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  votedBy: [{ 
    userId: { type: String, required: true },
    vote: { type: String, enum: ['up', 'down'], required: true }
  }],
  acceptedAnswerId: { type: String },
  isClosed: { type: Boolean, default: false },
}, { timestamps: true });

ForumQuestionSchema.index({ tags: 1, createdAt: -1 });
ForumQuestionSchema.index({ upvotes: -1, createdAt: -1 });

const ForumAnswerSchema = new Schema<IForumAnswer>({
  questionId: { type: String, required: true, index: true },
  authorId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  votedBy: [{ 
    userId: { type: String, required: true },
    vote: { type: String, enum: ['up', 'down'], required: true }
  }],
  isAccepted: { type: Boolean, default: false },
}, { timestamps: true });

ForumAnswerSchema.index({ questionId: 1, createdAt: 1 });
ForumAnswerSchema.index({ questionId: 1, upvotes: -1 });

const ForumReputationSchema = new Schema<IForumReputation>({
  userId: { type: String, required: true, unique: true, index: true },
  reputation: { type: Number, default: 0 },
  badges: [{ type: String, enum: ['newcomer', 'contributor', 'expert', 'moderator'] }],
  questionsAsked: { type: Number, default: 0 },
  answersGiven: { type: Number, default: 0 },
  acceptedAnswers: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export const ForumQuestion = mongoose.models.ForumQuestion || mongoose.model<IForumQuestion>('ForumQuestion', ForumQuestionSchema);
export const ForumAnswer = mongoose.models.ForumAnswer || mongoose.model<IForumAnswer>('ForumAnswer', ForumAnswerSchema);
export const ForumReputation = mongoose.models.ForumReputation || mongoose.model<IForumReputation>('ForumReputation', ForumReputationSchema);
