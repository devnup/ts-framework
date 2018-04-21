/// <reference types="express" />
/// <reference types="winston" />
import { LoggerInstance } from 'winston';
import { Request, Response } from 'express';
import BaseError from '../../error/BaseError';
import { default as HttpError } from '../error/http/HttpError';
export interface BaseRequest extends Request {
    file?: any;
    user?: any;
    logger: LoggerInstance;
    param(name: string, defaultValue?: any): any;
}
export interface BaseResponse extends Response {
    error(status: number, error: Error): void;
    error(status: number, error: BaseError): void;
    error(status: number, errorMessage: string): void;
    error(error: HttpError): void;
    success(data?: any): void;
}
declare const _default: {
    error(res: Response): (error: String | Error | HttpError) => void;
    success(res: Response): (data?: any) => void;
};
export default _default;
