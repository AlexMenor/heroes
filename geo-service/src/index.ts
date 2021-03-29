import 'dotenv/config';

import app from './app';
import Service from './service';

import MongoPersistance from './mongo.persistence';

const mongoPersistance = new MongoPersistance();

app.set('service', new Service(mongoPersistance));

const { PORT } = process.env;

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
