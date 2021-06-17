import {
  Subscriber,
  SubscriptionCallback,
} from '../interfaces/subscriber.interface';
import Redis from 'ioredis';
import * as uuid from 'uuid';
import { Alert } from '../domain/alert.type';
import { Location } from '../domain/location.type';

export class RedisSubscriber implements Subscriber {
  private readonly redis;
  private readonly subscriptions: Map<
    string,
    Map<string, SubscriptionCallback>
  >;

  constructor() {
    this.subscriptions = new Map();

    this.redis = new Redis(
      parseInt(process.env.PUB_SUB_PORT as string),
      process.env.PUB_SUB_HOST as string,
    );

    this.redis.psubscribe('*');
    this.redis.on('pmessage', this.onMessage);
  }

  subscribe(entityId: string, callback: SubscriptionCallback): string {
    const subscriptionId = uuid.v4();

    const callbacks =
      this.subscriptions.get(entityId) ??
      new Map<string, SubscriptionCallback>();

    callbacks.set(subscriptionId, callback);

    this.subscriptions.set(entityId, callbacks);

    return subscriptionId;
  }

  unsubscribe(entityId: string, subscriptionId: string): void {
    const existing = this.subscriptions.get(entityId);

    if (existing) {
      existing.delete(subscriptionId);

      if (existing.size === 0) this.subscriptions.delete(entityId);
    }
  }

  private readonly onMessage = (
    _: string,
    entityId: string,
    message: string,
  ): void => {
    const subscriptionsOnThisEntity = this.subscriptions.get(entityId);

    if (subscriptionsOnThisEntity) {
      const entity: Alert | Location = JSON.parse(message);

      subscriptionsOnThisEntity.forEach((callback) => callback(entity));
    }
  };
}
