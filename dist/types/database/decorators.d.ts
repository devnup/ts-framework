/// <reference types="mongoose" />
import { Schema } from 'mongoose';
export interface BaseModelConstructor {
    new (...args: any[]): {};
    Schema?: Schema;
    modelName?: string;
}
/**
 * @Model
 *
 * The decorator for assigning a Schema to a Mongoose Model.
 *
 * @param name The mongoose model name
 * @param schema The mongoode schema
 */
export declare function Model(name: string, schema?: Schema): <T extends BaseModelConstructor>(constructor: T) => {
    new (...args: any[]): {};
    modelName: string;
    Schema: Schema;
} & T;
