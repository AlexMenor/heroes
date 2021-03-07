import { Location } from './location.type';
import { Persistence } from './persistence.interface';

export default class Service {
  constructor(private readonly persistence: Persistence) {}

  async writeLocation(location: Location): Promise<void> {
    await this.persistence.writeLocation(location);
  }
}
