import { INotificationAdapter } from './interfaces';

// Console Notification Adapter - logs notifications to console
export class ConsoleNotificationAdapter implements INotificationAdapter {
  async sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean }> {
    console.log('📧 Email Notification:', { to, subject, body });
    return { success: true };
  }

  async sendSMS(to: string, message: string): Promise<{ success: boolean }> {
    console.log('📱 SMS Notification:', { to, message });
    return { success: true };
  }

  async sendPushNotification(userId: string, title: string, body: string): Promise<{ success: boolean }> {
    console.log('🔔 Push Notification:', { userId, title, body });
    return { success: true };
  }
}

// Future: Real notification adapters
export class SendGridNotificationAdapter implements INotificationAdapter {
  async sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean }> {
    // TODO: Integrate with SendGrid
    throw new Error('SendGrid integration not yet implemented');
  }

  async sendSMS(to: string, message: string): Promise<{ success: boolean }> {
    // TODO: Integrate with Twilio
    throw new Error('Twilio integration not yet implemented');
  }

  async sendPushNotification(userId: string, title: string, body: string): Promise<{ success: boolean }> {
    // TODO: Integrate with Firebase Cloud Messaging
    throw new Error('FCM integration not yet implemented');
  }
}
