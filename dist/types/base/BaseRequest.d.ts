/// <reference types="express" />
/// <reference types="winston" />
import { Request } from 'express';
import { LoggerInstance } from 'winston';
export interface BaseRequest extends Request {
    file?: any;
    user?: any;
    logger: LoggerInstance;
    param(name: string, defaultValue?: any): any;
}
