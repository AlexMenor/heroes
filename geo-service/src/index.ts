import 'dotenv/config';

import express from 'express';

import { body, validationResult } from 'express-validator';
import { CouchPersistence } from './couch-persistence';

import Service from './service';

const app = express();
app.use(express.json());

const service = new Service(new CouchPersistence());

app.post('/location/:id', body('latLong').isLatLong(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const [lat, long] = req.body.latLong.split(',');

  const location = {
    _id: (req.params as Record<string, string>).id,
    lat: parseFloat(lat),
    long: parseFloat(long),
    updatedAt: new Date().getTime(),
  };

  try {
    await service.writeLocation(location);
    return res.status(200).end();
  } catch(err) {
    if (err.stack.statusCode === 409)
      return res.status(409).send('Users location was already being updated, try again');
    else
      return res.status(500).send('An unknown error ocurred');
  }
});

const { PORT } = process.env;

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
