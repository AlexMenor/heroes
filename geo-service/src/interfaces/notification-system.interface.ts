export interface NotificationSystem {
  /**
   * Notify an user about an alert
   * @param userId User to be notified
   * @param alertId Alert to be notified about
   */
  sendNotification(userId: string, alertId: string): Promise<void>;
}
