import { IGradingStrategy } from './interfaces';

// Standard 4.0 Scale Grading Strategy
export class StandardGradingStrategy implements IGradingStrategy {
  private gradeScale = [
    { min: 90, max: 100, letter: 'A+', point: 4.0 },
    { min: 85, max: 89, letter: 'A', point: 3.75 },
    { min: 80, max: 84, letter: 'A-', point: 3.5 },
    { min: 75, max: 79, letter: 'B+', point: 3.25 },
    { min: 70, max: 74, letter: 'B', point: 3.0 },
    { min: 65, max: 69, letter: 'B-', point: 2.75 },
    { min: 60, max: 64, letter: 'C+', point: 2.5 },
    { min: 55, max: 59, letter: 'C', point: 2.25 },
    { min: 50, max: 54, letter: 'C-', point: 2.0 },
    { min: 45, max: 49, letter: 'D', point: 1.0 },
    { min: 0, max: 44, letter: 'F', point: 0.0 },
  ];

  calculateGrade(marksObtained: number, totalMarks: number): { 
    gradePoint: number; 
    letterGrade: string 
  } {
    const percentage = (marksObtained / totalMarks) * 100;
    
    for (const grade of this.gradeScale) {
      if (percentage >= grade.min && percentage <= grade.max) {
        return {
          gradePoint: grade.point,
          letterGrade: grade.letter,
        };
      }
    }
    
    return { gradePoint: 0.0, letterGrade: 'F' };
  }

  getGradeScale() {
    return this.gradeScale;
  }
}
