import request from 'supertest';

import app from '../app';
import { NotFoundError } from '../domain/errors';
import { getMocks } from './base-mocks';

const { mockPersistence, mockService, mockPublisher } = getMocks();

app.set('service', mockService);

describe('DELETE /alert/:id', () => {
  const url = '/alert/4';

  test('It should return 200 if the alert is successfully deleted', async () => {
    jest
      .spyOn(mockPersistence, 'setAlertInactive')
      .mockImplementation(async () => {
        return;
      });
    jest.spyOn(mockPersistence, 'getAlert').mockImplementation(async () => ({
      _id: 'unid',
      userId: 'otroId',
      status: 'ACTIVE',
      createdAt: 0,
      updatedAt: 0,
    }));
    const publish = jest.spyOn(mockPublisher, 'publish');

    await request(app).delete(url).expect(200);

    expect(publish).toBeCalledTimes(1);
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
