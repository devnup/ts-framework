import Server, { Logger } from 'ts-framework';
import StatusController from './controllers/StatusController';

export default class MainServer extends Server {

  constructor() {
    super({
      cors: true,
      logger: Logger,
      secret: 'PLEASE_CHANGE_ME',
      port: process.env.PORT as any || 3000,
      controllers: { StatusController },
      // sentry: {
      //   dsn: ''
      // }
    });
  }

  /**
   * Handles pre-startup routines, such as starting the database up.
   *
   * @returns {Promise<void>}
   */
  async onStartup(): Promise<void> {
    this.logger.info(`Server listening in port: ${this.config.port}`);
  }
}
