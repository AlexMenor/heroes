import request from 'supertest';

import app from '../app';
import Service from '../service';
import { MockNotificationSystem, MockPersistence } from './base-mocks';

const mockPersistence = new MockPersistence();

const mockNotificationSystem = new MockNotificationSystem();

app.set('service', new Service(mockPersistence, mockNotificationSystem));

describe('POST /alert', () => {
  const url = '/alert';

  test('It should return 400 if the body is not well formed', async () => {
    await request(app).post(url).send({ userId: 34343 }).expect(400);
    await request(app).post(url).send({}).expect(400);
  });

  test('It should return 201 if the alert is successfully posted', async () => {
    jest
      .spyOn(mockPersistence, 'checkIfUserHasActiveAlerts')
      .mockImplementation(async () => {
        return false;
      });
    jest.spyOn(mockPersistence, 'insertAlert').mockImplementation(async () => ({
      _id: 'unid',
      userId: 'otroId',
      status: 'ACTIVE',
      createdAt: 0,
      updatedAt: 0,
    }));
    jest
      .spyOn(mockPersistence, 'getUsersCloseToAlert')
      .mockImplementation(async () => []);

    await request(app).post(url).send({ userId: '4' }).expect(201);
  });

  test('It should return 409 if the user has already an alert going on', async () => {
    jest
      .spyOn(mockPersistence, 'checkIfUserHasActiveAlerts')
      .mockImplementation(async () => {
        return true;
      });

    await request(app).post(url).send({ userId: '4' }).expect(409);
  });
});
