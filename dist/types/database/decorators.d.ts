/// <reference types="mongoose" />
import { Schema } from "mongoose";
export interface BaseModelConstructor {
    new (...args: any[]): {};
    Schema?: Schema;
    modelName?: string;
}
/**
 * @Model(name [, database])
 */
export declare function Model(name: string, schema?: Schema): <T extends BaseModelConstructor>(constructor: T) => {
    new (...args: any[]): {};
    modelName: string;
    Schema: Schema;
} & T;
