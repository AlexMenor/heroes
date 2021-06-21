import { Alert } from '../domain/alert.type';
import { Location } from '../domain/location.type';

export interface Persistence {
  /**
   * Update users location
   * @param location
   */
  writeLocation(location: Location): Promise<void>;

  /**
   * Returns true if the user has another active alert ongoing
   * @param userId
   */
  checkIfUserHasActiveAlerts(userId: string): Promise<boolean>;

  /**
   * Insert alert details
   * @param alert
   * @throws UnknownError if the insertion somehow fails
   */
  insertAlert(alert: Omit<Alert, '_id'>): Promise<Alert>;

  /**
   * Returns an array with at most $maxUsers users
   * at $radiusDistance of less distance to the user
   * that created $alert and who have updated their position at most
   * $millisecondsFromLastUpdate ms ago
   * @param alert
   * @param radiusDistance
   * @param maxUsers
   * @param millisecondsFromLastUpdate
   */
  getUsersCloseToAlert(
    alert: Alert,
    radiusDistance: number,
    maxUsers: number,
    millisecondsFromLastUpdate: number,
  ): Promise<Location[]>;

  /**
   * Returns the alert with id $alertId
   * @param alertId
   * @throws NotFoundError if the alert is not found
   */
  getAlert(alertId: string): Promise<Alert>;

  /**
   * Returns the location with id $locationId
   * @param locationId
   * @throws NotFoundError if the location is not found
   */
  getLocation(locationId: string): Promise<Location>;

  /**
   * Set an alert as inactive
   * @param alertId
   * @throws NotFoundError if the alert is not found
   */
  setAlertInactive(alertId: string): Promise<void>;
}
