export interface NotificationSystem {
  sendNotification(userId: string, alertId: string): Promise<void>;
}
