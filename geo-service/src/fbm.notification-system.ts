import { NotificationSystem } from './notification-system.interface';
import admin, { messaging, ServiceAccount } from 'firebase-admin';

import key from '../serviceAccountKey.json';

export class FBMNotificationSystem implements NotificationSystem {
  private readonly messaging: messaging.Messaging;
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(key as ServiceAccount),
    });
    this.messaging = admin.messaging();
  }
  async sendNotification(userId: string): Promise<void> {
    await this.messaging.sendToDevice(userId, {
      notification: { body: 'alert' },
    });
  }
}
