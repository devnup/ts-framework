/// <reference types="winston" />
import * as Raven from 'raven';
import { BaseRequest, BaseResponse } from '../helpers/response';
import { LoggerInstance } from 'winston';
export interface ErrorReporterOptions {
    raven?: Raven.Client;
    logger?: LoggerInstance;
}
export interface ErrorDefinitions {
    [code: string]: {
        status: number;
        message: number;
    };
}
export declare class ErrorReporter {
    logger: LoggerInstance;
    options: ErrorReporterOptions;
    errorDefinitions: ErrorDefinitions;
    constructor(errorDefinitions: ErrorDefinitions, options?: ErrorReporterOptions);
    static middleware(errorDefinitions: ErrorDefinitions, options: ErrorReporterOptions): (Application) => void;
    notFound(req: BaseRequest, res: BaseResponse): void;
    unknownError(error: any, req: BaseRequest, res: BaseResponse, next: Function): void;
}
declare const _default: typeof ErrorReporter.middleware;
export default _default;
