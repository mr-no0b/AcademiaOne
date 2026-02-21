import { IAttendanceRuleStrategy } from './interfaces';

export class StandardAttendanceRuleStrategy implements IAttendanceRuleStrategy {
  private warningThreshold = 70;
  private minimumThreshold = 65;

  checkEligibility(attendancePercentage: number): { 
    eligible: boolean; 
    warning: boolean; 
    message: string 
  } {
    if (attendancePercentage < this.minimumThreshold) {
      return {
        eligible: false,
        warning: true,
        message: `Attendance is ${attendancePercentage.toFixed(1)}%. Minimum ${this.minimumThreshold}% required to sit for exam.`,
      };
    }

    if (attendancePercentage < this.warningThreshold) {
      return {
        eligible: true,
        warning: true,
        message: `Warning: Attendance is ${attendancePercentage.toFixed(1)}%. Please maintain above ${this.warningThreshold}%.`,
      };
    }

    return {
      eligible: true,
      warning: false,
      message: `Attendance is ${attendancePercentage.toFixed(1)}%. Good standing.`,
    };
  }

  getWarningThreshold(): number {
    return this.warningThreshold;
  }

  getMinimumThreshold(): number {
    return this.minimumThreshold;
  }
}
