"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Raven = require("raven");
const multer = require("multer");
const express = require("express");
const requestIp = require("request-ip");
const userAgent = require("express-useragent");
const Git = require("git-rev-sync");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const OAuthServer = require("express-oauth-server");
const router_1 = require("./router");
const index_1 = require("./middlewares/index");
const ErrorReporter_1 = require("./error/ErrorReporter");
const index_2 = require("../logger/index");
const decorators_1 = require("./router/decorators");
exports.Controller = decorators_1.Controller;
exports.Get = decorators_1.Get;
exports.Post = decorators_1.Post;
exports.Put = decorators_1.Put;
exports.Delete = decorators_1.Delete;
const HttpCode_1 = require("./error/http/HttpCode");
exports.HttpCode = HttpCode_1.default;
const HttpError_1 = require("./error/http/HttpError");
exports.HttpError = HttpError_1.default;
const Logger = index_2.default.getInstance();
exports.Logger = Logger;
const SENTRY_RELEASE = process.env.SENTRY_RELEASE ? process.env.SENTRY_RELEASE : (() => {
    try {
        return Git.long();
    }
    catch (error) {
    }
})();
var response_1 = require("./helpers/response");
exports.response = response_1.default;
class Server {
    constructor(config, app) {
        this.config = config;
        this.app = app;
        this.app = app || express();
        this.logger = config.logger;
        // Prepare server configuration
        this.config = Object.assign({}, config, { port: config.port || 3000 });
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
            this.app.use((req, res, next) => {
                req.logger = this.logger;
                next();
            });
        }
        // Handle post initialization routines
        this.onAppReady();
    }
    /**
     * Starts listening on the configured port.
     *
     * @returns {Promise<ServerOptions>}
     */
    listen() {
        return new Promise((resolve, reject) => {
            // Get http server instance
            this._server = this.app.listen(this.config.port, () => {
                this.onStartup().then(() => resolve(this.config)).catch((error) => reject(error));
            }).on('error', (error) => reject(error));
        });
    }
    /**
     * Stops the server and closes the connection to the port.
     *
     * @returns {Promise<void>}
     */
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.onShutdown();
            if (this._server) {
                return this._server.close();
            }
        });
    }
    /**
     * Handles middleware initialization stuff.
     */
    onAppReady() {
        // Enable the CORS middleware
        if (this.config.cors) {
            if (this.logger) {
                this.logger.info('Initializing server middleware: CORS');
            }
            this.app.use(index_1.cors());
        }
        // Handle multer middleware
        if (this.config.multer) {
            if (this.logger) {
                this.logger.info('Initializing server middleware: Multer');
            }
            this.app.use(multer(this.config.multer).single('picture'));
        }
        // Handle user agent middleware
        if (this.config.userAgent) {
            if (this.logger) {
                this.logger.info('Initializing server middleware: User Agent');
            }
            // Parses request for the real IP
            this.app.use(requestIp.mw());
            // Parses request user agent information
            this.app.use(userAgent.express());
        }
        // Enable basic express middlewares
        // TODO: Pass all of this to config
        this.app.set('trust_proxy', 1);
        if (this.config.bodyLimit) {
            this.app.use(bodyParser({ limit: this.config.bodyLimit }));
        }
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
        this.app.use(index_1.legacyParams);
        this.app.use(index_1.responseBinder);
        // Server is ready, handle post application routines
        this.register();
    }
    /**
     * Registers the server routes and error handlers.
     */
    register() {
        // Use base router for mapping the routes to the Express server
        if (this.logger) {
            this.logger.info('Initializing server middleware: Router');
        }
        // Builds the route map and binds to current express application
        router_1.Router.build(this.config.controllers, this.config.routes, {
            app: this.app,
            path: this.config.path,
            logger: this.config.logger,
        });
        // Handles oauth server
        if (this.config.oauth) {
            const _a = this.config.oauth, { token } = _a, oauth = __rest(_a, ["token"]);
            if (this.logger) {
                this.logger.info('Initializing server middleware: OAuth2');
            }
            // Prepare OAuth 2.0 server instance and token endpoint
            this.app.oauth = new OAuthServer(oauth);
            this.app.post('/oauth/token', this.app.oauth.token(token));
        }
        // Bind the error handlers
        if (this.logger) {
            this.logger.info('Initializing server middleware: ErrorReporter');
        }
        ErrorReporter_1.default(this.config.errors, {
            logger: this.logger,
            raven: this.config.sentry ? Raven : undefined
        })(this.app);
    }
    /**
     * Handles post-startup routines, may be extended for initializing databases and services.
     *
     * @returns {Promise<void>}
     */
    onStartup() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.runStartupJobs();
            }
            catch (error) {
                if (this.logger) {
                    this.logger.error('Unknown startup error: ' + error.message, error);
                }
                process.exit(-1);
                return;
            }
        });
    }
    /**
     * Runs the server statup jobs, wil crash if any fails.
     */
    runStartupJobs() {
        return __awaiter(this, void 0, void 0, function* () {
            const jobs = this.config.startup || {};
            const pipeline = jobs.pipeline || [];
            if (pipeline.length) {
                if (this.logger) {
                    this.logger.debug('Running startup pipeline', { jobs: pipeline.map(p => p.name || 'unknown') });
                }
                // TODO: Run all startup jobs in series
                yield Promise.all(jobs.pipeline.map((job) => __awaiter(this, void 0, void 0, function* () { return job.run(this); })));
                if (this.logger) {
                    this.logger.debug('Successfully ran all startup jobs');
                }
            }
        });
    }
    /**
     * Handles pre-shutdown routines, may be extended for disconnecting from databases and services.
     *
     * @returns {Promise<void>}
     */
    onShutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
}
exports.default = Server;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvc2VydmVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQkFBK0I7QUFDL0IsaUNBQWlDO0FBQ2pDLG1DQUFtQztBQUNuQyx3Q0FBd0M7QUFDeEMsK0NBQStDO0FBQy9DLG9DQUFvQztBQUNwQywwQ0FBMEM7QUFDMUMsOENBQThDO0FBQzlDLGtEQUFrRDtBQUNsRCxvREFBb0Q7QUFFcEQscUNBQWtDO0FBQ2xDLCtDQUF5RTtBQUN6RSx5REFBcUY7QUFDckYsMkNBQTJDO0FBRzNDLG9EQUF5RTtBQWtCdkUscUJBbEJPLHVCQUFVLENBa0JQO0FBQUUsY0FsQk8sZ0JBQUcsQ0FrQlA7QUFBRSxlQWxCTyxpQkFBSSxDQWtCUDtBQUFFLGNBbEJPLGdCQUFHLENBa0JQO0FBQUUsaUJBbEJPLG1CQUFNLENBa0JQO0FBakJwQyxvREFBNkM7QUFrQjNDLG1CQWxCSyxrQkFBUSxDQWtCTDtBQWpCVixzREFBK0M7QUFpQm5DLG9CQWpCTCxtQkFBUyxDQWlCSztBQWRyQixNQUFNLE1BQU0sR0FBRyxlQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7QUFZYix3QkFBTTtBQVZuQyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFO0lBQ3JGLElBQUksQ0FBQztRQUNILE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEIsQ0FBQztJQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDakIsQ0FBQztBQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFTCwrQ0FBeUQ7QUFBaEQsOEJBQUEsT0FBTyxDQUFZO0FBNkM1QjtJQUlFLFlBQW1CLE1BQXFCLEVBQVMs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dUM7Z0JBQ3ZDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFNLEdBQUcsRUFBQyxFQUFFLGdEQUFDLE1BQU0sQ0FBTixHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBLEdBQUEsQ0FBQyxDQUFDLENBQUM7Z0JBRWpFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO2dCQUN6RCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDVSxVQUFVOztZQUNyQixNQUFNLENBQUM7UUFDVCxDQUFDO0tBQUE7Q0FDRjtBQXBORCx5QkFvTkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSYXZlbiBmcm9tICdyYXZlbic7XG5pbXBvcnQgKiBhcyBtdWx0ZXIgZnJvbSAnbXVsdGVyJztcbmltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgKiBhcyByZXF1ZXN0SXAgZnJvbSAncmVxdWVzdC1pcCc7XG5pbXBvcnQgKiBhcyB1c2VyQWdlbnQgZnJvbSAnZXhwcmVzcy11c2VyYWdlbnQnO1xuaW1wb3J0ICogYXMgR2l0IGZyb20gJ2dpdC1yZXYtc3luYyc7XG5pbXBvcnQgKiBhcyBib2R5UGFyc2VyIGZyb20gJ2JvZHktcGFyc2VyJztcbmltcG9ydCAqIGFzIGNvb2tpZVBhcnNlciBmcm9tICdjb29raWUtcGFyc2VyJztcbmltcG9ydCAqIGFzIG1ldGhvZE92ZXJyaWRlIGZyb20gJ21ldGhvZC1vdmVycmlkZSc7XG5pbXBvcnQgKiBhcyBPQXV0aFNlcnZlciBmcm9tICdleHByZXNzLW9hdXRoLXNlcnZlcic7XG5pbXBvcnQgeyBMb2dnZXJJbnN0YW5jZSB9IGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnLi9yb3V0ZXInO1xuaW1wb3J0IHsgY29ycywgbGVnYWN5UGFyYW1zLCByZXNwb25zZUJpbmRlciB9IGZyb20gJy4vbWlkZGxld2FyZXMvaW5kZXgnO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBlcnJvck1pZGRsZXdhcmUsIEVycm9yRGVmaW5pdGlvbnMgfSBmcm9tIFwiLi9lcnJvci9FcnJvclJlcG9ydGVyXCI7XG5pbXBvcnQgU2ltcGxlTG9nZ2VyIGZyb20gXCIuLi9sb2dnZXIvaW5kZXhcIjtcbmltcG9ydCB7IEJhc2VSZXF1ZXN0IH0gZnJvbSBcIi4uL2Jhc2UvQmFzZVJlcXVlc3RcIjtcbmltcG9ydCB7IEJhc2VSZXNwb25zZSB9IGZyb20gXCIuLi9iYXNlL0Jhc2VSZXNwb25zZVwiO1xuaW1wb3J0IHsgQ29udHJvbGxlciwgR2V0LCBQb3N0LCBQdXQsIERlbGV0ZSB9IGZyb20gJy4vcm91dGVyL2RlY29yYXRvcnMnO1xuaW1wb3J0IEh0dHBDb2RlIGZyb20gJy4vZXJyb3IvaHR0cC9IdHRwQ29kZSc7XG5pbXBvcnQgSHR0cEVycm9yIGZyb20gJy4vZXJyb3IvaHR0cC9IdHRwRXJyb3InO1xuaW1wb3J0IEJhc2VKb2IgZnJvbSAnLi4vam9icy9CYXNlSm9iJztcblxuY29uc3QgTG9nZ2VyID0gU2ltcGxlTG9nZ2VyLmdldEluc3RhbmNlKCk7XG5cbmNvbnN0IFNFTlRSWV9SRUxFQVNFID0gcHJvY2Vzcy5lbnYuU0VOVFJZX1JFTEVBU0UgPyBwcm9jZXNzLmVudi5TRU5UUllfUkVMRUFTRSA6ICgoKSA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEdpdC5sb25nKCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gIH1cbn0pKCk7XG5cbmV4cG9ydCB7IGRlZmF1bHQgYXMgcmVzcG9uc2UgfSBmcm9tICcuL2hlbHBlcnMvcmVzcG9uc2UnO1xuXG5leHBvcnQge1xuICBCYXNlUmVxdWVzdCwgQmFzZVJlc3BvbnNlLCBMb2dnZXIsXG4gIENvbnRyb2xsZXIsIEdldCwgUG9zdCwgUHV0LCBEZWxldGUsXG4gIEh0dHBDb2RlLCBIdHRwRXJyb3IsXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcnZlck9wdGlvbnMge1xuICBwb3J0OiBudW1iZXIsXG4gIHNlY3JldD86IHN0cmluZyxcbiAgcm91dGVzPzogYW55LFxuICBjb3JzPzogYm9vbGVhbixcbiAgdXNlckFnZW50PzogYm9vbGVhbixcbiAgY29udHJvbGxlcnM/OiBvYmplY3Q7XG4gIGJvZHlMaW1pdD86IHN0cmluZztcbiAgcGF0aD86IHtcbiAgICBmaWx0ZXJzPzogc3RyaW5nO1xuICAgIGNvbnRyb2xsZXJzPzogc3RyaW5nO1xuICB9O1xuICBzZW50cnk/OiB7XG4gICAgZHNuOiBzdHJpbmc7XG4gIH07XG4gIHN0YXJ0dXA/OiB7XG4gICAgcGlwZWxpbmU6IEJhc2VKb2JbXTtcbiAgICBba2V5OiBzdHJpbmddOiBhbnk7XG4gIH07XG4gIG11bHRlcj86IGFueSxcbiAgb2F1dGg/OiB7XG4gICAgbW9kZWw6IGFueTsgLy8gVE9ETzogU3BlY2lmeSB0aGUgc2lnbmF0dXJlXG4gICAgdXNlRXJyb3JIYW5kbGVyPzogYm9vbGVhbjtcbiAgICBjb250aW51ZU1pZGRsZXdhcmU/OiBib29sZWFuO1xuICAgIGFsbG93RXh0ZW5kZWRUb2tlbkF0dHJpYnV0ZXM/OiBib29sZWFuO1xuICAgIHRva2VuPzoge1xuICAgICAgZXh0ZW5kZWRHcmFudFR5cGVzPzogYW55O1xuICAgICAgYWNjZXNzVG9rZW5MaWZldGltZT86IG51bWJlcjtcbiAgICAgIHJlZnJlc2hUb2tlbkxpZmV0aW1lPzogbnVtYmVyO1xuICAgICAgcmVxdWlyZUNsaWVudEF1dGhlbnRpY2F0aW9uPzogYm9vbGVhbjtcbiAgICAgIGFsbG93RXh0ZW5kZWRUb2tlbkF0dHJpYnV0ZXM/OiBib29sZWFuO1xuICAgIH1cbiAgfSxcbiAgbG9nZ2VyPzogTG9nZ2VySW5zdGFuY2U7XG4gIGVycm9ycz86IEVycm9yRGVmaW5pdGlvbnM7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcnZlciB7XG4gIF9zZXJ2ZXI6IGFueTtcbiAgbG9nZ2VyOiBMb2dnZXJJbnN0YW5jZTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29uZmlnOiBTZXJ2ZXJPcHRpb25zLCBwdWJsaWMgYXBwPzogYW55KSB7XG4gICAgdGhpcy5hcHAgPSBhcHAgfHwgZXhwcmVzcygpO1xuICAgIHRoaXMubG9nZ2VyID0gY29uZmlnLmxvZ2dlcjtcblxuICAgIC8vIFByZXBhcmUgc2VydmVyIGNvbmZpZ3VyYXRpb25cbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIC4uLmNvbmZpZyxcbiAgICAgIHBvcnQ6IGNvbmZpZy5wb3J0IHx8IDMwMDBcbiAgICB9O1xuXG4gICAgLy8gU3RhcnQgYnkgcmVnaXN0ZXJpbmcgU2VudHJ5IGlmIGF2YWlsYWJsZVxuICAgIGlmICh0aGlzLmxvZ2dlciAmJiB0aGlzLmNvbmZpZy5zZW50cnkpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZyBzZXJ2ZXIgbWlkZGxld2FyZTogU2VudHJ5Jyk7XG5cbiAgICAgIFJhdmVuLmNvbmZpZyh0aGlzLmNvbmZpZy5zZW50cnkuZHNuLCB7XG4gICAgICAgIGF1dG9CcmVhZGNydW1iczogdHJ1ZSxcbiAgICAgICAgbG9nZ2VyOiAnZGV2bnVwLXNlcnZlcicsXG4gICAgICAgIHJlbGVhc2U6IFNFTlRSWV9SRUxFQVNFXG4gICAgICB9KS5pbnN0YWxsKCk7XG5cbiAgICAgIHRoaXMuYXBwLnVzZShSYXZlbi5yZXF1ZXN0SGFuZGxlcigpKTtcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdGhlIGxvZ2dlciBtaWRkbGV3YXJlXG4gICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICB0aGlzLmFwcC51c2UoKHJlcTogQmFzZVJlcXVlc3QsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICByZXEubG9nZ2VyID0gdGhpcy5sb2dnZXI7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHBvc3QgaW5pdGlhbGl6YXRpb24gcm91dGluZXNcbiAgICB0aGlzLm9uQXBwUmVhZHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgbGlzdGVuaW5nIG9uIHRoZSBjb25maWd1cmVkIHBvcnQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPFNlcnZlck9wdGlvbnM+fVxuICAgKi9cbiAgcHVibGljIGxpc3RlbigpOiBQcm9taXNlPFNlcnZlck9wdGlvbnM+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gR2V0IGh0dHAgc2VydmVyIGluc3RhbmNlXG4gICAgICB0aGlzLl9zZXJ2ZXIgPSB0aGlzLmFwcC5saXN0ZW4odGhpcy5jb25maWcucG9ydCwgKCkgPT4ge1xuICAgICAgICB0aGlzLm9uU3RhcnR1cCgpLnRoZW4oKCkgPT4gcmVzb2x2ZSh0aGlzLmNvbmZpZykpLmNhdGNoKChlcnJvcjogRXJyb3IpID0+IHJlamVjdChlcnJvcikpO1xuICAgICAgfSkub24oJ2Vycm9yJywgKGVycm9yOiBFcnJvcikgPT4gcmVqZWN0KGVycm9yKSlcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyB0aGUgc2VydmVyIGFuZCBjbG9zZXMgdGhlIGNvbm5lY3Rpb24gdG8gdGhlIHBvcnQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgcHVibGljIGFzeW5jIHN0b3AoKSB7XG4gICAgYXdhaXQgdGhpcy5vblNodXRkb3duKCk7XG4gICAgaWYgKHRoaXMuX3NlcnZlcikge1xuICAgICAgcmV0dXJuIHRoaXMuX3NlcnZlci5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIG1pZGRsZXdhcmUgaW5pdGlhbGl6YXRpb24gc3R1ZmYuXG4gICAqL1xuICBwdWJsaWMgb25BcHBSZWFkeSgpIHtcblxuICAgIC8vIEVuYWJsZSB0aGUgQ09SUyBtaWRkbGV3YXJlXG4gICAgaWYgKHRoaXMuY29uZmlnLmNvcnMpIHtcbiAgICAgIGlmICh0aGlzLmxvZ2dlcikge1xuICAgICAgICB0aGlzLmxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcgc2VydmVyIG1pZGRsZXdhcmU6IENPUlMnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYXBwLnVzZShjb3JzKCkpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBtdWx0ZXIgbWlkZGxld2FyZVxuICAgIGlmICh0aGlzLmNvbmZpZy5tdWx0ZXIpIHtcbiAgICAgIGlmICh0aGlzLmxvZ2dlcikge1xuICAgICAgICB0aGlzLmxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcgc2VydmVyIG1pZGRsZXdhcmU6IE11bHRlcicpO1xuICAgICAgfVxuICAgICAgdGhpcy5hcHAudXNlKG11bHRlcih0aGlzLmNvbmZpZy5tdWx0ZXIpLnNpbmdsZSgncGljdHVyZScpKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgdXNlciBhZ2VudCBtaWRkbGV3YXJlXG4gICAgaWYgKHRoaXMuY29uZmlnLnVzZXJBZ2VudCkge1xuICAgICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZyBzZXJ2ZXIgbWlkZGxld2FyZTogVXNlciBBZ2VudCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBQYXJzZXMgcmVxdWVzdCBmb3IgdGhlIHJlYWwgSVBcbiAgICAgIHRoaXMuYXBwLnVzZShyZXF1ZXN0SXAubXcoKSk7XG5cbiAgICAgIC8vIFBhcnNlcyByZXF1ZXN0IHVzZXIgYWdlbnQgaW5mb3JtYXRpb25cbiAgICAgIHRoaXMuYXBwLnVzZSh1c2VyQWdlbnQuZXhwcmVzcygpKTtcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgYmFzaWMgZXhwcmVzcyBtaWRkbGV3YXJlc1xuICAgIC8vIFRPRE86IFBhc3MgYWxsIG9mIHRoaXMgdG8gY29uZmlnXG4gICAgdGhpcy5hcHAuc2V0KCd0cnVzdF9wcm94eScsIDEpO1xuICAgIGlmICh0aGlzLmNvbmZpZy5ib2R5TGltaXQpIHtcbiAgICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyKHsgbGltaXQ6IHRoaXMuY29uZmlnLmJvZHlMaW1pdCB9KSk7XG4gICAgfVxuICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLmpzb24oKSk7XG4gICAgdGhpcy5hcHAudXNlKGJvZHlQYXJzZXIudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiBmYWxzZSB9KSk7XG4gICAgdGhpcy5hcHAudXNlKG1ldGhvZE92ZXJyaWRlKCkpO1xuXG4gICAgLy8gT25seSBlbmFibGUgY29va2llIHBhcnNlciBpZiBhIHNlY3JldCB3YXMgc2V0XG4gICAgaWYgKHRoaXMuY29uZmlnLnNlY3JldCkge1xuICAgICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZyBzZXJ2ZXIgbWlkZGxld2FyZTogQ29va2llUGFyc2VyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLmFwcC51c2UoY29va2llUGFyc2VyKHRoaXMuY29uZmlnLnNlY3JldCkpO1xuICAgIH1cblxuICAgIC8vIFV0aWxpdGFyeSBtaWRkbGV3YXJlcyBmb3IgcmVxdWVzdHMgYW5kIHJlc3BvbnNlc1xuICAgIHRoaXMuYXBwLnVzZShsZWdhY3lQYXJhbXMpO1xuICAgIHRoaXMuYXBwLnVzZShyZXNwb25zZUJpbmRlcik7XG5cbiAgICAvLyBTZXJ2ZXIgaXMgcmVhZHksIGhhbmRsZSBwb3N0IGFwcGxpY2F0aW9uIHJvdXRpbmVzXG4gICAgdGhpcy5yZWdpc3RlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyB0aGUgc2VydmVyIHJvdXRlcyBhbmQgZXJyb3IgaGFuZGxlcnMuXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVnaXN0ZXIoKSB7XG5cbiAgICAvLyBVc2UgYmFzZSByb3V0ZXIgZm9yIG1hcHBpbmcgdGhlIHJvdXRlcyB0byB0aGUgRXhwcmVzcyBzZXJ2ZXJcbiAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZyBzZXJ2ZXIgbWlkZGxld2FyZTogUm91dGVyJyk7XG4gICAgfVxuXG4gICAgLy8gQnVpbGRzIHRoZSByb3V0ZSBtYXAgYW5kIGJpbmRzIHRvIGN1cnJlbnQgZXhwcmVzcyBhcHBsaWNhdGlvblxuICAgIFJvdXRlci5idWlsZCh0aGlzLmNvbmZpZy5jb250cm9sbGVycywgdGhpcy5jb25maWcucm91dGVzLCB7XG4gICAgICBhcHA6IHRoaXMuYXBwLFxuICAgICAgcGF0aDogdGhpcy5jb25maWcucGF0aCxcbiAgICAgIGxvZ2dlcjogdGhpcy5jb25maWcubG9nZ2VyLFxuICAgIH0pO1xuXG4gICAgLy8gSGFuZGxlcyBvYXV0aCBzZXJ2ZXJcbiAgICBpZiAodGhpcy5jb25maWcub2F1dGgpIHtcbiAgICAgIGNvbnN0IHsgdG9rZW4sIC4uLm9hdXRoIH0gPSB0aGlzLmNvbmZpZy5vYXV0aDtcbiAgICAgIGlmICh0aGlzLmxvZ2dlcikge1xuICAgICAgICB0aGlzLmxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcgc2VydmVyIG1pZGRsZXdhcmU6IE9BdXRoMicpO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwYXJlIE9BdXRoIDIuMCBzZXJ2ZXIgaW5zdGFuY2UgYW5kIHRva2VuIGVuZHBvaW50XG4gICAgICB0aGlzLmFwcC5vYXV0aCA9IG5ldyBPQXV0aFNlcnZlcihvYXV0aCk7XG4gICAgICB0aGlzLmFwcC5wb3N0KCcvb2F1dGgvdG9rZW4nLCB0aGlzLmFwcC5vYXV0aC50b2tlbih0b2tlbikpO1xuICAgIH1cblxuICAgIC8vIEJpbmQgdGhlIGVycm9yIGhhbmRsZXJzXG4gICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICB0aGlzLmxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcgc2VydmVyIG1pZGRsZXdhcmU6IEVycm9yUmVwb3J0ZXInKTtcbiAgICB9XG5cbiAgICBlcnJvck1pZGRsZXdhcmUodGhpcy5jb25maWcuZXJyb3JzLCB7XG4gICAgICBsb2dnZXI6IHRoaXMubG9nZ2VyLFxuICAgICAgcmF2ZW46IHRoaXMuY29uZmlnLnNlbnRyeSA/IFJhdmVuIDogdW5kZWZpbmVkXG4gICAgfSkodGhpcy5hcHApO1xuXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBwb3N0LXN0YXJ0dXAgcm91dGluZXMsIG1heSBiZSBleHRlbmRlZCBmb3IgaW5pdGlhbGl6aW5nIGRhdGFiYXNlcyBhbmQgc2VydmljZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgcHVibGljIGFzeW5jIG9uU3RhcnR1cCgpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5ydW5TdGFydHVwSm9icygpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ1Vua25vd24gc3RhcnR1cCBlcnJvcjogJyArIGVycm9yLm1lc3NhZ2UsIGVycm9yKTtcbiAgICAgIH1cbiAgICAgIHByb2Nlc3MuZXhpdCgtMSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgdGhlIHNlcnZlciBzdGF0dXAgam9icywgd2lsIGNyYXNoIGlmIGFueSBmYWlscy5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBydW5TdGFydHVwSm9icygpIHtcbiAgICBjb25zdCBqb2JzID0gdGhpcy5jb25maWcuc3RhcnR1cCB8fCB7fSBhcyBhbnk7XG4gICAgY29uc3QgcGlwZWxpbmUgPSBqb2JzLnBpcGVsaW5lIHx8IFtdO1xuXG4gICAgaWYgKHBpcGVsaW5lLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdSdW5uaW5nIHN0YXJ0dXAgcGlwZWxpbmUnLCB7IGpvYnM6IHBpcGVsaW5lLm1hcChwID0+IHAubmFtZSB8fCAndW5rbm93bicpIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBSdW4gYWxsIHN0YXJ0dXAgam9icyBpbiBzZXJpZXNcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGpvYnMucGlwZWxpbmUubWFwKGFzeW5jIGpvYiA9PiBqb2IucnVuKHRoaXMpKSk7XG5cbiAgICAgIGlmICh0aGlzLmxvZ2dlcikge1xuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnU3VjY2Vzc2Z1bGx5IHJhbiBhbGwgc3RhcnR1cCBqb2JzJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgcHJlLXNodXRkb3duIHJvdXRpbmVzLCBtYXkgYmUgZXh0ZW5kZWQgZm9yIGRpc2Nvbm5lY3RpbmcgZnJvbSBkYXRhYmFzZXMgYW5kIHNlcnZpY2VzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIHB1YmxpYyBhc3luYyBvblNodXRkb3duKCkge1xuICAgIHJldHVybjtcbiAgfVxufVxuIl19