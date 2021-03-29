import { Collection, MongoClient } from 'mongodb';
import { Location } from './location.type';
import { Persistence } from './persistence.interface';

export default class MongoPersistence implements Persistence {
  private db!: Collection<Location>;
  private readonly mongoClient: MongoClient;

  constructor() {
    this.mongoClient = new MongoClient(process.env.DATABASE_URL as string, {
      useUnifiedTopology: true,
    });
    this.mongoClient
      .connect()
      .then(
        () =>
          (this.db = this.mongoClient
            .db(process.env.DATABASE_NAME)
            .collection(process.env.COLLECTION_NAME as string)),
      );
  }

  async writeLocation(location: Location): Promise<void> {
    const { _id } = location;
    await this.db.updateOne({ _id }, { $set: location }, { upsert: true });
  }
}
