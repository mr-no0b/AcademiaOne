// Adapter Interfaces

// Payment Adapter
export interface IPaymentAdapter {
  initiatePayment(data: { 
    amount: number; 
    studentId: string; 
    registrationId: string;
    description: string;
  }): Promise<{ 
    success: boolean; 
    paymentId: string; 
    paymentUrl?: string;
  }>;

  verifyPayment(paymentId: string): Promise<{ 
    success: boolean; 
    status: 'pending' | 'completed' | 'failed';
  }>;
}

// Storage Adapter
export interface IStorageAdapter {
  generateUploadUrl(fileName: string, fileType: string): Promise<{ 
    uploadUrl: string; 
    fileUrl: string;
  }>;

  deleteFile(fileUrl: string): Promise<{ success: boolean }>;
}

// Notification Adapter
export interface INotificationAdapter {
  sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean }>;
  sendSMS(to: string, message: string): Promise<{ success: boolean }>;
  sendPushNotification(userId: string, title: string, body: string): Promise<{ success: boolean }>;
}
