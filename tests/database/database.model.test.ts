import MongodbMemoryServer from 'mongodb-memory-server';
import { Model } from "../../lib/database/decorators";
import Database, { Schema, BaseModel } from "../../lib/database";

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

describe('lib.Database', () => {
  let mongoUri, mongoServer, db;

  beforeAll(async () => {
    mongoServer = (new MongodbMemoryServer());
    mongoUri = await mongoServer.getConnectionString();
    db = new Database({ url: mongoUri });
    await db.connect();
    expect(db.isReady()).toBe(true);
  });

  afterAll(async () => {
    await db.disconnect();
    await mongoServer.stop();
  });

  it("should instantiate a simple model", async () => {

    @Model(TestModel.COLLECTION, new Schema({
      status: { type: String, 'default': 'ok' }
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
});
