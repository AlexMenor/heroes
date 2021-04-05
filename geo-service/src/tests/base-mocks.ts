/* eslint-disable @typescript-eslint/no-unused-vars */
import { Alert } from '../domain/alert.type';
import { Location } from '../domain/location.type';
import { NotificationSystem } from '../interfaces/notification-system.interface';
import { Persistence } from '../interfaces/persistence.interface';

export class MockPersistence implements Persistence {
  getAlert(alertId: string): Promise<Alert> {
    throw new Error('Method not implemented.');
  }
  getLocation(locationId: string): Promise<Location> {
    throw new Error('Method not implemented.');
  }
  setAlertInactive(alertId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
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
