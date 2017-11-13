import * as Raven from 'raven';
import * as multer from 'multer';
import * as express from 'express';
import * as userAgent from 'express-useragent';
import * as Git from 'git-rev-sync';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as methodOverride from 'method-override';
import * as OAuthServer from 'express-oauth-server';
import { LoggerInstance } from 'winston';
import { Router } from './router';
import { cors, legacyParams, responseBinder } from './middlewares/index';
import { default as errorMiddleware, ErrorDefinitions } from "./error/ErrorReporter";
import SimpleLogger from "../logger/index";
import { BaseRequest } from "../base/BaseRequest";
import { BaseResponse } from "../base/BaseResponse";
import { Controller, Get, Post, Put, Delete } from './router/decorators';
import HttpCode from './error/http/HttpCode';
import HttpError from './error/http/HttpError';

const Logger = SimpleLogger.getInstance();

const SENTRY_RELEASE = process.env.SENTRY_RELEASE ? process.env.SENTRY_RELEASE : (() => {
  try {
    return Git.long();
  } catch (error) {
  }
})();

export { default as response } from './helpers/response';

export {
  BaseRequest, BaseResponse, Logger,
  Controller, Get, Post, Put, Delete,
  HttpCode, HttpError,
};

export interface ServerOptions {
  port: number,
  secret?: string,
  routes?: any,
  cors?: boolean,
  userAgent?: boolean,
  controllers?: object;
  path?: {
    filters?: string;
    controllers?: string;
  };
  sentry?: {
    dsn: string;
  };
  multer?: any,
  oauth?: {
    model: any; // TODO: Specify the signature
    useErrorHandler?: boolean;
    continueMiddleware?: boolean;
    allowExtendedTokenAttributes?: boolean;
    token?: {
      extendedGrantTypes?: any;
      accessTokenLifetime?: number;
      refreshTokenLifetime?: number;
      requireClientAuthentication?: boolean;
      allowExtendedTokenAttributes?: boolean;
    }
  },
  logger?: LoggerInstance;
  errors?: ErrorDefinitions;
}

export default class Server {
  _server: any;
  logger: LoggerInstance;

  constructor(public config: ServerOptions, public app?: any) {
    this.app = app || express();
    this.logger = config.logger;

    // Prepare server configuration
    this.config = {
      ...config,
      port: config.port || 3000
    };

    // Start by registering Sentry if available
    if (this.logger && this.config.sentry) {
      this.logger.info('Initializing server middleware: Sentry');

      Raven.config(this.config.sentry.dsn, {
        autoBreadcrumbs: true,
        logger: 'devnup-server',
        release: SENTRY_RELEASE
      }).install();

      this.app.use(Raven.requestHandler());
    }

    // Enable the logger middleware
    if (this.logger) {
      this.app.use((req: BaseRequest, res, next) => {
        req.logger = this.logger;
        next();
      })
    }

    // Enable the CORS middleware
    if (this.config.cors) {
      if (this.logger) {
        this.logger.info('Initializing server middleware: CORS');
      }
      this.app.use(cors());
    }

    // Handle multer middleware
    if (this.config.multer) {
      if (this.logger) {
        this.logger.info('Initializing server middleware: Multer');
      }
      this.app.use(multer(this.config.multer).single('picture'));
    }

    // Handle user agent middleware
    if(this.config.userAgent) {
      if (this.logger) {
        this.logger.info('Initializing server middleware: User Agent');
      }
      this.app.use(userAgent.express());
    }

    // Enable basic express middlewares
    this.app.set('trust_proxy', 1);
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(methodOverride());

    // Only enable cookie parser if a secret was set
    if (this.config.secret) {
      if (this.logger) {
        this.logger.info('Initializing server middleware: CookieParser');
      }
      this.app.use(cookieParser(this.config.secret));
    }

    // Utilitary middlewares for requests and responses
    this.app.use(legacyParams);
    this.app.use(responseBinder);

    // Use base router for mapping the routes to the Express server
    if (this.logger) {
      this.logger.info('Initializing server middleware: Router');
    }

    Router.build(this.config.controllers, this.config.routes, {
      app: this.app,
      path: this.config.path,
      logger: this.config.logger,
    });

    // Handles oauth server
    if (this.config.oauth) {
      const { token, ...oauth } = this.config.oauth;
      if (this.logger) {
        this.logger.info('Initializing server middleware: OAuth2');
      }

      this.app.oauth = new OAuthServer(oauth);
      this.app.post('/oauth/token', this.app.oauth.token(token));
    }

    // Bind the error handlers
    if (this.logger) {
      this.logger.info('Initializing server middleware: ErrorReporter');
    }

    errorMiddleware(this.config.errors, {
      logger: this.logger,
      raven: this.config.sentry ? Raven : undefined
    })(this.app);
  }

  /**
   * Starts listening on the configured port.
   *
   * @returns {Promise<ServerOptions>}
   */
  public listen(): Promise<ServerOptions> {
    return new Promise((resolve, reject) => {
      // Get http server instance
      this._server = this.app.listen(this.config.port, () => {
        this.onStartup().then(() => resolve(this.config)).catch((error: Error) => reject(error));
      }).on('error', (error: Error) => reject(error))
    });
  }

  /**
   * Stops the server and closes the connection to the port.
   *
   * @returns {Promise<void>}
   */
  public async stop() {
    await this.onShutdown();
    if (this._server) {
      return this._server.close();
    }
  }


  /**
   * Handles post-startup routines, may be extended for initializing databases and services.
   *
   * @returns {Promise<void>}
   */
  public async onStartup() {
    return;
  }

  /**
   * Handles pre-shutdown routines, may be extended for disconnecting from databases and services.
   *
   * @returns {Promise<void>}
   */
  public async onShutdown() {
    return;
  }
}
