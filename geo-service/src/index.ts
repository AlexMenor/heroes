import 'dotenv/config';

import app from './app';
import Service from './service';
import wsServer from './websocket';

import MongoPersistance from './implementations/mongo.persistence';
import { FBMNotificationSystem } from './implementations/fbm.notification-system';
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

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit('connection', socket, request);
  });
});
