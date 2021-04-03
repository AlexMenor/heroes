export interface NotificationSystem {
  sendNotification(userId: string): Promise<void>;
}
