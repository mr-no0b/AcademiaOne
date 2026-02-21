import { IRankingStrategy } from './interfaces';

export class StandardRankingStrategy implements IRankingStrategy {
  calculateRankings(students: { studentId: string; gpa: number }[]): Map<string, number> {
    // Sort students by GPA in descending order
    const sorted = [...students].sort((a, b) => b.gpa - a.gpa);
    
    const rankings = new Map<string, number>();
    let currentRank = 1;
    
    for (let i = 0; i < sorted.length; i++) {
      // Handle ties: same GPA = same rank
      if (i > 0 && sorted[i].gpa === sorted[i - 1].gpa) {
        rankings.set(sorted[i].studentId, currentRank);
      } else {
        currentRank = i + 1;
        rankings.set(sorted[i].studentId, currentRank);
      }
    }
    
    return rankings;
  }
}
