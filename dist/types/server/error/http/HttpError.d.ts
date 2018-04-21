import BaseError from '../../../error/BaseError';
import { HttpCode } from './HttpCode';
export default class HttpError extends BaseError {
    status: HttpCode;
    constructor(message: any, status: HttpCode, details?: object);
    toObject(): any;
}
