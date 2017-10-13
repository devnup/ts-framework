import * as uuid from 'uuid';
import * as cleanStack from 'clean-stack';

export class BaseErrorDetails {
  [key: string]: any;

  constructor(data = {}) {
    for (let key in data) {
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
    let stackId = uuid.v4();
    super(`${message} (stackId: ${stackId})`);
    this.stackId = stackId;
    this.details = details instanceof BaseErrorDetails ? details : new BaseErrorDetails(details);
  }

  public toObject() {
    return {
      message: this.message,
      stackId: this.stackId,
      details: this.details,
      stack: cleanStack(this.stack),
    }
  }

  public toJSON(stringify = false): object | string {
    const obj = this.toObject();
    if (stringify) {
      return JSON.stringify(obj);
    }
    return obj;
  }
}
