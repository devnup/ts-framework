import * as winston from 'winston';
import * as SentryTransport from 'winston-raven-sentry';
import { SentryTransportOptions } from './sentry/SentryTransportOptions';

export interface SimpleLoggerOptions extends winston.LoggerOptions {
  sentry?: SentryTransportOptions;
}

export default class SimpleLogger extends winston.Logger {
  protected static instance: SimpleLogger;

  static DEFAULT_TRANSPORTS: winston.ConsoleTransportInstance[] = [
    new (winston.transports.Console)({
      // TODO: Get from default configuration layer
      level: process.env.LOG_LEVEL || 'silly',
      colorize: true,
    }),
  ];

  public constructor(options: SimpleLoggerOptions = {}) {
    // Prepare default console transport
    const opt = {
      transports: options.transports || SimpleLogger.DEFAULT_TRANSPORTS,
    };

    // Add sentry if available
    if (options.sentry) {
      opt.transports.push(new SentryTransport(options.sentry));
    }

    super(opt);
  }

  public static getInstance(): winston.LoggerInstance {
    if (!this.instance) {
      this.instance = new SimpleLogger();
    }
    return this.instance;
  }
}
