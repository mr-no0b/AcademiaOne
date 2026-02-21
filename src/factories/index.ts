import { 
  IGradingStrategy, 
  IGPACalculationStrategy, 
  IAttendanceRuleStrategy, 
  IRankingStrategy, 
  IForumReputationStrategy 
} from '@/strategies/interfaces';
import { StandardGradingStrategy } from '@/strategies/GradingStrategy';
import { StandardGPACalculationStrategy } from '@/strategies/GPACalculationStrategy';
import { StandardAttendanceRuleStrategy } from '@/strategies/AttendanceRuleStrategy';
import { StandardRankingStrategy } from '@/strategies/RankingStrategy';
import { StandardForumReputationStrategy } from '@/strategies/ForumReputationStrategy';

import { IPaymentAdapter, IStorageAdapter, INotificationAdapter } from '@/adapters/interfaces';
import { MockPaymentAdapter } from '@/adapters/PaymentAdapter';
import { DriveLinkStorageAdapter } from '@/adapters/StorageAdapter';
import { ConsoleNotificationAdapter } from '@/adapters/NotificationAdapter';

// Strategy Factory
export class StrategyFactory {
  static createGradingStrategy(type: string = 'standard'): IGradingStrategy {
    switch (type) {
      case 'standard':
        return new StandardGradingStrategy();
      default:
        return new StandardGradingStrategy();
    }
  }

  static createGPACalculationStrategy(type: string = 'standard'): IGPACalculationStrategy {
    switch (type) {
      case 'standard':
        return new StandardGPACalculationStrategy();
      default:
        return new StandardGPACalculationStrategy();
    }
  }

  static createAttendanceRuleStrategy(type: string = 'standard'): IAttendanceRuleStrategy {
    switch (type) {
      case 'standard':
        return new StandardAttendanceRuleStrategy();
      default:
        return new StandardAttendanceRuleStrategy();
    }
  }

  static createRankingStrategy(type: string = 'standard'): IRankingStrategy {
    switch (type) {
      case 'standard':
        return new StandardRankingStrategy();
      default:
        return new StandardRankingStrategy();
    }
  }

  static createForumReputationStrategy(type: string = 'standard'): IForumReputationStrategy {
    switch (type) {
      case 'standard':
        return new StandardForumReputationStrategy();
      default:
        return new StandardForumReputationStrategy();
    }
  }
}

// Adapter Factory
export class AdapterFactory {
  static createPaymentAdapter(type: string = 'mock'): IPaymentAdapter {
    switch (type) {
      case 'mock':
        return new MockPaymentAdapter();
      case 'stripe':
        // return new StripePaymentAdapter();
        throw new Error('Stripe adapter not yet implemented');
      default:
        return new MockPaymentAdapter();
    }
  }

  static createStorageAdapter(type: string = 'drive'): IStorageAdapter {
    switch (type) {
      case 'drive':
        return new DriveLinkStorageAdapter();
      case 's3':
        // return new S3StorageAdapter();
        throw new Error('S3 adapter not yet implemented');
      case 'cloudinary':
        // return new CloudinaryStorageAdapter();
        throw new Error('Cloudinary adapter not yet implemented');
      default:
        return new DriveLinkStorageAdapter();
    }
  }

  static createNotificationAdapter(type: string = 'console'): INotificationAdapter {
    switch (type) {
      case 'console':
        return new ConsoleNotificationAdapter();
      case 'sendgrid':
        // return new SendGridNotificationAdapter();
        throw new Error('SendGrid adapter not yet implemented');
      default:
        return new ConsoleNotificationAdapter();
    }
  }
}
