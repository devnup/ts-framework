import { Schema } from "mongoose";

export interface BaseModelConstructor {
  new(...args: any[]): {};

  Schema?: Schema;
  modelName?: string;
}

/**
 * @Model(name [, database])
 */
export function Model(name: string, schema?: Schema) {
  return function controllerDecorator<T extends BaseModelConstructor>(constructor: T) {

    if (!name || !name.length) {
      throw new Error('The name passed to the @Model() decorator cannot be empty');
    }

    // Load constructor class into supplied schema
    constructor.Schema = schema || constructor.Schema;
    constructor.Schema.loadClass(constructor);

    return class extends constructor {
      static modelName = name;
      static Schema = constructor.Schema;
    }
  }
}
