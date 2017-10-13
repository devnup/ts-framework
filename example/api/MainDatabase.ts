import * as Package from "pjson";
import Database, { DatabaseOptions } from "../../lib/database";

export default class MainDatabase extends Database {
  static instance: MainDatabase;

  public static getInstance(options?: DatabaseOptions) {
    if (!MainDatabase.instance) {
      MainDatabase.instance = new MainDatabase({
        url: process.env.MONGO_URL || `mongodb://localhost:27017/${Package.name}`,
        ...options
      });
    }
    return MainDatabase.instance;
  }

  public static model(name: any) {
    return MainDatabase.getInstance().model(name);
  }
}
