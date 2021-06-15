import { Alert } from '../domain/alert.type';
import { Location } from '../domain/location.type';

export interface Publisher {
  publish(entity: Alert | Location): Promise<void>;
}
