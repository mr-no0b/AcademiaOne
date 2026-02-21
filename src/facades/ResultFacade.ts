import { connectMongo } from '@/lib/mongodb';
import { Result } from '@/models/Result';
import { Course } from '@/models/Course';
import { Assignment, Submission } from '@/models/Classroom';
import { StrategyFactory } from '@/factories';
import { getEventPublisher } from '@/observers/EventPublisher';
import { Semester } from '@/types';

export class ResultFacade {
  private gradingStrategy = StrategyFactory.createGradingStrategy();
  private gpaStrategy = StrategyFactory.createGPACalculationStrategy();
  private rankingStrategy = StrategyFactory.createRankingStrategy();
  private eventPublisher = getEventPublisher();

  async publishResult(data: {
    studentId: string;
    departmentId: string;
    semester: Semester;
    academicYear: string;
    courseResults: Array<{
      courseId: string;
      marksObtained: number;
      totalMarks: number;
    }>;
    publishedBy: string;
  }): Promise<any> {
    await connectMongo();

    // Calculate grades for each course
    const courses = await Course.find({ _id: { $in: data.courseResults.map(c => c.courseId) } });
    
    const courseResultsWithGrades = data.courseResults.map(courseResult => {
      const course = courses.find(c => c._id.toString() === courseResult.courseId);
      const grade = this.gradingStrategy.calculateGrade(
        courseResult.marksObtained,
        courseResult.totalMarks
      );

      return {
        ...courseResult,
        gradePoint: grade.gradePoint,
        letterGrade: grade.letterGrade,
      };
    });

    // Calculate semester GPA
    const gpaData = courseResultsWithGrades.map((result, index) => {
      const course = courses.find(c => c._id.toString() === result.courseId);
      return {
        credits: course?.credits || 3,
        gradePoint: result.gradePoint,
      };
    });

    const semesterGPA = this.gpaStrategy.calculateSemesterGPA(gpaData);

    // Get previous results to calculate CGPA
    const previousResults = await Result.find({ 
      studentId: data.studentId 
    }).sort({ semester: 1 });

    const allSemesterData = [
      ...previousResults.map(r => ({
        semester: r.semester,
        gpa: r.semesterGPA,
        totalCredits: r.courseResults.reduce((sum: number, cr: any) => {
          const course = courses.find(c => c._id.toString() === cr.courseId);
          return sum + (course?.credits || 3);
        }, 0),
      })),
      {
        semester: data.semester,
        gpa: semesterGPA,
        totalCredits: gpaData.reduce((sum, d) => sum + d.credits, 0),
      },
    ];

    const cumulativeCGPA = this.gpaStrategy.calculateCGPA(allSemesterData);

    // Create result
    const result = await Result.create({
      ...data,
      courseResults: courseResultsWithGrades,
      semesterGPA,
      cumulativeCGPA,
      publishedAt: new Date(),
    });

    // Calculate rankings
    await this.calculateDepartmentRankings(data.departmentId, data.semester, data.academicYear);

    // Publish event
    await this.eventPublisher.publish({
      type: 'result_published',
      data: {
        resultId: result._id,
        studentId: data.studentId,
        semester: data.semester,
      },
      timestamp: new Date(),
    });

    return result;
  }

  async calculateDepartmentRankings(
    departmentId: string,
    semester: Semester,
    academicYear: string
  ): Promise<void> {
    await connectMongo();

    const results = await Result.find({ departmentId, semester, academicYear });
    
    const studentGPAs = results.map(r => ({
      studentId: r.studentId,
      gpa: r.semesterGPA,
    }));

    const rankings = this.rankingStrategy.calculateRankings(studentGPAs);

    // Update each result with ranking
    for (const result of results) {
      const rank = rankings.get(result.studentId);
      if (rank) {
        result.departmentRank = rank;
        await result.save();
      }
    }
  }

  async getStudentResult(studentId: string, semester: Semester, academicYear: string): Promise<any> {
    await connectMongo();
    return Result.findOne({ studentId, semester, academicYear });
  }

  async getStudentAllResults(studentId: string): Promise<any[]> {
    await connectMongo();
    return Result.find({ studentId }).sort({ semester: 1 });
  }

  async getDepartmentRankings(
    departmentId: string,
    semester: Semester,
    academicYear: string
  ): Promise<any[]> {
    await connectMongo();
    
    return Result.find({ departmentId, semester, academicYear })
      .sort({ departmentRank: 1 })
      .select('studentId semesterGPA cumulativeCGPA departmentRank');
  }

  async calculateAssignmentBasedMarks(classroomId: string, studentId: string): Promise<{
    totalMarks: number;
    obtainedMarks: number;
  }> {
    await connectMongo();

    const assignments = await Assignment.find({ classroomId });
    const submissions = await Submission.find({ 
      assignmentId: { $in: assignments.map(a => a._id) },
      studentId,
    });

    let totalMarks = 0;
    let obtainedMarks = 0;

    for (const assignment of assignments) {
      totalMarks += assignment.maxMarks;
      
      const submission = submissions.find(
        s => s.assignmentId.toString() === assignment._id.toString()
      );
      
      if (submission && submission.marksObtained !== undefined) {
        obtainedMarks += submission.marksObtained;
      }
    }

    return { totalMarks, obtainedMarks };
  }
}
