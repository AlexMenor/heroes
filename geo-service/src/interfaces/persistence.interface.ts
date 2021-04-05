import { Alert } from '../domain/alert.type';
import { Location } from '../domain/location.type';

export interface Persistence {
  writeLocation(location: Location): Promise<void>;

  checkIfUserHasActiveAlerts(userId: string): Promise<boolean>;

  insertAlert(alert: Omit<Alert, '_id'>): Promise<Alert>;

  getUsersCloseToAlert(
    alert: Alert,
    radiusDistance: number,
    maxUsers: number,
    millisecondsFromLastUpdate: number,
  ): Promise<Location[]>;
}
