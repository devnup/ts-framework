/// <reference types="winston" />
import * as winston from 'winston';
import { SentryTransportOptions } from './sentry/SentryTransportOptions';
export interface SimpleLoggerOptions extends winston.LoggerOptions {
    sentry?: SentryTransportOptions;
}
export default class SimpleLogger extends winston.Logger {
    protected static instance: SimpleLogger;
    static DEFAULT_TRANSPORTS: winston.ConsoleTransportInstance[];
    constructor(options?: SimpleLoggerOptions);
    static getInstance(): winston.LoggerInstance;
}
