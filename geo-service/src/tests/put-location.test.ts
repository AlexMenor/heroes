import request from 'supertest';

import app from '../app';
import { ConflictError } from '../domain/errors';
import { getMocks } from './base-mocks';

const { mockPersistence, mockService, mockPublisher } = getMocks();

app.set('service', mockService);

describe('PUT /location/:id', () => {
  const url = '/location/4';

  test('It should return 400 if the body is not well formed', async () => {
    await request(app).put(url).send({ latLong: 'not valid' }).expect(400);
  });

  test('It should return 200 if a the location is successfully put', async () => {
    jest
      .spyOn(mockPersistence, 'writeLocation')
      .mockImplementation(async () => {
        return;
      });

    const publish = jest.spyOn(mockPublisher, 'publish');

    await request(app).put(url).send({ latLong: '4,-4' }).expect(200);

    expect(publish).toBeCalled();
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
