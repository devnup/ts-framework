import Server, { Logger } from "../../lib/server";
import StatusController from "./controllers/StatusController";
import MainDatabase from "./MainDatabase";

export default class MainServer extends Server {
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
  }

  async onStartup(): Promise<void> {
    await MainDatabase.getInstance({ logger: this.logger }).connect();

    this.logger.info(`Server listening in port: ${this.config.port}`)
  }
}