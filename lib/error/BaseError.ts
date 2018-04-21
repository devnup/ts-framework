import * as uuid from 'uuid';
import * as cleanStack from 'clean-stack';

export class BaseErrorDetails {
  [key: string]: any;

  constructor(data = {}) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    }
  }
}

export default class BaseError extends Error {
  stackId: string;
  details: BaseErrorDetails;

  constructor(message, details: object = {}) {
    const stackId = uuid.v4();
    super(`${message} (stackId: ${stackId})`);
    this.stackId = stackId;
    this.name = this.constructor.name;
    this.details = details instanceof BaseErrorDetails ? details : new BaseErrorDetails(details);

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }

  public toObject() {
    return {
      message: this.message,
      stackId: this.stackId,
      details: this.details,
      stack: cleanStack(this.stack),
    };
  }

  public toJSON(stringify = false): object | string {
    const obj = this.toObject();
    if (stringify) {
      return JSON.stringify(obj);
    }
    return obj;
  }
}
