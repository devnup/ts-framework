import * as hat from 'hat';
import * as Package from 'pjson';
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import MainServer from '../api/MainServer';


describe('api.MainServer', () => {
  it('should respond to a simple status request', async () => {
    const server = new MainServer();

    // Perform a simple request to get a 200 response
    await request(server.app).get('/')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(async (response) => {
        expect(response.body.name).toBe(Package.name);
        expect(response.body.version).toBe(Package.version);
        await server.stop();
      });
  });
});
