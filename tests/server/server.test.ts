import * as hat from 'hat';
import * as request from 'supertest';
import Server from '../../lib/server/index';
import { Controller, Get } from '../../lib/server/router/decorators';
import SimpleLogger from '../../lib/logger/index';

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

describe('lib.Server', () => {
  it('should crash without controllers or routes', async () => {
    expect(() => new Server({ port: 3333 })).toThrow(/router without routes or controllers/);
  });

  it('should listen properly on specified port', async () => {
    // Initialize a simple server
    const server = new Server({
      port: 3333,
      cors: true,
      secret: hat(),
      logger: SimpleLogger.getInstance(),
      routes: {
        get: { '/': (req, res) => res.success({ test: 'ok' }) },
      },
    });

    await server.listen();

    // Perform a simple request to get a 200 response
    await request(server.app).get('/')
      .expect('Content-Type', /json/)
      .expect(200, {
        test: 'ok',
      });

    await server.stop();
  });

  it('GET /unknown_route (404)', async () => {
    // Initialize a simple server
    const server = new Server({
      port: 3333,
      routes: {},
    });

    // Perform an unknown request to get a 404 error
    await request(server.app)
      .get('/some_unknown_test_endpoint')
      .expect(404);
  });

  it('GET / (200)', async () => {
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
      .expect(200, {
        test: 'ok',
      });
  });

  it('GET /decorated (200)', async () => {
    @Controller('/test')
    class TestController {

      @Get('/status')
      static status(req, res) {
        return res.success({ status: 'ok' });
      }

    }

    const server = new Server({
      port: 3333,
      controllers: {
        status: TestController,
      },
    });

    // Perform a simple request to get a 200 response
    await request(server.app).get('/test/status')
      .expect('Content-Type', /json/)
      .expect(200, {
        status: 'ok',
      });
  });

  it('GET /decorated_filter (200)', async () => {
    const TestFilter1 = (req, res, next) => {
      if (req.param('test_1')) {
        next();
      }
    };

    const TestFilter2 = (req, res, next) => {
      if (req.param('test_2')) {
        next();
      }
    };

    @Controller('/test', [TestFilter1])
    class TestController {

      @Get('/status', [TestFilter2])
      static status(req, res) {
        return res.success({
          // Mock a model interface so toJSON gets called
          toJSON() {
            return {
              status: 'ok',
            };
          },
        });
      }

    }

    const server = new Server({
      port: 3333,
      controllers: {
        status: TestController,
      },
    });

    // Perform a simple request to get a 200 response
    await request(server.app).get('/test/status')
      .query({ test_1: 'ok' })
      .send({ test_2: 'ok' })
      .expect('Content-Type', /json/)
      .expect(200, {
        status: 'ok',
      });
  });
});
