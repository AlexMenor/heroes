import 'dotenv/config';

import app from './app';
import Service from './service';

import MongoPersistance from './implementations/mongo.persistence';
import { FBMNotificationSystem } from './implementations/fbm.notification-system';

const mongoPersistance = new MongoPersistance();
const fbmNotifications = new FBMNotificationSystem();

app.set('service', new Service(mongoPersistance, fbmNotifications));

const { PORT } = process.env;

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
