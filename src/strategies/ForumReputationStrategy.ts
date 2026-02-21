import { IForumReputationStrategy } from './interfaces';

export class StandardForumReputationStrategy implements IForumReputationStrategy {
  calculateReputation(data: {
    questionsAsked: number;
    answersGiven: number;
    acceptedAnswers: number;
    upvotesReceived: number;
    downvotesReceived: number;
  }): number {
    let reputation = 0;
    
    // Points for questions asked
    reputation += data.questionsAsked * 5;
    
    // Points for answers given
    reputation += data.answersGiven * 10;
    
    // Points for accepted answers
    reputation += data.acceptedAnswers * 25;
    
    // Points for upvotes
    reputation += data.upvotesReceived * 10;
    
    // Penalty for downvotes
    reputation -= data.downvotesReceived * 2;
    
    return Math.max(0, reputation);
  }

  assignBadges(reputation: number, acceptedAnswers: number): string[] {
    const badges: string[] = ['newcomer'];
    
    if (reputation >= 100 || acceptedAnswers >= 5) {
      badges.push('contributor');
    }
    
    if (reputation >= 500 || acceptedAnswers >= 20) {
      badges.push('expert');
    }
    
    if (reputation >= 1000 || acceptedAnswers >= 50) {
      badges.push('moderator');
    }
    
    return badges;
  }
}
