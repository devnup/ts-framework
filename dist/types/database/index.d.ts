/// <reference types="mongoose" />
/// <reference types="winston" />
import Plugins from './plugins';
import * as mongoose from 'mongoose';
import { BaseModel } from "./model";
import { Model } from './decorators';
import BaseError from "../error/BaseError";
import { LoggerInstance } from "winston";
declare const Schema: typeof mongoose.Schema;
export { Model, Schema, Plugins, BaseModel };
export { BaseModel as BaseDAO };
export declare class DatabaseError extends BaseError {
}
export interface DatabaseOptions {
    url?: string;
    logger?: LoggerInstance;
    mongoose?: mongoose.Mongoose;
}
export default class Database {
    options: DatabaseOptions;
    logger: LoggerInstance;
    mongoose: mongoose.Mongoose;
    constructor(options: DatabaseOptions);
    /**
     * Gets or registers a moongoose model instance by its name or definition.
     *
     * @param {string} name The model name
     *
     * @returns {any}
     */
    model<T extends BaseModel>(name: string | T | any): BaseModel;
    /**
     * Connects to the remote database.
     *
     * @returns {Promise<void>}
     */
    connect(): Promise<DatabaseOptions>;
    /**
     * Disconnects the database.
     *
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
    /**
     * Checks if the database is connected and ready for transactions.
     *
     * @returns {boolean}
     */
    isReady(): boolean;
    /**
     * Handles database errors, can be extended to include process graceful shutdown.
     * @param error
     */
    protected onError(error: any): void;
}
