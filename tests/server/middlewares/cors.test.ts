import * as request from 'supertest';
import Server from '../../../lib/server';

describe('lib.server.middlewares.CORS', () => {
  it('GET /cors_inactive (200)', async () => {

    // Initialize a simple server
    const server = new Server({
      port: 3333,
      cors: false,
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

  it('GET /cors_active (200)', async () => {
    // Initialize a simple server
    const server = new Server({
      port: 3333,
      cors: true,
      routes: {
        get: {
          '/': (req, res) => res.json({ test: 'ok' }),
        },
      },
    });

    // Perform a simple request to get a 200 response
    await request(server.app).get('/')
      .expect('Content-Type', /json/)
      .expect('Access-Control-Allow-Origin', '*')
      .expect(200, { test: 'ok' });
  });
});
