import * as request from 'supertest';
import Server from '../../../lib/server';
import HttpError from '../../../lib/server/error/http/HttpError';

describe('lib.server.errors.errorReporter', () => {
  it('GET /unknown_error (500)', async () => {

    // Initialize a simple server
    const server = new Server({
      port: 3333,
      cors: false,
      routes: {
        get: {
          '/': (req, res) => {
            throw new Error('TEST_ERROR');
          },
        },
      },
    });

    // Perform a simple request to get a 200 response
    await request(server.app).get('/')
      .expect('Content-Type', /json/)
      .expect(500)
      .then((response: any) => {
        expect(response.body.status).toBe(500);
        expect(response.body.stackId).toBeDefined();
        expect(response.body.message).toMatch(/TEST_ERROR/);
      });
  });

  it('GET /http_error (400)', async () => {

    // Initialize a simple server
    const server = new Server({
      port: 3333,
      cors: false,
      routes: {
        get: {
          '/': (req, res) => {
            throw new HttpError('BAD_PARAMS', 400);
          },
        },
      },
    });

    // Perform a simple request to get a 200 response
    await request(server.app).get('/')
      .expect('Content-Type', /json/)
      .expect(400)
      .then((response: any) => {
        expect(response.body.status).toBe(400);
        expect(response.body.stackId).toBeDefined();
        expect(response.body.message).toMatch(/BAD_PARAMS/);
      });
  });
});
