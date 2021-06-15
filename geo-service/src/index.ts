import 'dotenv/config';
import ws from 'ws';

import app from './app';
import Service from './service';

import MongoPersistance from './implementations/mongo.persistence';
import { FBMNotificationSystem } from './implementations/fbm.notification-system';
import { ErrorType } from './domain/errors';
import { RedisPublisher } from './implementations/redis.publisher';

const mongoPersistance = new MongoPersistance();
const fbmNotifications = new FBMNotificationSystem();
const redisPublisher = new RedisPublisher();

app.set(
  'service',
  new Service(mongoPersistance, fbmNotifications, redisPublisher),
);

const { PORT } = process.env;

const server = app.listen(PORT, () => console.log(`Running on port ${PORT}`));

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', async (socket, request) => {
  const path = request.url as string;
  const alertPattern = /\/alert\/(.+)/;
  const match = path.match(alertPattern);

  if (match) {
    const alertId = match[1];
    const service: Service = app.get('service');
    try {
      const { userId } = await service.getAlert(alertId);

      const interval = setInterval(async () => {
        const alert = await service.getAlert(alertId);
        if (alert.status === 'INACTIVE') {
          clearInterval(interval);
          socket.close();
        }
        const location = await service.getLocation(userId);
        socket.send(JSON.stringify(location));
      }, 5000);
    } catch (err) {
      if (err.name === ('Not Found Error' as ErrorType)) socket.close();
      else socket.close();
    }
  }
});

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit('connection', socket, request);
  });
});
