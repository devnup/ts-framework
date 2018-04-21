import * as request from 'supertest';
import Server from '../../../lib/server';

describe('lib.server.middlewares.CookieParser', () => {
  it('GET / (200)', async () => {

    // Initialize a simple server
    const server = new Server({
      port: 3333,
      secret: 'TEST_SECRET',
      routes: {
        get: {
          '/': (req, res) => res.json({ test: 'ok' }),
        },
      },
    });

    // Perform a simple request to get a 200 response
    await request(server.app).get('/')
      .expect('Content-Type', /json/)
      .expect(200, { test: 'ok' });
  });
});
