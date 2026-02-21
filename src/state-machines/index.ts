import { RegistrationState, ElectionState } from '@/types';

// Registration State Machine
export class RegistrationStateMachine {
  private static validTransitions: Record<RegistrationState, RegistrationState[]> = {
    draft: ['submitted', 'cancelled'],
    submitted: ['advisor_approved', 'advisor_rejected', 'cancelled'],
    advisor_approved: ['head_approved', 'head_rejected', 'cancelled'],
    advisor_rejected: ['submitted', 'cancelled'],
    head_approved: ['payment_pending', 'cancelled'],
    head_rejected: ['submitted', 'cancelled'],
    payment_pending: ['payment_completed', 'cancelled'],
    payment_completed: ['admitted'],
    admitted: [],
    cancelled: [],
  };

  static canTransition(currentState: RegistrationState, nextState: RegistrationState): boolean {
    const allowedStates = this.validTransitions[currentState];
    return allowedStates.includes(nextState);
  }

  static getValidNextStates(currentState: RegistrationState): RegistrationState[] {
    return this.validTransitions[currentState] || [];
  }

  static transition(
    currentState: RegistrationState, 
    nextState: RegistrationState
  ): { success: boolean; error?: string; newState?: RegistrationState } {
    if (!this.canTransition(currentState, nextState)) {
      return {
        success: false,
        error: `Invalid state transition from ${currentState} to ${nextState}`,
      };
    }

    return {
      success: true,
      newState: nextState,
    };
  }
}

// Election State Machine
export class ElectionStateMachine {
  private static validTransitions: Record<ElectionState, ElectionState[]> = {
    created: ['nomination_open'],
    nomination_open: ['nomination_closed'],
    nomination_closed: ['voting_open'],
    voting_open: ['voting_closed'],
    voting_closed: ['results_published'],
    results_published: [],
  };

  static canTransition(currentState: ElectionState, nextState: ElectionState): boolean {
    const allowedStates = this.validTransitions[currentState];
    return allowedStates.includes(nextState);
  }

  static getValidNextStates(currentState: ElectionState): ElectionState[] {
    return this.validTransitions[currentState] || [];
  }

  static transition(
    currentState: ElectionState, 
    nextState: ElectionState
  ): { success: boolean; error?: string; newState?: ElectionState } {
    if (!this.canTransition(currentState, nextState)) {
      return {
        success: false,
        error: `Invalid state transition from ${currentState} to ${nextState}`,
      };
    }

    return {
      success: true,
      newState: nextState,
    };
  }

  static autoTransitionBasedOnTime(
    currentState: ElectionState,
    nominationStart: Date,
    nominationEnd: Date,
    votingStart: Date,
    votingEnd: Date
  ): ElectionState {
    const now = new Date();

    switch (currentState) {
      case 'created':
        if (now >= nominationStart) return 'nomination_open';
        break;
      case 'nomination_open':
        if (now >= nominationEnd) return 'nomination_closed';
        break;
      case 'nomination_closed':
        if (now >= votingStart) return 'voting_open';
        break;
      case 'voting_open':
        if (now >= votingEnd) return 'voting_closed';
        break;
    }

    return currentState;
  }
}
