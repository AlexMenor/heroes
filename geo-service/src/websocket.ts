import ws from 'ws';
import { ErrorType } from './domain/errors';
import { Alert } from './domain/alert.type';
import { Location } from './domain/location.type';

import { RedisSubscriber } from './implementations/redis.subscriber';

import app from './app';
import Service from './service';

const redisSubscriber = new RedisSubscriber();

const wsServer = new ws.Server({ noServer: true });

wsServer.on('connection', async (socket, request) => {
  const path = request.url as string;
  const alertPattern = /\/alert\/(.+)/;
  const match = path.match(alertPattern);

  if (match) {
    const alertId = match[1];
    const service: Service = app.get('service');
    try {
      const { userId, status } = await service.getAlert(alertId);
      if (status === 'INACTIVE') {
        socket.close();
      } else {
        const location = await service.getLocation(userId);
        socket.send(JSON.stringify(location));

        const locationSubscriptionId = redisSubscriber.subscribe(
          userId,
          (entity) => {
            const location = entity as Location;

            socket.send(JSON.stringify(location));
          },
        );
        const alertSubscriptionId = redisSubscriber.subscribe(
          alertId,
          (entity) => {
            const alert = entity as Alert;
            if (alert.status === 'INACTIVE') {
              socket.close();
            }
          },
        );
        socket.on('close', () => {
          redisSubscriber.unsubscribe(alertId, alertSubscriptionId);
          redisSubscriber.unsubscribe(userId, locationSubscriptionId);
        });
      }
    } catch (err) {
      if (err.name === ('Not Found Error' as ErrorType)) socket.close();
      else socket.close();
    }
  } else socket.close();
});

export default wsServer;
