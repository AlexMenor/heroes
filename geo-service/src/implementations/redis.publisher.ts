import { Alert } from '../domain/alert.type';
import { Location } from '../domain/location.type';
import { Publisher } from '../interfaces/publisher.interface';
import Redis from 'ioredis';

export class RedisPublisher implements Publisher {
  private readonly redis;

  constructor() {
    this.redis = new Redis(
      parseInt(process.env.PUB_SUB_PORT as string),
      process.env.PUB_SUB_HOST as string,
    );
  }

  async publish(entity: Alert | Location): Promise<void> {
    this.redis.publish(entity._id, JSON.stringify(entity));
  }
}
