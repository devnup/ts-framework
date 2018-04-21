import BaseError from '../../../error/BaseError';
import { HttpCode } from './HttpCode';


export default class HttpError extends BaseError {
  status: HttpCode;

  constructor(message, status: HttpCode, details: object = {}) {
    super(`[${status}] ${message}`, details);
    this.status = status;
  }

  public toObject(): any {
    return {
      status: this.status,
      ...super.toObject(),
    };
  }
}
