import { Notification } from '@/models/Common';
import { INotificationAdapter } from '@/adapters/interfaces';

// Event types
export type EventType = 
  | 'registration_submitted'
  | 'registration_advisor_approved'
  | 'registration_advisor_rejected'
  | 'registration_head_approved'
  | 'registration_head_rejected'
  | 'registration_admitted'
  | 'attendance_warning'
  | 'attendance_critical'
  | 'assignment_created'
  | 'assignment_graded'
  | 'result_published'
  | 'forum_answer_posted'
  | 'forum_answer_accepted'
  | 'election_candidate_approved'
  | 'election_voting_started'
  | 'notice_published'
  | 'announcement_created';

export interface Event {
  type: EventType;
  data: any;
  triggeredBy?: string;
  timestamp: Date;
}

// Observer interface
export interface IEventObserver {
  handle(event: Event): Promise<void>;
}

// Event Publisher (Observable)
export class EventPublisher {
  private observers: Map<EventType, IEventObserver[]> = new Map();

  subscribe(eventType: EventType, observer: IEventObserver): void {
    if (!this.observers.has(eventType)) {
      this.observers.set(eventType, []);
    }
    this.observers.get(eventType)!.push(observer);
  }

  unsubscribe(eventType: EventType, observer: IEventObserver): void {
    const observers = this.observers.get(eventType);
    if (observers) {
      const index = observers.indexOf(observer);
      if (index > -1) {
        observers.splice(index, 1);
      }
    }
  }

  async publish(event: Event): Promise<void> {
    const observers = this.observers.get(event.type) || [];
    
    // Execute all observers in parallel
    await Promise.all(
      observers.map(observer => 
        observer.handle(event).catch(err => {
          console.error(`Observer failed for event ${event.type}:`, err);
        })
      )
    );
  }
}

// Notification Observer - creates in-app notifications
export class NotificationObserver implements IEventObserver {
  async handle(event: Event): Promise<void> {
    const notifications = this.createNotifications(event);
    
    for (const notif of notifications) {
      await Notification.create(notif);
    }
  }

  private createNotifications(event: Event): Array<{
    recipientId: string;
    type: string;
    title: string;
    message: string;
    relatedEntity?: { type: string; id: string };
  }> {
    switch (event.type) {
      case 'registration_submitted':
        return [{
          recipientId: event.data.advisorId,
          type: 'registration_approval',
          title: 'New Registration Request',
          message: `Student ${event.data.studentId} submitted registration for ${event.data.semester}`,
          relatedEntity: { type: 'registration', id: event.data.registrationId },
        }];

      case 'registration_advisor_approved':
        return [
          {
            recipientId: event.data.studentId,
            type: 'registration_update',
            title: 'Registration Approved by Advisor',
            message: 'Your registration has been approved by your advisor. Awaiting department head approval.',
            relatedEntity: { type: 'registration', id: event.data.registrationId },
          },
          {
            recipientId: event.data.headId,
            type: 'registration_approval',
            title: 'Registration Needs Approval',
            message: `Registration for ${event.data.studentId} requires your approval`,
            relatedEntity: { type: 'registration', id: event.data.registrationId },
          }
        ];

      case 'registration_head_approved':
        return [{
          recipientId: event.data.studentId,
          type: 'registration_update',
          title: 'Registration Approved',
          message: 'Your registration has been approved! Please proceed with payment.',
          relatedEntity: { type: 'registration', id: event.data.registrationId },
        }];

      case 'attendance_warning':
        return [{
          recipientId: event.data.studentId,
          type: 'attendance_alert',
          title: 'Attendance Warning',
          message: event.data.message,
          relatedEntity: { type: 'classroom', id: event.data.classroomId },
        }];

      case 'assignment_created':
        return event.data.studentIds.map((studentId: string) => ({
          recipientId: studentId,
          type: 'assignment',
          title: 'New Assignment',
          message: `New assignment: ${event.data.title}. Due: ${event.data.dueDate}`,
          relatedEntity: { type: 'assignment', id: event.data.assignmentId },
        }));

      case 'result_published':
        return [{
          recipientId: event.data.studentId,
          type: 'result',
          title: 'Results Published',
          message: `Your ${event.data.semester} results have been published`,
          relatedEntity: { type: 'result', id: event.data.resultId },
        }];

      default:
        return [];
    }
  }
}

// Email Notification Observer - sends email notifications
export class EmailNotificationObserver implements IEventObserver {
  constructor(private notificationAdapter: INotificationAdapter) {}

  async handle(event: Event): Promise<void> {
    // TODO: Implement email notifications based on event type
    console.log('Email notification for event:', event.type);
  }
}

// Singleton Event Publisher
let eventPublisherInstance: EventPublisher | null = null;

export function getEventPublisher(): EventPublisher {
  if (!eventPublisherInstance) {
    eventPublisherInstance = new EventPublisher();
    
    // Register default observers
    const notificationObserver = new NotificationObserver();
    
    const eventTypes: EventType[] = [
      'registration_submitted',
      'registration_advisor_approved',
      'registration_advisor_rejected',
      'registration_head_approved',
      'registration_head_rejected',
      'registration_admitted',
      'attendance_warning',
      'attendance_critical',
      'assignment_created',
      'assignment_graded',
      'result_published',
      'forum_answer_posted',
      'forum_answer_accepted',
      'election_candidate_approved',
      'election_voting_started',
      'notice_published',
      'announcement_created',
    ];
    
    eventTypes.forEach(type => {
      eventPublisherInstance!.subscribe(type, notificationObserver);
    });
  }
  
  return eventPublisherInstance;
}
