import * as mongoose from 'mongoose';
import { BaseModel } from './model';
import { Model } from './decorators';
import BaseError from '../error/BaseError';
import { LoggerInstance } from 'winston';
import SimpleLogger from '../logger';
import { maskAuthUrl } from './util';

(mongoose as any).Promise = global.Promise;

const Schema = mongoose.Schema;

export {
  Model,
  Schema,
  BaseModel,
};

export { BaseModel as BaseDAO };

export class DatabaseError extends BaseError {

}

export interface DatabaseOptions {
  url?: string;
  logger?: LoggerInstance;
  mongoose?: mongoose.Mongoose;
}

export default class Database {
  logger: LoggerInstance;
  mongoose: mongoose.Mongoose;

  constructor(public options: DatabaseOptions) {
    if (options.logger) {
      this.logger = options.logger;
      this.logger.info(`Initializing mongodb database`, { url: maskAuthUrl(options.url) });
    }
    this.mongoose = options.mongoose || new mongoose.Mongoose();
  }

  /**
   * Gets or registers a moongoose model instance by its name or definition.
   *
   * @param {string} name The model name
   *
   * @returns {any}
   */
  public model<T extends BaseModel>(name: string | T | any): BaseModel {
    if (typeof name === 'string') {
      return this.mongoose.model(name) as any;
    } 
    if (name.Schema) {
      if (this.logger) {
        this.logger.silly(`Registering model in database: ${name.modelName}`);
      }
      return this.mongoose.model(name.modelName, name.Schema) as any;
    }

    // Schema is not defined, there's nothing left to do
    const n = name.modelName ? name.modelName : (name.name ? name.name : name);
    throw new DatabaseError(`Cannot register the model "${n}": Schema is not defined. ` +
      `Make sure you have decorated the class with @Model(name, schema) or set the static Schema property.`);
  }

  /**
   * Connects to the remote database.
   *
   * @returns {Promise<void>}
   */
  public async connect(): Promise<DatabaseOptions> {
    if (this.logger) {
      this.logger.silly(`Connecting to mongodb database`, { url: maskAuthUrl(this.options.url) });
    }
    return this.mongoose.connect(this.options.url, {
      useMongoClient: true,
      promiseLibrary: global.Promise,
    }).then(() => {
      if (this.logger) {
        this.logger.silly(`Successfully connected to mongodb database`, { url: maskAuthUrl(this.options.url) });
      }
      return this.options;
    });
  }

  /**
   * Disconnects the database.
   *
   * @returns {Promise<void>}
   */
  public async disconnect(): Promise<void> {
    return this.mongoose.disconnect();
  }

  /**
   * Checks if the database is connected and ready for transactions.
   *
   * @returns {boolean}
   */
  public isReady(): boolean {
    return !!this.mongoose.connection.readyState;
  }

  /**
   * Handles database errors, can be extended to include process graceful shutdown.
   * @param error
   */
  public onError(error) {
    if (this.logger) {
      // Let it be extended by outside classes, by default just log to the console
      this.logger.error(`Unhandled database error: ${error.message}`, error);
    }
  }
}
