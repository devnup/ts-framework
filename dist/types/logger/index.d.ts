/// <reference types="winston" />
import * as winston from 'winston';
import { ConsoleTransportInstance, LoggerInstance, LoggerOptions } from 'winston';
import { SentryTransportOptions } from "./sentry/SentryTransportOptions";
export interface SimpleLoggerOptions extends LoggerOptions {
    sentry?: SentryTransportOptions;
}
export default class SimpleLogger extends winston.Logger {
    protected static instance: SimpleLogger;
    static DEFAULT_TRANSPORTS: ConsoleTransportInstance[];
    constructor(options?: SimpleLoggerOptions);
    static getInstance(): LoggerInstance;
}
