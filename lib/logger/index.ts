import { Logger, LoggerInstance, transports } from 'winston';

export default class SimpleLogger {
  static instance: LoggerInstance = new Logger({
    transports: [
      new (transports.Console)({
        level: 'silly',
        colorize: true,
      })
    ]
  });

  static getInstance(): LoggerInstance {
    return this.instance;
  }
}