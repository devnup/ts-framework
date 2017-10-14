import * as Package from 'pjson';
import { Controller, Get } from "../../../lib/server/router/decorators";

@Controller()
export default class StatusController {
  static STARTED_AT = Date.now();

  @Get('/')
  static getStatus(req, res) {
    res.json({
      name: Package.name,
      version: Package.version,
      environment: process.env.NODE_ENV || 'development',
      uptime: Date.now() - StatusController.STARTED_AT
    });
  }
}
