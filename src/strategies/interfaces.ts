// Strategy Interfaces

// Grading Strategy
export interface IGradingStrategy {
  calculateGrade(marksObtained: number, totalMarks: number): { 
    gradePoint: number; 
    letterGrade: string 
  };
  getGradeScale(): { min: number; max: number; letter: string; point: number }[];
}

// GPA/CGPA Calculation Strategy
export interface IGPACalculationStrategy {
  calculateSemesterGPA(courseResults: { credits: number; gradePoint: number }[]): number;
  calculateCGPA(allSemesterGPAs: { semester: string; gpa: number; totalCredits: number }[]): number;
}

// Attendance Rule Strategy
export interface IAttendanceRuleStrategy {
  checkEligibility(attendancePercentage: number): { 
    eligible: boolean; 
    warning: boolean; 
    message: string 
  };
  getWarningThreshold(): number;
  getMinimumThreshold(): number;
}

// Ranking Strategy
export interface IRankingStrategy {
  calculateRankings(students: { studentId: string; gpa: number }[]): Map<string, number>;
}

// Forum Reputation Strategy
export interface IForumReputationStrategy {
  calculateReputation(data: {
    questionsAsked: number;
    answersGiven: number;
    acceptedAnswers: number;
    upvotesReceived: number;
    downvotesReceived: number;
  }): number;
  
  assignBadges(reputation: number, acceptedAnswers: number): string[];
}
