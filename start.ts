require('source-map-support').install();

import MainServer from './api/server';

const server = new MainServer({
  port: process.env.PORT as any,
  secret: 'PLEASE_CHANGE_ME',
  sentry: {
    dsn: 'https://ba5bb64bcccd449d9604159ff5a012e0:8d1e8fd153184941ac896f794733f495@sentry.io/223756'
  }
});

server.listen().catch(error => {
  console.error(error);
  process.exit(-1);
});
