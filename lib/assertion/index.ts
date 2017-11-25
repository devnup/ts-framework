// TODO
import * as util from "util";

export interface IAssertionHelper {
  (fn: (req, res) => void): void;
}

/**
 * Wraps function to handle assertions as promises.
 *
 * @param {(req, res) => void} fn The function with assertions
 * @returns {Promise<any>}
 */
const AssertionHelper = function (fn: (req, res) => void) {
  return function (req, res, next) {
    try {
      const cb = (fn(req, res) as any);
      if (cb && util.isFunction(cb.catch)) {
        return cb.then(next).catch(error => {
          error.status = error.status || 400;
          next(error);
        });
      } else {
        next();
      }
      return cb;
    } catch (error) {
      console.error(error);
      next(error);
    }
  } as any;
};

(AssertionHelper as any).toBoolean = (fn: (req, res) => void) => {
  return function (req, res, next) {
    return fn(req, res);
  } as any;
};


export default AssertionHelper as IAssertionHelper;