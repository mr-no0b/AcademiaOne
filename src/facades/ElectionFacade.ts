import { connectMongo } from '@/lib/mongodb';
import { Election, Candidate, Vote } from '@/models/Election';
import { ElectionStateMachine } from '@/state-machines';
import { getEventPublisher } from '@/observers/EventPublisher';

export class ElectionFacade {
  private eventPublisher = getEventPublisher();

  async createElection(data: {
    departmentId: string;
    title: string;
    description: string;
    nominationStartDate: Date;
    nominationEndDate: Date;
    votingStartDate: Date;
    votingEndDate: Date;
    createdBy: string;
  }): Promise<any> {
    await connectMongo();

    const election = await Election.create({
      ...data,
      state: 'created',
    });

    return election;
  }

  async transitionElectionState(electionId: string, newState: any): Promise<any> {
    await connectMongo();

    const election = await Election.findById(electionId);
    if (!election) throw new Error('Election not found');

    const transition = ElectionStateMachine.transition(election.state, newState);
    if (!transition.success) throw new Error(transition.error);

    election.state = newState;
    await election.save();

    if (newState === 'voting_open') {
      await this.eventPublisher.publish({
        type: 'election_voting_started',
        data: {
          electionId: election._id,
          departmentId: election.departmentId,
          title: election.title,
        },
        timestamp: new Date(),
      });
    }

    return election;
  }

  async applyAsCandidate(data: {
    electionId: string;
    studentId: string;
    manifesto: string;
  }): Promise<any> {
    await connectMongo();

    const election = await Election.findById(data.electionId);
    if (!election) throw new Error('Election not found');
    if (election.state !== 'nomination_open') {
      throw new Error('Nomination period is not open');
    }

    // Check if already applied
    const existing = await Candidate.findOne({ 
      electionId: data.electionId, 
      studentId: data.studentId 
    });
    if (existing) throw new Error('Already applied for this election');

    const candidate = await Candidate.create(data);
    return candidate;
  }

  async approveCandidate(candidateId: string, teacherId: string): Promise<any> {
    await connectMongo();

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) throw new Error('Candidate not found');

    candidate.isApproved = true;
    candidate.approvedBy = teacherId;
    candidate.approvedAt = new Date();
    await candidate.save();

    await this.eventPublisher.publish({
      type: 'election_candidate_approved',
      data: {
        candidateId: candidate._id,
        electionId: candidate.electionId,
        studentId: candidate.studentId,
      },
      timestamp: new Date(),
    });

    return candidate;
  }

  async rejectCandidate(candidateId: string): Promise<any> {
    await connectMongo();

    const candidate = await Candidate.findByIdAndDelete(candidateId);
    return candidate;
  }

  async castVote(electionId: string, voterId: string, candidateId: string): Promise<any> {
    await connectMongo();

    const election = await Election.findById(electionId);
    if (!election) throw new Error('Election not found');
    if (election.state !== 'voting_open') {
      throw new Error('Voting is not open');
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) throw new Error('Candidate not found');
    if (!candidate.isApproved) throw new Error('Candidate not approved');

    // Check if already voted
    const existingVote = await Vote.findOne({ electionId, voterId });
    if (existingVote) throw new Error('Already voted in this election');

    // Create vote
    const vote = await Vote.create({
      electionId,
      voterId,
      candidateId,
    });

    // Increment vote count
    candidate.voteCount++;
    await candidate.save();

    return { success: true, message: 'Vote cast successfully' };
  }

  async getElectionResults(electionId: string): Promise<any> {
    await connectMongo();

    const election = await Election.findById(electionId);
    if (!election) throw new Error('Election not found');

    const candidates = await Candidate.find({ 
      electionId, 
      isApproved: true 
    }).sort({ voteCount: -1 });

    const totalVotes = await Vote.countDocuments({ electionId });

    return {
      election,
      candidates,
      totalVotes,
      results: candidates.map((c, index) => ({
        rank: index + 1,
        candidateId: c._id,
        studentId: c.studentId,
        voteCount: c.voteCount,
        votePercentage: totalVotes > 0 ? (c.voteCount / totalVotes) * 100 : 0,
      })),
    };
  }

  async publishResults(electionId: string): Promise<any> {
    await connectMongo();

    const election = await Election.findById(electionId);
    if (!election) throw new Error('Election not found');

    const transition = ElectionStateMachine.transition(election.state, 'results_published');
    if (!transition.success) throw new Error(transition.error);

    election.state = 'results_published';
    await election.save();

    return this.getElectionResults(electionId);
  }

  async getElections(departmentId?: string): Promise<any[]> {
    await connectMongo();

    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;

    return Election.find(filter).sort({ createdAt: -1 });
  }

  async getCandidates(electionId: string, approvedOnly: boolean = false): Promise<any[]> {
    await connectMongo();

    const filter: any = { electionId };
    if (approvedOnly) filter.isApproved = true;

    return Candidate.find(filter).sort({ createdAt: 1 });
  }

  async hasVoted(electionId: string, voterId: string): Promise<boolean> {
    await connectMongo();

    const vote = await Vote.findOne({ electionId, voterId });
    return !!vote;
  }
}
