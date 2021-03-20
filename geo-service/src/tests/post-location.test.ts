import request from 'supertest';

import app from '../app';
import { ConflictError, Persistence } from '../persistence.interface';
import Service from '../service';

const mockPersistence: Persistence = {
  async writeLocation(): Promise<void> {
    return;
  },
};

app.set('service', new Service(mockPersistence));

describe('POST /location/:id', () => {
  const url = '/location/4';

  test('It should return 400 if the body is not well formed', async () => {
    await request(app).post(url).send({ latLong: 'not valid' }).expect(400);
  });

  test('It should return 200 if a the location is successfully posted', async () => {
    await request(app).post(url).send({ latLong: '4,-4' }).expect(200);
  });

  test('It should return 409 if a conflict occours in db', async () => {
    jest
      .spyOn(mockPersistence, 'writeLocation')
      .mockImplementation(async () => {
        throw new ConflictError();
      });

    await request(app).post(url).send({ latLong: '4,-4' }).expect(409);
  });
});
