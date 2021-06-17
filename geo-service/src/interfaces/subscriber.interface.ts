import { Alert } from '../domain/alert.type';
import { Location } from '../domain/location.type';

export type SubscriptionCallback = (entity: Alert | Location) => void;

export interface Subscriber {
  /**
   *
   * @param entityId Id of the entity (Alert or Location) to get updates about
   * @param callback Function to be called once an update happens
   * @returns The subscriptionId (to handle the unsubscription)
   */
  subscribe(entityId: string, callback: SubscriptionCallback): string;
  /**
   *
   * @param entityId Id of the entity this subscription was on
   * @param subscriptionId
   */
  unsubscribe(entityId: string, subscriptionId: string): void;
}
