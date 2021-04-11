import request from 'supertest';

import app from '../app';
import { NotFoundError } from '../domain/errors';
import Service from '../service';
import { MockNotificationSystem, MockPersistence } from './base-mocks';

const mockPersistence = new MockPersistence();

const mockNotificationSystem = new MockNotificationSystem();

app.set('service', new Service(mockPersistence, mockNotificationSystem));

describe('DELETE /alert/:id', () => {
  const url = '/alert/4';

  test('It should return 200 if the alert is successfully deleted', async () => {
    jest
      .spyOn(mockPersistence, 'setAlertInactive')
      .mockImplementation(async () => {
        return;
      });

    await request(app).delete(url).expect(200);
  });

  test('It should return 404 if the alert is not found', async () => {
    jest
      .spyOn(mockPersistence, 'setAlertInactive')
      .mockImplementation(async () => {
        throw new NotFoundError('');
      });

    await request(app).delete(url).expect(404);
  });
});
