import { Alert } from './domain/alert.type';
import { ConflictError, ErrorType } from './domain/errors';
import { Location } from './domain/location.type';
import { NotificationSystem } from './interfaces/notification-system.interface';
import { Persistence } from './interfaces/persistence.interface';

export default class Service {
  private readonly ALERT_RADIUS_DISTANCE_IN_METERS = 500;
  private readonly MAX_USERS_TO_NOTIFY = 50;
  private readonly MILLISECONDS_FROM_LAST_UPDATE = 1000 * 60 * 30;
  private readonly MILLISECONDS_TO_SET_ALERT_AS_INACTIVE = 1000 * 60 * 5;

  constructor(
    private readonly persistence: Persistence,
    private readonly notificationSystem: NotificationSystem,
  ) {}

  async writeLocation(location: Location): Promise<void> {
    await this.persistence.writeLocation(location);
  }

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

  async setAlertInactive(alertId: string): Promise<void> {
    await this.persistence.setAlertInactive(alertId);
  }

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
