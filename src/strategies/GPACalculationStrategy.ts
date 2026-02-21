import { IGPACalculationStrategy } from './interfaces';

export class StandardGPACalculationStrategy implements IGPACalculationStrategy {
  calculateSemesterGPA(courseResults: { credits: number; gradePoint: number }[]): number {
    if (courseResults.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    for (const course of courseResults) {
      totalPoints += course.credits * course.gradePoint;
      totalCredits += course.credits;
    }

    if (totalCredits === 0) return 0;

    return Math.round((totalPoints / totalCredits) * 100) / 100;
  }

  calculateCGPA(allSemesterGPAs: { semester: string; gpa: number; totalCredits: number }[]): number {
    if (allSemesterGPAs.length === 0) return 0;

    let totalWeightedGPA = 0;
    let totalCredits = 0;

    for (const semesterData of allSemesterGPAs) {
      totalWeightedGPA += semesterData.gpa * semesterData.totalCredits;
      totalCredits += semesterData.totalCredits;
    }

    if (totalCredits === 0) return 0;

    return Math.round((totalWeightedGPA / totalCredits) * 100) / 100;
  }
}
