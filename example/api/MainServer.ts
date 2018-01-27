import Server, { Logger } from "ts-framework";
import StatusController from "./controllers/StatusController";
import MainDatabase from "./MainDatabase";

export default class MainServer extends Server {
  database: MainDatabase;

  constructor() {
    super({
      logger: Logger,
      secret: 'PLEASE_CHANGE_ME',
      port: process.env.PORT as any || 3000,
      controllers: {
        status: StatusController
      },
      // sentry: {
      //   dsn: ''
      // }
    });

    // Prepare the database instance as soon as possible to prevent clashes in
    // model registration. We can connect to the real database later.
    this.database = MainDatabase.getInstance({ logger: this.logger });
  }

  /**
   * Handles pre-startup routines, such as starting the database up.
   *
   * @returns {Promise<void>}
   */
  async onStartup(): Promise<void> {
    await this.database.connect();
    this.logger.info(`Server listening in port: ${this.config.port}`)
  }
}