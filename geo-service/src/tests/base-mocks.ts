/* eslint-disable @typescript-eslint/no-unused-vars */
import { Alert } from '../alert.type';
import { Location } from '../location.type';
import { NotificationSystem } from '../notification-system.interface';
import { Persistence } from '../persistence.interface';

export class MockPersistence implements Persistence {
  writeLocation(location: Location): Promise<void> {
    throw new Error('Method not implemented.');
  }
  checkIfUserHasActiveAlerts(userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  insertAlert(
    alert: Pick<Alert, 'userId' | 'status' | 'createdAt' | 'updatedAt'>,
  ): Promise<Alert> {
    throw new Error('Method not implemented.');
  }
  getUsersCloseToAlert(
    alert: Alert,
    radiusDistance: number,
    maxUsers: number,
    millisecondsFromLastUpdate: number,
  ): Promise<Location[]> {
    throw new Error('Method not implemented.');
  }
}

export class MockNotificationSystem implements NotificationSystem {
  sendNotification(userId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
