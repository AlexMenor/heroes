import Nano from 'nano';

import { Persistence, UnknownError } from './persistence.interface';
import { Location } from './location.type';

export class CouchPersistence implements Persistence {
  private readonly db: Nano.DocumentScope<Location>;

  constructor() {
    const nano = Nano(process.env.DATABASE_URL as string);
    this.db = nano.db.use<Location>(process.env.DATABASE_NAME as string);
  }

  async writeLocation(location: Location): Promise<void> {
    let _rev: string | undefined;

    try {
      const alreadyExisting = await this.db.get(location._id);
      _rev = alreadyExisting._rev;
    } catch {
      _rev = undefined;
    }

    try {
      await this.db.insert({ ...location, _rev });
    } catch (err) {
      throw new UnknownError(err);
    }
  }
}
