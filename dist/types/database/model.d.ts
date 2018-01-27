/// <reference types="mongoose" />
import * as mongoose from 'mongoose';
export declare abstract class BaseModel extends mongoose.Model {
    toJSON(): any;
}
export declare abstract class BaseDAO extends BaseModel {
}
