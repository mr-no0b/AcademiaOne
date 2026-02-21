import { connectMongo } from '@/lib/mongodb';
import { Classroom, Announcement, Assignment, Submission } from '@/models/Classroom';
import { getEventPublisher } from '@/observers/EventPublisher';

export class ClassroomFacade {
  private eventPublisher = getEventPublisher();

  async createClassroom(data: {
    courseId: string;
    semester: string;
    teacherId: string;
    departmentId: string;
    academicYear: string;
    totalPlannedClasses?: number;
  }): Promise<any> {
    await connectMongo();

    const classroom = await Classroom.create({
      ...data,
      enrolledStudents: [],
      totalPlannedClasses: data.totalPlannedClasses || 40,
    });

    return classroom;
  }

  async enrollStudents(classroomId: string, studentIds: string[]): Promise<any> {
    await connectMongo();

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) throw new Error('Classroom not found');

    classroom.enrolledStudents = [
      ...new Set([...classroom.enrolledStudents, ...studentIds])
    ];
    await classroom.save();

    return classroom;
  }

  async createAnnouncement(data: {
    classroomId: string;
    teacherId: string;
    title: string;
    content: string;
    isPinned?: boolean;
  }): Promise<any> {
    await connectMongo();

    const announcement = await Announcement.create(data);

    await this.eventPublisher.publish({
      type: 'announcement_created',
      data: {
        announcementId: announcement._id,
        classroomId: data.classroomId,
        title: data.title,
      },
      timestamp: new Date(),
    });

    return announcement;
  }

  async getAnnouncements(classroomId: string): Promise<any[]> {
    await connectMongo();
    return Announcement.find({ classroomId })
      .sort({ isPinned: -1, createdAt: -1 });
  }

  async createAssignment(data: {
    classroomId: string;
    teacherId: string;
    title: string;
    description: string;
    resourceLinks: string[];
    dueDate: Date;
    maxMarks: number;
  }): Promise<any> {
    await connectMongo();

    const assignment = await Assignment.create(data);

    // Get enrolled students
    const classroom = await Classroom.findById(data.classroomId);
    
    await this.eventPublisher.publish({
      type: 'assignment_created',
      data: {
        assignmentId: assignment._id,
        classroomId: data.classroomId,
        title: data.title,
        dueDate: data.dueDate,
        studentIds: classroom?.enrolledStudents || [],
      },
      timestamp: new Date(),
    });

    return assignment;
  }

  async getAssignments(classroomId: string): Promise<any[]> {
    await connectMongo();
    return Assignment.find({ classroomId }).sort({ dueDate: -1 });
  }

  async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    submissionLink: string;
  }): Promise<any> {
    await connectMongo();

    const submission = await Submission.create(data);
    return submission;
  }

  async gradeSubmission(
    submissionId: string,
    marksObtained: number,
    feedback: string,
    gradedBy: string
  ): Promise<any> {
    await connectMongo();

    const submission = await Submission.findById(submissionId);
    if (!submission) throw new Error('Submission not found');

    submission.marksObtained = marksObtained;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = gradedBy;
    await submission.save();

    await this.eventPublisher.publish({
      type: 'assignment_graded',
      data: {
        submissionId: submission._id,
        studentId: submission.studentId,
        assignmentId: submission.assignmentId,
        marksObtained,
      },
      timestamp: new Date(),
    });

    return submission;
  }

  async getSubmissions(assignmentId: string): Promise<any[]> {
    await connectMongo();
    return Submission.find({ assignmentId }).sort({ submittedAt: 1 });
  }

  async getStudentSubmission(assignmentId: string, studentId: string): Promise<any> {
    await connectMongo();
    return Submission.findOne({ assignmentId, studentId });
  }

  async getClassroomsByTeacher(teacherId: string, academicYear?: string): Promise<any[]> {
    await connectMongo();
    
    const filter: any = { teacherId };
    if (academicYear) filter.academicYear = academicYear;
    
    return Classroom.find(filter).sort({ createdAt: -1 });
  }

  async getClassroomsByStudent(studentId: string): Promise<any[]> {
    await connectMongo();
    return Classroom.find({ enrolledStudents: studentId }).sort({ createdAt: -1 });
  }
}
