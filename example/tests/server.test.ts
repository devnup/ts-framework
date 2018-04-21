import * as hat from 'hat';
import * as Package from 'pjson';
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import MainServer from '../api/MainServer';
import MongodbMemoryServer from 'mongodb-memory-server';

describe('api.Server', () => {
  let mongoServer;
  let database;

  beforeAll(async () => {
    mongoServer = new MongodbMemoryServer();
    const MainDatabase = require('../api/MainDatabase').default;
    database = MainDatabase.getInstance({ url: await mongoServer.getConnectionString() });
  });

  afterAll(async () => {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
    await mongoServer.stop();
  });

  it('should respond to a simple status request', async () => {
    const server = new MainServer({ database, port: process.env.PORT as any || 3000 });

    // Perform a simple request to get a 200 response
    await request(server.app).get('/')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.name).toBe(Package.name);
        expect(response.body.version).toBe(Package.version);
      });
  });
});
