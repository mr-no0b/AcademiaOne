import { connectMongo } from '@/lib/mongodb';
import { Attendance } from '@/models/Attendance';
import { Classroom } from '@/models/Classroom';
import { StrategyFactory } from '@/factories';
import { getEventPublisher } from '@/observers/EventPublisher';

export class AttendanceFacade {
  private attendanceStrategy = StrategyFactory.createAttendanceRuleStrategy();
  private eventPublisher = getEventPublisher();

  async markAttendance(data: {
    classroomId: string;
    teacherId: string;
    date: Date;
    lectureNumber: number;
    presentStudents: string[];
    absentStudents: string[];
  }): Promise<any> {
    await connectMongo();

    const attendance = await Attendance.create(data);

    // Check for warnings
    for (const studentId of data.absentStudents) {
      const stats = await this.getStudentAttendanceStats(data.classroomId, studentId);
      const check = this.attendanceStrategy.checkEligibility(stats.percentage);
      
      if (check.warning) {
        await this.eventPublisher.publish({
          type: check.eligible ? 'attendance_warning' : 'attendance_critical',
          data: {
            studentId,
            classroomId: data.classroomId,
            percentage: stats.percentage,
            message: check.message,
          },
          timestamp: new Date(),
        });
      }
    }

    return attendance;
  }

  async getAttendanceByClassroom(classroomId: string): Promise<any[]> {
    await connectMongo();
    return Attendance.find({ classroomId }).sort({ date: -1, lectureNumber: -1 });
  }

  async getStudentAttendanceStats(classroomId: string, studentId: string): Promise<{
    totalLectures: number;
    attended: number;
    absent: number;
    percentage: number;
    eligible: boolean;
    warning: boolean;
    message: string;
  }> {
    await connectMongo();

    const attendanceRecords = await Attendance.find({ classroomId });
    
    let attended = 0;
    let absent = 0;

    for (const record of attendanceRecords) {
      if (record.presentStudents.includes(studentId)) {
        attended++;
      } else if (record.absentStudents.includes(studentId)) {
        absent++;
      }
    }

    const totalLectures = attended + absent;
    const percentage = totalLectures > 0 ? (attended / totalLectures) * 100 : 0;

    const eligibility = this.attendanceStrategy.checkEligibility(percentage);

    return {
      totalLectures,
      attended,
      absent,
      percentage,
      eligible: eligibility.eligible,
      warning: eligibility.warning,
      message: eligibility.message,
    };
  }

  async getStudentAttendanceForAllClassrooms(studentId: string): Promise<any[]> {
    await connectMongo();

    const classrooms = await Classroom.find({ enrolledStudents: studentId });
    
    const stats = await Promise.all(
      classrooms.map(async (classroom) => {
        const attendanceStats = await this.getStudentAttendanceStats(
          classroom._id.toString(), 
          studentId
        );
        
        return {
          classroom,
          ...attendanceStats,
        };
      })
    );

    return stats;
  }

  async updateTotalPlannedClasses(classroomId: string, totalClasses: number): Promise<any> {
    await connectMongo();

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) throw new Error('Classroom not found');

    classroom.totalPlannedClasses = totalClasses;
    await classroom.save();

    return classroom;
  }
}
