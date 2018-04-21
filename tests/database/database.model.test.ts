import MongodbMemoryServer from 'mongodb-memory-server';
import { Model, Logger, Schema, BaseModel, Database } from '../../lib';

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

describe('lib.Database', () => {
  let db;
  let mongoUri;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = (new MongodbMemoryServer());
    mongoUri = await mongoServer.getConnectionString();
    db = new Database({ url: mongoUri, logger: Logger });
    await db.connect();
    expect(db.isReady()).toBe(true);
  });

  afterAll(async () => {
    await db.disconnect();
    await mongoServer.stop();
  });

  it('should instantiate a simple model', async () => {

    @Model(TestModel.COLLECTION, new Schema({
      status: { type: String, default: 'ok' },
    }))
    class TestModel extends BaseModel {
      static COLLECTION = 'Test';
    }

    db.model(TestModel);

    expect(db.mongoose.connection.models).toHaveProperty(TestModel.COLLECTION);
    expect(db.mongoose.connection.models[TestModel.COLLECTION]).toHaveProperty('schema');
    expect(db.mongoose.connection.models[TestModel.COLLECTION].schema.obj).toHaveProperty('status');

    const testModel = db.model(TestModel.COLLECTION);
    expect(testModel).toBeDefined();

    const obj = new testModel();
    expect(obj.status).toBe('ok');
    expect(obj.toJSON()).toHaveProperty('status', 'ok');
    expect(obj.toObject()).toHaveProperty('status', 'ok');
  });

  it('should not instantiate a model without schema', async () => {
    
    @Model(TestModel.COLLECTION)
    class TestModel extends BaseModel {
      static COLLECTION = 'Test';
    }
    expect (() => db.model(TestModel)).toThrow(/Schema is not defined/i);
  });
});
