import * as mongoose from 'mongoose';
import Database from '../../lib/database';
import MongodbMemoryServer from 'mongodb-memory-server';

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

describe('lib.Database', () => {
  let mongoUri;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = (new MongodbMemoryServer());
    mongoUri = await mongoServer.getConnectionString();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
    await mongoServer.stop();
  });

  it('should instantiate a simple database', async () => {
    const db = new Database({ url: mongoUri });
    await db.connect();
    expect(db.isReady()).toBe(true);
    await db.disconnect();
    expect(db.isReady()).toBe(false);
  });

  it('should not connect to invalid url', async () => {
    expect.assertions(2);
    const db = new Database({ url: 'mongodb://abcde.efg:1234/invalid' });
    try {
      await db.connect();
    } catch (e) {
      console.error(e);
      expect(e).toHaveProperty('name', 'MongoError');
      expect(e.message).toMatch(/failed to connect/);
    }
  });
});
