import { connectMongo } from '@/lib/mongodb';
import { ForumQuestion, ForumAnswer, ForumReputation } from '@/models/Forum';
import { StrategyFactory } from '@/factories';
import { getEventPublisher } from '@/observers/EventPublisher';

export class ForumFacade {
  private reputationStrategy = StrategyFactory.createForumReputationStrategy();
  private eventPublisher = getEventPublisher();

  async createQuestion(data: {
    authorId: string;
    title: string;
    content: string;
    tags: string[];
  }): Promise<any> {
    await connectMongo();

    const question = await ForumQuestion.create(data);

    // Update author's reputation
    await this.updateUserReputation(data.authorId);

    return question;
  }

  async createAnswer(data: {
    questionId: string;
    authorId: string;
    content: string;
  }): Promise<any> {
    await connectMongo();

    const answer = await ForumAnswer.create(data);

    // Update author's reputation
    await this.updateUserReputation(data.authorId);

    // Get question author
    const question = await ForumQuestion.findById(data.questionId);
    if (question) {
      await this.eventPublisher.publish({
        type: 'forum_answer_posted',
        data: {
          answerId: answer._id,
          questionId: data.questionId,
          questionAuthorId: question.authorId,
          answerAuthorId: data.authorId,
        },
        timestamp: new Date(),
      });
    }

    return answer;
  }

  async voteQuestion(questionId: string, userId: string, voteType: 'up' | 'down'): Promise<any> {
    await connectMongo();

    const question = await ForumQuestion.findById(questionId);
    if (!question) throw new Error('Question not found');

    // Remove previous vote if exists
    question.votedBy = question.votedBy.filter((v: any) => v.userId !== userId);

    // Add new vote
    if (voteType === 'up') {
      question.upvotes++;
      question.votedBy.push({ userId, vote: 'up' });
    } else {
      question.downvotes++;
      question.votedBy.push({ userId, vote: 'down' });
    }

    await question.save();

    // Update question author's reputation
    await this.updateUserReputation(question.authorId);

    return question;
  }

  async voteAnswer(answerId: string, userId: string, voteType: 'up' | 'down'): Promise<any> {
    await connectMongo();

    const answer = await ForumAnswer.findById(answerId);
    if (!answer) throw new Error('Answer not found');

    // Remove previous vote if exists
    answer.votedBy = answer.votedBy.filter((v: any) => v.userId !== userId);

    // Add new vote
    if (voteType === 'up') {
      answer.upvotes++;
      answer.votedBy.push({ userId, vote: 'up' });
    } else {
      answer.downvotes++;
      answer.votedBy.push({ userId, vote: 'down' });
    }

    await answer.save();

    // Update answer author's reputation
    await this.updateUserReputation(answer.authorId);

    return answer;
  }

  async acceptAnswer(questionId: string, answerId: string, questionAuthorId: string): Promise<any> {
    await connectMongo();

    const question = await ForumQuestion.findById(questionId);
    if (!question) throw new Error('Question not found');
    if (question.authorId !== questionAuthorId) {
      throw new Error('Only question author can accept answers');
    }

    const answer = await ForumAnswer.findById(answerId);
    if (!answer) throw new Error('Answer not found');
    if (answer.questionId !== questionId) throw new Error('Answer does not belong to this question');

    // Unaccept previous answer if exists
    if (question.acceptedAnswerId) {
      await ForumAnswer.findByIdAndUpdate(question.acceptedAnswerId, { isAccepted: false });
    }

    // Accept new answer
    question.acceptedAnswerId = answerId;
    await question.save();

    answer.isAccepted = true;
    await answer.save();

    // Update answer author's reputation
    await this.updateUserReputation(answer.authorId);

    await this.eventPublisher.publish({
      type: 'forum_answer_accepted',
      data: {
        answerId,
        questionId,
        answerAuthorId: answer.authorId,
      },
      timestamp: new Date(),
    });

    return answer;
  }

  async updateUserReputation(userId: string): Promise<any> {
    await connectMongo();

    const questions = await ForumQuestion.find({ authorId: userId });
    const answers = await ForumAnswer.find({ authorId: userId });

    const questionsAsked = questions.length;
    const answersGiven = answers.length;
    const acceptedAnswers = answers.filter(a => a.isAccepted).length;

    const upvotesReceived = 
      questions.reduce((sum, q) => sum + q.upvotes, 0) +
      answers.reduce((sum, a) => sum + a.upvotes, 0);

    const downvotesReceived = 
      questions.reduce((sum, q) => sum + q.downvotes, 0) +
      answers.reduce((sum, a) => sum + a.downvotes, 0);

    const reputation = this.reputationStrategy.calculateReputation({
      questionsAsked,
      answersGiven,
      acceptedAnswers,
      upvotesReceived,
      downvotesReceived,
    });

    const badges = this.reputationStrategy.assignBadges(reputation, acceptedAnswers);

    const userRep = await ForumReputation.findOneAndUpdate(
      { userId },
      {
        userId,
        reputation,
        badges,
        questionsAsked,
        answersGiven,
        acceptedAnswers,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return userRep;
  }

  async getQuestions(filters: {
    tags?: string[];
    authorId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ questions: any[]; total: number }> {
    await connectMongo();

    const query: any = {};
    
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    
    if (filters.authorId) {
      query.authorId = filters.authorId;
    }
    
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { content: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const questions = await ForumQuestion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ForumQuestion.countDocuments(query);

    return { questions, total };
  }

  async getQuestion(questionId: string): Promise<any> {
    await connectMongo();

    const question = await ForumQuestion.findById(questionId);
    if (!question) throw new Error('Question not found');

    // Increment views
    question.views++;
    await question.save();

    return question;
  }

  async getAnswers(questionId: string): Promise<any[]> {
    await connectMongo();
    
    return ForumAnswer.find({ questionId })
      .sort({ isAccepted: -1, upvotes: -1, createdAt: 1 });
  }

  async getUserReputation(userId: string): Promise<any> {
    await connectMongo();

    let reputation = await ForumReputation.findOne({ userId });
    
    if (!reputation) {
      reputation = await this.updateUserReputation(userId);
    }

    return reputation;
  }
}
