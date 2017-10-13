import * as util from "util";
import { Response } from 'express';
import { default as HttpError } from "../error/http/HttpError";
import { HttpServerErrors, HttpSuccess } from "../error/http/HttpCode";

export default {

  error(res: Response) {
    return (error: String | Error | HttpError) => {
      if (error instanceof HttpError) {
        res.status(error.status as number).json(error.toJSON());
      } else if (typeof error === 'string') {
        res.status(HttpServerErrors.INTERNAL_SERVER_ERROR).json({
          message: error,
          stack: (new Error()).stack,
          details: {}
        });
      } else {
        res.status((error as any).status || HttpServerErrors.INTERNAL_SERVER_ERROR).json({
          message: (error as any).message,
          stack: (error as any).stack,
          details: error,
        });
      }
    }
  },

  success(res: Response) {
    return (data: any = {}) => {
      if (util.isArray(data)) {
        data = data.map(d => (d && util.isFunction(d.toJSON)) ? d.toJSON() : d);
      } else if (util.isFunction(data.toJSON)) {
        data = data.toJSON();
      }
      res.status(HttpSuccess.OK).json(data)
    }
  }
};
