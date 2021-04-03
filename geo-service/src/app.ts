import express from 'express';

import { body, validationResult } from 'express-validator';
import { ErrorType } from './errors';
import { Location } from './location.type';

import Service from './service';

const app = express();
app.use(express.json());

app.post('/location/:id', body('latLong').isLatLong(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const [lat, long] = req.body.latLong.split(',');

  const location: Location = {
    _id: (req.params as Record<string, string>).id,
    loc: {
      type: 'Point',
      coordinates: [parseFloat(long), parseFloat(lat)],
    },
    updatedAt: new Date().getTime(),
  };

  const service: Service = app.get('service');

  try {
    await service.writeLocation(location);
    return res.status(200).end();
  } catch (err) {
    const conflictError: ErrorType = 'Conflict Error';

    if (err.name === conflictError) return res.status(409).send(err.message);
    else return res.status(500).send(err.message);
  }
});

app.post('/alert', body('userId').isString(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const service: Service = app.get('service');

  try {
    const alert = await service.createAlert(req.body.userId);
    return res.json(alert).status(201);
  } catch (err) {
    if (err.name === 'Conflict Error') return res.status(409).send(err.message);
    else return res.status(500).send(err.message);
  }
});

export default app;
