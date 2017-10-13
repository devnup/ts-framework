import * as cleanStack from 'clean-stack';

export interface BaseErrorDetails {
  [key: string]: any;
}

export default class BaseError extends Error {
  details: BaseErrorDetails;

  constructor(message: string, public code?: string, baseError?: Error) {
    super(`${code ? `${code} - ` : ''}${message}`);

    // extending Error is weird and does not propagate `message`
    Object.defineProperty(this, 'message', {
      configurable: true,
      enumerable: false,
      value: message,
      writable: true,
    });

    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: this.constructor.name,
      writable: true,
    });

    if (baseError && baseError.stack) {
      this.stack = baseError.stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toObject(input: object = {}): object {
    return {
      ...input,
      code: this.code,
      message: this.message,
      details: this.details,
      stack: cleanStack(this.stack),
    };
  }

  toJSON(stringify: boolean = false): object | string {
    return stringify ? JSON.stringify(this.toObject()) : this.toObject();
  }
}
