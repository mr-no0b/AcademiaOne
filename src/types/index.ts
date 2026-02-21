// Core Types
export type UserRole = 'student' | 'teacher' | 'admin';

export type Semester = '1-1' | '1-2' | '2-1' | '2-2' | '3-1' | '3-2' | '4-1' | '4-2';

// Registration States
export type RegistrationState = 
  | 'draft' 
  | 'submitted' 
  | 'advisor_approved' 
  | 'advisor_rejected'
  | 'head_approved' 
  | 'head_rejected'
  | 'payment_pending'
  | 'payment_completed'
  | 'admitted'
  | 'cancelled';

// Election States
export type ElectionState = 
  | 'created'
  | 'nomination_open'
  | 'nomination_closed'
  | 'voting_open'
  | 'voting_closed'
  | 'results_published';

// Forum Types
export type ForumBadge = 'newcomer' | 'contributor' | 'expert' | 'moderator';

// User Interface
export interface IUser {
  userId: string; // Student/Teacher/Admin ID
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: string;
  currentSemester?: Semester; // For students
  isAdvisor?: boolean; // For teachers
  isDepartmentHead?: boolean; // For teachers
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Department Interface
export interface IDepartment {
  _id: string;
  name: string;
  code: string;
  headId?: string; // Teacher userId
  createdAt: Date;
  updatedAt: Date;
}

// Course Interface
export interface ICourse {
  _id: string;
  code: string;
  title: string;
  credits: number;
  departmentId: string;
  semester: Semester; // Which semester this course belongs to
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Course Registration Interface
export interface IRegistration {
  _id: string;
  studentId: string;
  semester: Semester;
  departmentId: string;
  courseIds: string[];
  state: RegistrationState;
  advisorId?: string;
  advisorApprovedAt?: Date;
  advisorRejectionReason?: string;
  headApprovedAt?: Date;
  headRejectionReason?: string;
  paymentId?: string;
  paidAt?: Date;
  admittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Classroom (Course Offering)
export interface IClassroom {
  _id: string;
  courseId: string;
  semester: Semester;
  teacherId: string;
  departmentId: string;
  academicYear: string; // e.g., "2024-2025"
  enrolledStudents: string[];
  totalPlannedClasses: number;
  createdAt: Date;
  updatedAt: Date;
}

// Announcement
export interface IAnnouncement {
  _id: string;
  classroomId: string;
  teacherId: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Assignment
export interface IAssignment {
  _id: string;
  classroomId: string;
  teacherId: string;
  title: string;
  description: string;
  resourceLinks: string[]; // Google Drive links
  dueDate: Date;
  maxMarks: number;
  createdAt: Date;
  updatedAt: Date;
}

// Submission
export interface ISubmission {
  _id: string;
  assignmentId: string;
  studentId: string;
  submissionLink: string; // Google Drive link
  submittedAt: Date;
  marksObtained?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: string;
}

// Attendance Record
export interface IAttendance {
  _id: string;
  classroomId: string;
  teacherId: string;
  date: Date;
  lectureNumber: number;
  presentStudents: string[];
  absentStudents: string[];
  createdAt: Date;
}

// Result
export interface IResult {
  _id: string;
  studentId: string;
  departmentId: string;
  semester: Semester;
  academicYear: string;
  courseResults: {
    courseId: string;
    marksObtained: number;
    totalMarks: number;
    gradePoint: number;
    letterGrade: string;
  }[];
  semesterGPA: number;
  cumulativeCGPA: number;
  departmentRank?: number;
  publishedAt: Date;
  publishedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Forum Question
export interface IForumQuestion {
  _id: string;
  authorId: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  views: number;
  votedBy: { userId: string; vote: 'up' | 'down' }[];
  acceptedAnswerId?: string;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Forum Answer
export interface IForumAnswer {
  _id: string;
  questionId: string;
  authorId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  votedBy: { userId: string; vote: 'up' | 'down' }[];
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Forum User Reputation
export interface IForumReputation {
  _id: string;
  userId: string;
  reputation: number;
  badges: ForumBadge[];
  questionsAsked: number;
  answersGiven: number;
  acceptedAnswers: number;
  updatedAt: Date;
}

// Election
export interface IElection {
  _id: string;
  departmentId: string;
  title: string;
  description: string;
  state: ElectionState;
  nominationStartDate: Date;
  nominationEndDate: Date;
  votingStartDate: Date;
  votingEndDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Election Candidate
export interface ICandidate {
  _id: string;
  electionId: string;
  studentId: string;
  manifesto: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  voteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Vote
export interface IVote {
  _id: string;
  electionId: string;
  voterId: string; // Student ID
  candidateId: string;
  votedAt: Date;
}

// Notice
export interface INotice {
  _id: string;
  title: string;
  content: string;
  type: 'central' | 'departmental';
  departmentId?: string;
  publishedBy: string;
  isPinned: boolean;
  expiresAt?: Date;
  attachments: string[]; // Links
  createdAt: Date;
  updatedAt: Date;
}

// Note
export interface INote {
  _id: string;
  title: string;
  description: string;
  driveLink: string;
  departmentId: string;
  semester: Semester;
  courseId?: string;
  uploadedBy: string;
  tags: string[];
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Book Recommendation
export interface IBookRecommendation {
  _id: string;
  courseId: string;
  teacherId: string;
  title: string;
  author: string;
  edition?: string;
  isbn?: string;
  link?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification
export interface INotification {
  _id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  relatedEntity?: {
    type: string;
    id: string;
  };
  isRead: boolean;
  createdAt: Date;
}
