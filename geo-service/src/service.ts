import { Alert } from './domain/alert.type';
import { ConflictError, ErrorType } from './domain/errors';
import { Location } from './domain/location.type';
import { NotificationSystem } from './interfaces/notification-system.interface';
import { Persistence } from './interfaces/persistence.interface';
import { Publisher } from './interfaces/publisher.interface';

export default class Service {
  /**
   * Defines the radius in meters that users have to be in
   * to be notified about an alert.
   */
  private readonly ALERT_RADIUS_DISTANCE_IN_METERS = 500;

  /**
   * Max users to be notified about an alert
   */
  private readonly MAX_USERS_TO_NOTIFY = 50;

  /**
   * Inactivity threshold to exclude users that didn't
   * updated their location for a while to be notified about an alert
   */
  private readonly MILLISECONDS_FROM_LAST_UPDATE = 1000 * 60 * 30;

  /**
   * If an user that creaeted an alert does not update their location
   * in this amount of milliseconds, the alert is set as inactive.
   */
  private readonly MILLISECONDS_TO_SET_ALERT_AS_INACTIVE = 1000 * 60 * 5;

  constructor(
    private readonly persistence: Persistence,
    private readonly notificationSystem: NotificationSystem,
    private readonly publisher: Publisher,
  ) {}

  /**
   * Persist an user's location
   * @param location
   */
  async writeLocation(location: Location): Promise<void> {
    await this.persistence.writeLocation(location);
    this.publisher.publish(location);
  }

  /**
   * If the user has no ongoing alert, creates one.
   * Also activates a job that checks if the user has stopped
   * updating their location each $MILLISECONDS_TO_SET_ALERT_AS_INACTIVE, if so, sets the alert to inactive.
   * When the alert is created, users that updated their location less than $MILLISECONDS_FROM_LAST_UPDATE ago
   * and that are located within a radius of $ALERT_RADIUS_DISTANCE_OF_METERS are notified via the notification service.
   * @param userId
   */
  async createAlert(userId: string): Promise<Alert> {
    const userHasAnyActiveAlert = await this.persistence.checkIfUserHasActiveAlerts(
      userId,
    );

    if (userHasAnyActiveAlert)
      throw new ConflictError('User has an alert already going on');

    const timestamp = new Date().getTime();

    const createdAlert = await this.persistence.insertAlert({
      userId,
      status: 'ACTIVE',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    this.setAlertInactiveIfUserStoppedUpdating(createdAlert);

    const closeToAlertUsers = await this.persistence.getUsersCloseToAlert(
      createdAlert,
      this.ALERT_RADIUS_DISTANCE_IN_METERS,
      this.MAX_USERS_TO_NOTIFY,
      this.MILLISECONDS_FROM_LAST_UPDATE,
    );

    const notifications = closeToAlertUsers.map((location) =>
      this.notificationSystem.sendNotification(location._id, createdAlert._id),
    );

    await Promise.all(notifications);

    return createdAlert;
  }

  /**
   * Persist an alert as inactive and notifies potential
   * listeners via the subscription system
   * @param alertId
   */
  async setAlertInactive(alertId: string): Promise<void> {
    await this.persistence.setAlertInactive(alertId);
    this.publisher.publish(await this.persistence.getAlert(alertId));
  }

  /**
   * Job that checks every $MILLISECONDS_TO_SET_ALERT_INACTIVE
   * if the user that created an active alert is updating their location
   * @param alert
   */
  private async setAlertInactiveIfUserStoppedUpdating(
    alert: Alert,
  ): Promise<void> {
    try {
      const updatedAlert = await this.persistence.getAlert(alert._id);

      const alertIsAlreadyInactive = updatedAlert.status === 'INACTIVE';

      if (alertIsAlreadyInactive) return;

      const location = await this.persistence.getLocation(updatedAlert.userId);

      const locationIsNotUpdatedRecently =
        location.updatedAt <
        new Date().getTime() - this.MILLISECONDS_TO_SET_ALERT_AS_INACTIVE;

      if (locationIsNotUpdatedRecently) {
        await this.persistence.setAlertInactive(updatedAlert._id);
        return;
      }

      setTimeout(
        () => this.setAlertInactiveIfUserStoppedUpdating(updatedAlert),
        this.MILLISECONDS_TO_SET_ALERT_AS_INACTIVE,
      );
    } catch (err) {
      if (err.name === ('Not Found Error' as ErrorType))
        console.log(
          'Alert or location not found when checking if its inactive',
        );
      else
        console.log(
          'Unknown error when checking if the alert its innactive',
          err,
        );
    }
  }

  getAlert(alertId: string): Promise<Alert> {
    return this.persistence.getAlert(alertId);
  }

  getLocation(locationId: string): Promise<Location> {
    return this.persistence.getLocation(locationId);
  }
}
