import 'dotenv/config';

import app from './app';
import { CouchPersistence } from './couch-persistence';
import Service from './service';

app.set('service', new Service(new CouchPersistence()));

const { PORT } = process.env;

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
