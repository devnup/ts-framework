/// <reference types="express" />
import { Response } from 'express';
import HttpError from '../server/error/http/HttpError';
import BaseError from '../error/BaseError';
export interface BaseResponse extends Response {
    error(status: number, error: Error): void;
    error(status: number, error: BaseError): void;
    error(status: number, errorMessage: string): void;
    error(error: HttpError): void;
    success(data?: any): void;
}
