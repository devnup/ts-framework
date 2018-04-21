import MongodbMemoryServer from 'mongodb-memory-server';
import { Model } from '../../lib/database/decorators';
import Database, { BaseModel, Schema } from '../../lib/database';

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

describe('lib.Database', () => {
  let db;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = (new MongodbMemoryServer());
    const mongoUri = await mongoServer.getConnectionString();
    db = new Database({ url: mongoUri });
    await db.connect();
    expect(db.isReady()).toBe(true);
  });

  afterAll(async () => {
    await db.disconnect();
    await mongoServer.stop();
  });

  it('should instantiate a simple model extending a dao', async () => {

    const TestSchema = new Schema({ status: { type: String, default: 'ok' } });

    abstract class TestDAO extends BaseModel {
      static findByStatus(status) {
        return this.find({ status });
      }

      static createByStatus(status) {
        return this.create({ status });
      }
    }

    @Model(TestModel.COLLECTION, TestSchema)
    class TestModel extends TestDAO {
      static COLLECTION = 'test';

      async setStatus(status) {
        return this.update({ $set: { status } });
      }
    }

    db.model(TestModel);

    expect(db.mongoose.connection.models).toHaveProperty(TestModel.COLLECTION);
    expect(db.mongoose.connection.models[TestModel.COLLECTION]).toHaveProperty('schema');
    expect(db.mongoose.connection.models[TestModel.COLLECTION].schema.obj).toHaveProperty('status');

    const testModel = db.model(TestModel.COLLECTION, TestModel);
    expect(testModel).toHaveProperty('findByStatus');

    expect(await testModel.findByStatus('random')).toHaveProperty('length', 0);

    const sampleCreation = await testModel.createByStatus('random');
    expect(sampleCreation.status).toBe('random');

    const sampleUpdate = await sampleCreation.setStatus('random2');
    expect(sampleUpdate).toHaveProperty('ok', 1);
    expect(sampleUpdate).toHaveProperty('nModified', 1);
  });
});
