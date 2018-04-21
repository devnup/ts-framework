import * as request from 'supertest';
import Server from '../../../lib/server';

describe('lib.server.middlewares.Async', () => {
  it('should not wrap a number', async () => {

    // Initialize a simple server
    const server = new Server({
      port: 3333,
      routes: {
        get: { '/': 1 },
      },
    });

    // Perform a simple request to get a 200 response
    await request(server.app).get('/')
      .expect('Content-Type', /json/)
      .expect(500, /Async middleware cannot wrap something that is not a function/);
  });

  it('should not wrap a string', async () => {

    // Initialize a simple server
    const server = new Server({
      port: 3333,
      routes: {
        get: { '/': 'blah' },
      },
    });

    // Perform a simple request to get a 500 response
    await request(server.app).get('/')
      .expect('Content-Type', /json/)
      .expect(500, /Async middleware cannot wrap something that is not a function/);
  });

  it('should wrap a valid function', async () => {

    // Initialize a simple server
    const server = new Server({
      port: 3333,
      routes: {
        get: { '/': (req, res) => res.success({ test: 'ok' }) },
      },
    });

    // Perform a simple request to get a 200 response
    await request(server.app).get('/')
      .expect('Content-Type', /json/)
      .expect(200, { test: 'ok' });
  });
});
