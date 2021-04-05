import { Alert } from './domain/alert.type';
import { ConflictError } from './domain/errors';
import { Location } from './domain/location.type';
import { NotificationSystem } from './interfaces/notification-system.interface';
import { Persistence } from './interfaces/persistence.interface';

export default class Service {
  private readonly ALERT_RADIUS_DISTANCE_IN_METERS = 500;
  private readonly MAX_USERS_TO_NOTIFY = 50;
  private readonly MILLISECONDS_FROM_LAST_UPDATE = 1800000;

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

    const closeToAlertUsers = await this.persistence.getUsersCloseToAlert(
      createdAlert,
      this.ALERT_RADIUS_DISTANCE_IN_METERS,
      this.MAX_USERS_TO_NOTIFY,
      this.MILLISECONDS_FROM_LAST_UPDATE,
    );

    const notifications = closeToAlertUsers.map((location) =>
      this.notificationSystem.sendNotification(location._id),
    );

    await Promise.all(notifications);

    return createdAlert;
  }
}
