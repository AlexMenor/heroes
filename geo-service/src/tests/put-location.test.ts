import request from 'supertest';

import app from '../app';
import { ConflictError } from '../errors';
import Service from '../service';
import { MockNotificationSystem, MockPersistence } from './base-mocks';

const mockPersistence = new MockPersistence();

const mockNotificationSystem = new MockNotificationSystem();

app.set('service', new Service(mockPersistence, mockNotificationSystem));

describe('PUT /location/:id', () => {
  const url = '/location/4';

  test('It should return 400 if the body is not well formed', async () => {
    await request(app).put(url).send({ latLong: 'not valid' }).expect(400);
  });

  test('It should return 200 if a the location is successfully puted', async () => {
    jest
      .spyOn(mockPersistence, 'writeLocation')
      .mockImplementation(async () => {
        return;
      });
    await request(app).put(url).send({ latLong: '4,-4' }).expect(200);
  });

  test('It should return 409 if a conflict occours in db', async () => {
    jest
      .spyOn(mockPersistence, 'writeLocation')
      .mockImplementation(async () => {
        throw new ConflictError('Conflict');
      });

    await request(app).put(url).send({ latLong: '4,-4' }).expect(409);
  });
});
