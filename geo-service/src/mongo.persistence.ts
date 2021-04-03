import { Collection, MongoClient } from 'mongodb';
import { v4 as uuid } from 'uuid';

import { Alert } from './alert.type';
import { UnknownError } from './errors';
import { Location } from './location.type';
import { Persistence } from './persistence.interface';

export default class MongoPersistence implements Persistence {
  private locations!: Collection<Location>;
  private alerts!: Collection<Alert>;
  private readonly mongoClient: MongoClient;

  constructor() {
    this.mongoClient = new MongoClient(process.env.DATABASE_URL as string, {
      useUnifiedTopology: true,
    });
    this.mongoClient.connect().then(() => {
      const db = this.mongoClient.db(process.env.DATABASE_NAME);
      this.locations = db.collection(
        process.env.LOCATION_COLLECTION_NAME as string,
      );
      this.alerts = db.collection(process.env.ALERT_COLLECTION_NAME as string);
    });
  }

  async writeLocation(location: Location): Promise<void> {
    const { _id } = location;
    await this.locations.updateOne(
      { _id },
      { $set: location },
      { upsert: true },
    );
  }

  async checkIfUserHasActiveAlerts(userId: string): Promise<boolean> {
    const count = await this.alerts.countDocuments({
      userId,
      status: 'ACTIVE',
    });
    return count > 0;
  }

  async insertAlert(alert: Omit<Alert, '_id'>): Promise<Alert> {
    const insertedAlert = { ...alert, _id: uuid() };

    const result = await this.alerts.insertOne(insertedAlert);

    if (result.insertedCount > 0) return insertedAlert;
    else throw new UnknownError();
  }

  async getUsersCloseToAlert(
    alert: Alert,
    radiusDistance: number,
    maxUsers: number,
    millisecondsFromLastUpdate: number,
  ): Promise<Location[]> {
    const alertLocation = await this.locations.findOne({ _id: alert.userId });

    const result = this.locations.find({
      loc: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: alertLocation?.loc.coordinates,
          },
          $maxDistance: radiusDistance,
        },
      },
      _id: { $not: { $eq: alert.userId } },
      updatedAt: { $gte: alert.createdAt - millisecondsFromLastUpdate },
    });

    return await result.limit(maxUsers).toArray();
  }
}