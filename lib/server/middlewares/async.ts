import * as util from 'util';
import { Request, Response } from 'express';

const asyncMiddleware = (functions: Function | Function[]) => {
  let fns = functions;
  
  // Ensure input as an array
  if (!util.isArray(fns)) {
    fns = [fns];
  }
  // Map the array of filters and controllers with a Promise wrapper for express error handling
  return fns.map(fn => (req: Request, res: Response, next: any) => {
    if (!util.isFunction(fn)) {
      let msg = 'Async middleware cannot wrap something that is not a function, got ' + typeof fn + '';
      if (util.isString(fn)) {
        msg = `${msg}: "${fn}"`;
      }
      throw new Error(msg);
    }
    try {
      return Promise.resolve(fn(req, res, next)).catch(next);
    } catch (error) {
      next(error);
    }
  });
};

export default asyncMiddleware;
