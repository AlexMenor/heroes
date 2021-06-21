import { Alert } from '../domain/alert.type';
import { Location } from '../domain/location.type';

export interface Publisher {
  /**
   * Publish an entity
   * @param entity
   */
  publish(entity: Alert | Location): Promise<void>;
}
