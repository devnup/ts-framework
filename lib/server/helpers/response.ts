import * as util from 'util';
import { LoggerInstance } from 'winston';
import { Request, Response } from 'express';
import BaseError from '../../error/BaseError';
import { default as HttpError } from '../error/http/HttpError';
import { HttpServerErrors, HttpSuccess } from '../error/http/HttpCode';

export interface BaseRequest extends Request {
  file?: any;
  user?: any;
  logger: LoggerInstance;

  param(name: string, defaultValue?: any);
}

export interface BaseResponse extends Response {
  error(status: number, error: Error): void;

  error(status: number, error: BaseError): void;

  error(status: number, errorMessage: string): void;

  error(error: HttpError): void;

  success(data?: any): void;
}

export default {

  error(res: Response) {
    return (error: String | Error | HttpError) => {
      if (error instanceof HttpError) {
        res.status(error.status as number).json(error.toJSON());
      } else if (typeof error === 'string') {
        res.status(HttpServerErrors.INTERNAL_SERVER_ERROR).json({
          message: error,
          stack: (new Error()).stack,
          details: {},
        });
      } else {
        res.status((error as any).status || HttpServerErrors.INTERNAL_SERVER_ERROR).json({
          message: (error as any).message,
          stack: (error as any).stack,
          details: error,
        });
      }
    };
  },

  success(res: Response) {
    return (data: any = {}) => {
      let d = data;

      // If is array, iterate over the elements
      if (data && util.isArray(data)) {
        // Try to call toJSON of each element, if available
        // This will ease the work with Mongoose models as responses
        d = data.map(d => (d && util.isFunction(d.toJSON)) ? d.toJSON() : d);
      } else if (data && util.isFunction(data.toJSON)) {
        // Try to call toJSON of the response, if available
        // This will ease the work with Mongoose models as responses
        d = data.toJSON();
      }
      
      res.status(HttpSuccess.OK).json(d);
    };
  },
};
