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
                release: SENTRY_RELEASE,
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
            this.app.use(index_1.cors({
                allowedHeaders: '*',
                exposedHeaders: '*',
            }));
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
            raven: this.config.sentry ? Raven : undefined,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvc2VydmVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQkFBK0I7QUFDL0IsaUNBQWlDO0FBQ2pDLG1DQUFtQztBQUNuQyx3Q0FBd0M7QUFDeEMsK0NBQStDO0FBQy9DLG9DQUFvQztBQUNwQywwQ0FBMEM7QUFDMUMsOENBQThDO0FBQzlDLGtEQUFrRDtBQUNsRCxvREFBb0Q7QUFFcEQscUNBQWtDO0FBQ2xDLCtDQUF5RTtBQUN6RSx5REFBcUY7QUFDckYsMkNBQTJDO0FBRzNDLG9EQUF5RTtBQWtCdkUscUJBbEJPLHVCQUFVLENBa0JQO0FBQUUsY0FsQk8sZ0JBQUcsQ0FrQlA7QUFBRSxlQWxCTyxpQkFBSSxDQWtCUDtBQUFFLGNBbEJPLGdCQUFHLENBa0JQO0FBQUUsaUJBbEJPLG1CQUFNLENBa0JQO0FBakJwQyxvREFBNkM7QUFrQjNDLG1CQWxCSyxrQkFBUSxDQWtCTDtBQWpCVixzREFBK0M7QUFpQm5DLG9CQWpCTCxtQkFBUyxDQWlCSztBQWRyQixNQUFNLE1BQU0sR0FBRyxlQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7QUFZYix3QkFBTTtBQVZuQyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFO0lBQ3JGLElBQUksQ0FBQztRQUNILE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEIsQ0FBQztJQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDakIsQ0FBQztBQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFTCwrQ0FBeUQ7QUFBaEQsOEJBQUEsT0FBTyxDQUFZO0FBNkM1QjtJQUlFLFlBQW1CLE1BQXFCLEVBQVMs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SSxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbEcsQ0FBQztnQkFFRCx1Q0FBdUM7Z0JBQ3ZDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFNLEdBQUcsRUFBQyxFQUFFLGdEQUFDLE1BQU0sQ0FBTixHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBLEdBQUEsQ0FBQyxDQUFDLENBQUM7Z0JBRWpFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO2dCQUN6RCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDVSxVQUFVOztZQUNyQixNQUFNLENBQUM7UUFDVCxDQUFDO0tBQUE7Q0FDRjtBQXZORCx5QkF1TkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSYXZlbiBmcm9tICdyYXZlbic7XG5pbXBvcnQgKiBhcyBtdWx0ZXIgZnJvbSAnbXVsdGVyJztcbmltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgKiBhcyByZXF1ZXN0SXAgZnJvbSAncmVxdWVzdC1pcCc7XG5pbXBvcnQgKiBhcyB1c2VyQWdlbnQgZnJvbSAnZXhwcmVzcy11c2VyYWdlbnQnO1xuaW1wb3J0ICogYXMgR2l0IGZyb20gJ2dpdC1yZXYtc3luYyc7XG5pbXBvcnQgKiBhcyBib2R5UGFyc2VyIGZyb20gJ2JvZHktcGFyc2VyJztcbmltcG9ydCAqIGFzIGNvb2tpZVBhcnNlciBmcm9tICdjb29raWUtcGFyc2VyJztcbmltcG9ydCAqIGFzIG1ldGhvZE92ZXJyaWRlIGZyb20gJ21ldGhvZC1vdmVycmlkZSc7XG5pbXBvcnQgKiBhcyBPQXV0aFNlcnZlciBmcm9tICdleHByZXNzLW9hdXRoLXNlcnZlcic7XG5pbXBvcnQgeyBMb2dnZXJJbnN0YW5jZSB9IGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnLi9yb3V0ZXInO1xuaW1wb3J0IHsgY29ycywgbGVnYWN5UGFyYW1zLCByZXNwb25zZUJpbmRlciB9IGZyb20gJy4vbWlkZGxld2FyZXMvaW5kZXgnO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBlcnJvck1pZGRsZXdhcmUsIEVycm9yRGVmaW5pdGlvbnMgfSBmcm9tICcuL2Vycm9yL0Vycm9yUmVwb3J0ZXInO1xuaW1wb3J0IFNpbXBsZUxvZ2dlciBmcm9tICcuLi9sb2dnZXIvaW5kZXgnO1xuaW1wb3J0IHsgQmFzZVJlcXVlc3QgfSBmcm9tICcuLi9iYXNlL0Jhc2VSZXF1ZXN0JztcbmltcG9ydCB7IEJhc2VSZXNwb25zZSB9IGZyb20gJy4uL2Jhc2UvQmFzZVJlc3BvbnNlJztcbmltcG9ydCB7IENvbnRyb2xsZXIsIEdldCwgUG9zdCwgUHV0LCBEZWxldGUgfSBmcm9tICcuL3JvdXRlci9kZWNvcmF0b3JzJztcbmltcG9ydCBIdHRwQ29kZSBmcm9tICcuL2Vycm9yL2h0dHAvSHR0cENvZGUnO1xuaW1wb3J0IEh0dHBFcnJvciBmcm9tICcuL2Vycm9yL2h0dHAvSHR0cEVycm9yJztcbmltcG9ydCBCYXNlSm9iIGZyb20gJy4uL2pvYnMvQmFzZUpvYic7XG5cbmNvbnN0IExvZ2dlciA9IFNpbXBsZUxvZ2dlci5nZXRJbnN0YW5jZSgpO1xuXG5jb25zdCBTRU5UUllfUkVMRUFTRSA9IHByb2Nlc3MuZW52LlNFTlRSWV9SRUxFQVNFID8gcHJvY2Vzcy5lbnYuU0VOVFJZX1JFTEVBU0UgOiAoKCkgPT4ge1xuICB0cnkge1xuICAgIHJldHVybiBHaXQubG9uZygpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICB9XG59KSgpO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIHJlc3BvbnNlIH0gZnJvbSAnLi9oZWxwZXJzL3Jlc3BvbnNlJztcblxuZXhwb3J0IHtcbiAgQmFzZVJlcXVlc3QsIEJhc2VSZXNwb25zZSwgTG9nZ2VyLFxuICBDb250cm9sbGVyLCBHZXQsIFBvc3QsIFB1dCwgRGVsZXRlLFxuICBIdHRwQ29kZSwgSHR0cEVycm9yLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZXJPcHRpb25zIHtcbiAgcG9ydDogbnVtYmVyO1xuICBzZWNyZXQ/OiBzdHJpbmc7XG4gIHJvdXRlcz86IGFueTtcbiAgY29ycz86IGJvb2xlYW47XG4gIHVzZXJBZ2VudD86IGJvb2xlYW47XG4gIGNvbnRyb2xsZXJzPzogb2JqZWN0O1xuICBib2R5TGltaXQ/OiBzdHJpbmc7XG4gIHBhdGg/OiB7XG4gICAgZmlsdGVycz86IHN0cmluZztcbiAgICBjb250cm9sbGVycz86IHN0cmluZztcbiAgfTtcbiAgc2VudHJ5Pzoge1xuICAgIGRzbjogc3RyaW5nO1xuICB9O1xuICBzdGFydHVwPzoge1xuICAgIHBpcGVsaW5lOiBCYXNlSm9iW107XG4gICAgW2tleTogc3RyaW5nXTogYW55O1xuICB9O1xuICBtdWx0ZXI/OiBhbnk7XG4gIG9hdXRoPzoge1xuICAgIG1vZGVsOiBhbnk7IC8vIFRPRE86IFNwZWNpZnkgdGhlIHNpZ25hdHVyZVxuICAgIHVzZUVycm9ySGFuZGxlcj86IGJvb2xlYW47XG4gICAgY29udGludWVNaWRkbGV3YXJlPzogYm9vbGVhbjtcbiAgICBhbGxvd0V4dGVuZGVkVG9rZW5BdHRyaWJ1dGVzPzogYm9vbGVhbjtcbiAgICB0b2tlbj86IHtcbiAgICAgIGV4dGVuZGVkR3JhbnRUeXBlcz86IGFueTtcbiAgICAgIGFjY2Vzc1Rva2VuTGlmZXRpbWU/OiBudW1iZXI7XG4gICAgICByZWZyZXNoVG9rZW5MaWZldGltZT86IG51bWJlcjtcbiAgICAgIHJlcXVpcmVDbGllbnRBdXRoZW50aWNhdGlvbj86IGJvb2xlYW47XG4gICAgICBhbGxvd0V4dGVuZGVkVG9rZW5BdHRyaWJ1dGVzPzogYm9vbGVhbjtcbiAgICB9XG4gIH07XG4gIGxvZ2dlcj86IExvZ2dlckluc3RhbmNlO1xuICBlcnJvcnM/OiBFcnJvckRlZmluaXRpb25zO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2ZXIge1xuICBfc2VydmVyOiBhbnk7XG4gIGxvZ2dlcjogTG9nZ2VySW5zdGFuY2U7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNvbmZpZzogU2VydmVyT3B0aW9ucywgcHVibGljIGFwcD86IGFueSkge1xuICAgIHRoaXMuYXBwID0gYXBwIHx8IGV4cHJlc3MoKTtcbiAgICB0aGlzLmxvZ2dlciA9IGNvbmZpZy5sb2dnZXI7XG5cbiAgICAvLyBQcmVwYXJlIHNlcnZlciBjb25maWd1cmF0aW9uXG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAuLi5jb25maWcsXG4gICAgICBwb3J0OiBjb25maWcucG9ydCB8fCAzMDAwLFxuICAgIH07XG5cbiAgICAvLyBTdGFydCBieSByZWdpc3RlcmluZyBTZW50cnkgaWYgYXZhaWxhYmxlXG4gICAgaWYgKHRoaXMubG9nZ2VyICYmIHRoaXMuY29uZmlnLnNlbnRyeSkge1xuICAgICAgdGhpcy5sb2dnZXIuaW5mbygnSW5pdGlhbGl6aW5nIHNlcnZlciBtaWRkbGV3YXJlOiBTZW50cnknKTtcblxuICAgICAgUmF2ZW4uY29uZmlnKHRoaXMuY29uZmlnLnNlbnRyeS5kc24sIHtcbiAgICAgICAgYXV0b0JyZWFkY3J1bWJzOiB0cnVlLFxuICAgICAgICBsb2dnZXI6ICdkZXZudXAtc2VydmVyJyxcbiAgICAgICAgcmVsZWFzZTogU0VOVFJZX1JFTEVBU0UsXG4gICAgICB9KS5pbnN0YWxsKCk7XG5cbiAgICAgIHRoaXMuYXBwLnVzZShSYXZlbi5yZXF1ZXN0SGFuZGxlcigpKTtcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdGhlIGxvZ2dlciBtaWRkbGV3YXJlXG4gICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICB0aGlzLmFwcC51c2UoKHJlcTogQmFzZVJlcXVlc3QsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICByZXEubG9nZ2VyID0gdGhpcy5sb2dnZXI7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwb3N0IGluaXRpYWxpemF0aW9uIHJvdXRpbmVzXG4gICAgdGhpcy5vbkFwcFJlYWR5KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIGxpc3RlbmluZyBvbiB0aGUgY29uZmlndXJlZCBwb3J0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxTZXJ2ZXJPcHRpb25zPn1cbiAgICovXG4gIHB1YmxpYyBsaXN0ZW4oKTogUHJvbWlzZTxTZXJ2ZXJPcHRpb25zPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIEdldCBodHRwIHNlcnZlciBpbnN0YW5jZVxuICAgICAgdGhpcy5fc2VydmVyID0gdGhpcy5hcHAubGlzdGVuKHRoaXMuY29uZmlnLnBvcnQsICgpID0+IHtcbiAgICAgICAgdGhpcy5vblN0YXJ0dXAoKS50aGVuKCgpID0+IHJlc29sdmUodGhpcy5jb25maWcpKS5jYXRjaCgoZXJyb3I6IEVycm9yKSA9PiByZWplY3QoZXJyb3IpKTtcbiAgICAgIH0pLm9uKCdlcnJvcicsIChlcnJvcjogRXJyb3IpID0+IHJlamVjdChlcnJvcikpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIHRoZSBzZXJ2ZXIgYW5kIGNsb3NlcyB0aGUgY29ubmVjdGlvbiB0byB0aGUgcG9ydC5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc3RvcCgpIHtcbiAgICBhd2FpdCB0aGlzLm9uU2h1dGRvd24oKTtcbiAgICBpZiAodGhpcy5fc2VydmVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc2VydmVyLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgbWlkZGxld2FyZSBpbml0aWFsaXphdGlvbiBzdHVmZi5cbiAgICovXG4gIHB1YmxpYyBvbkFwcFJlYWR5KCkge1xuXG4gICAgLy8gRW5hYmxlIHRoZSBDT1JTIG1pZGRsZXdhcmVcbiAgICBpZiAodGhpcy5jb25maWcuY29ycykge1xuICAgICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZyBzZXJ2ZXIgbWlkZGxld2FyZTogQ09SUycpO1xuICAgICAgfVxuICAgICAgdGhpcy5hcHAudXNlKGNvcnMoe1xuICAgICAgICBhbGxvd2VkSGVhZGVyczogJyonLFxuICAgICAgICBleHBvc2VkSGVhZGVyczogJyonLFxuICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBtdWx0ZXIgbWlkZGxld2FyZVxuICAgIGlmICh0aGlzLmNvbmZpZy5tdWx0ZXIpIHtcbiAgICAgIGlmICh0aGlzLmxvZ2dlcikge1xuICAgICAgICB0aGlzLmxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcgc2VydmVyIG1pZGRsZXdhcmU6IE11bHRlcicpO1xuICAgICAgfVxuICAgICAgdGhpcy5hcHAudXNlKG11bHRlcih0aGlzLmNvbmZpZy5tdWx0ZXIpLnNpbmdsZSgncGljdHVyZScpKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgdXNlciBhZ2VudCBtaWRkbGV3YXJlXG4gICAgaWYgKHRoaXMuY29uZmlnLnVzZXJBZ2VudCkge1xuICAgICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZyBzZXJ2ZXIgbWlkZGxld2FyZTogVXNlciBBZ2VudCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBQYXJzZXMgcmVxdWVzdCBmb3IgdGhlIHJlYWwgSVBcbiAgICAgIHRoaXMuYXBwLnVzZShyZXF1ZXN0SXAubXcoKSk7XG5cbiAgICAgIC8vIFBhcnNlcyByZXF1ZXN0IHVzZXIgYWdlbnQgaW5mb3JtYXRpb25cbiAgICAgIHRoaXMuYXBwLnVzZSh1c2VyQWdlbnQuZXhwcmVzcygpKTtcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgYmFzaWMgZXhwcmVzcyBtaWRkbGV3YXJlc1xuICAgIC8vIFRPRE86IFBhc3MgYWxsIG9mIHRoaXMgdG8gY29uZmlnXG4gICAgdGhpcy5hcHAuc2V0KCd0cnVzdF9wcm94eScsIDEpO1xuICAgIGlmICh0aGlzLmNvbmZpZy5ib2R5TGltaXQpIHtcbiAgICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyKHsgbGltaXQ6IHRoaXMuY29uZmlnLmJvZHlMaW1pdCB9KSk7XG4gICAgfVxuICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLmpzb24oKSk7XG4gICAgdGhpcy5hcHAudXNlKGJvZHlQYXJzZXIudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiBmYWxzZSB9KSk7XG4gICAgdGhpcy5hcHAudXNlKG1ldGhvZE92ZXJyaWRlKCkpO1xuXG4gICAgLy8gT25seSBlbmFibGUgY29va2llIHBhcnNlciBpZiBhIHNlY3JldCB3YXMgc2V0XG4gICAgaWYgKHRoaXMuY29uZmlnLnNlY3JldCkge1xuICAgICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZyBzZXJ2ZXIgbWlkZGxld2FyZTogQ29va2llUGFyc2VyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLmFwcC51c2UoY29va2llUGFyc2VyKHRoaXMuY29uZmlnLnNlY3JldCkpO1xuICAgIH1cblxuICAgIC8vIFV0aWxpdGFyeSBtaWRkbGV3YXJlcyBmb3IgcmVxdWVzdHMgYW5kIHJlc3BvbnNlc1xuICAgIHRoaXMuYXBwLnVzZShsZWdhY3lQYXJhbXMpO1xuICAgIHRoaXMuYXBwLnVzZShyZXNwb25zZUJpbmRlcik7XG5cbiAgICAvLyBTZXJ2ZXIgaXMgcmVhZHksIGhhbmRsZSBwb3N0IGFwcGxpY2F0aW9uIHJvdXRpbmVzXG4gICAgdGhpcy5yZWdpc3RlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyB0aGUgc2VydmVyIHJvdXRlcyBhbmQgZXJyb3IgaGFuZGxlcnMuXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVnaXN0ZXIoKSB7XG5cbiAgICAvLyBVc2UgYmFzZSByb3V0ZXIgZm9yIG1hcHBpbmcgdGhlIHJvdXRlcyB0byB0aGUgRXhwcmVzcyBzZXJ2ZXJcbiAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZyBzZXJ2ZXIgbWlkZGxld2FyZTogUm91dGVyJyk7XG4gICAgfVxuXG4gICAgLy8gQnVpbGRzIHRoZSByb3V0ZSBtYXAgYW5kIGJpbmRzIHRvIGN1cnJlbnQgZXhwcmVzcyBhcHBsaWNhdGlvblxuICAgIFJvdXRlci5idWlsZCh0aGlzLmNvbmZpZy5jb250cm9sbGVycywgdGhpcy5jb25maWcucm91dGVzLCB7XG4gICAgICBhcHA6IHRoaXMuYXBwLFxuICAgICAgcGF0aDogdGhpcy5jb25maWcucGF0aCxcbiAgICAgIGxvZ2dlcjogdGhpcy5jb25maWcubG9nZ2VyLFxuICAgIH0pO1xuXG4gICAgLy8gSGFuZGxlcyBvYXV0aCBzZXJ2ZXJcbiAgICBpZiAodGhpcy5jb25maWcub2F1dGgpIHtcbiAgICAgIGNvbnN0IHsgdG9rZW4sIC4uLm9hdXRoIH0gPSB0aGlzLmNvbmZpZy5vYXV0aDtcbiAgICAgIGlmICh0aGlzLmxvZ2dlcikge1xuICAgICAgICB0aGlzLmxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcgc2VydmVyIG1pZGRsZXdhcmU6IE9BdXRoMicpO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwYXJlIE9BdXRoIDIuMCBzZXJ2ZXIgaW5zdGFuY2UgYW5kIHRva2VuIGVuZHBvaW50XG4gICAgICB0aGlzLmFwcC5vYXV0aCA9IG5ldyBPQXV0aFNlcnZlcihvYXV0aCk7XG4gICAgICB0aGlzLmFwcC5wb3N0KCcvb2F1dGgvdG9rZW4nLCB0aGlzLmFwcC5vYXV0aC50b2tlbih0b2tlbikpO1xuICAgIH1cblxuICAgIC8vIEJpbmQgdGhlIGVycm9yIGhhbmRsZXJzXG4gICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICB0aGlzLmxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcgc2VydmVyIG1pZGRsZXdhcmU6IEVycm9yUmVwb3J0ZXInKTtcbiAgICB9XG5cbiAgICBlcnJvck1pZGRsZXdhcmUodGhpcy5jb25maWcuZXJyb3JzLCB7XG4gICAgICBsb2dnZXI6IHRoaXMubG9nZ2VyLFxuICAgICAgcmF2ZW46IHRoaXMuY29uZmlnLnNlbnRyeSA/IFJhdmVuIDogdW5kZWZpbmVkLFxuICAgIH0pKHRoaXMuYXBwKTtcblxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgcG9zdC1zdGFydHVwIHJvdXRpbmVzLCBtYXkgYmUgZXh0ZW5kZWQgZm9yIGluaXRpYWxpemluZyBkYXRhYmFzZXMgYW5kIHNlcnZpY2VzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIHB1YmxpYyBhc3luYyBvblN0YXJ0dXAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMucnVuU3RhcnR1cEpvYnMoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdVbmtub3duIHN0YXJ0dXAgZXJyb3I6ICcgKyBlcnJvci5tZXNzYWdlLCBlcnJvcik7XG4gICAgICB9XG4gICAgICBwcm9jZXNzLmV4aXQoLTEpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIHRoZSBzZXJ2ZXIgc3RhdHVwIGpvYnMsIHdpbCBjcmFzaCBpZiBhbnkgZmFpbHMuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcnVuU3RhcnR1cEpvYnMoKSB7XG4gICAgY29uc3Qgam9icyA9IHRoaXMuY29uZmlnLnN0YXJ0dXAgfHwge30gYXMgYW55O1xuICAgIGNvbnN0IHBpcGVsaW5lID0gam9icy5waXBlbGluZSB8fCBbXTtcblxuICAgIGlmIChwaXBlbGluZS5sZW5ndGgpIHtcbiAgICAgIGlmICh0aGlzLmxvZ2dlcikge1xuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnUnVubmluZyBzdGFydHVwIHBpcGVsaW5lJywgeyBqb2JzOiBwaXBlbGluZS5tYXAocCA9PiBwLm5hbWUgfHwgJ3Vua25vd24nKSB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogUnVuIGFsbCBzdGFydHVwIGpvYnMgaW4gc2VyaWVzXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChqb2JzLnBpcGVsaW5lLm1hcChhc3luYyBqb2IgPT4gam9iLnJ1bih0aGlzKSkpO1xuXG4gICAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1N1Y2Nlc3NmdWxseSByYW4gYWxsIHN0YXJ0dXAgam9icycpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHByZS1zaHV0ZG93biByb3V0aW5lcywgbWF5IGJlIGV4dGVuZGVkIGZvciBkaXNjb25uZWN0aW5nIGZyb20gZGF0YWJhc2VzIGFuZCBzZXJ2aWNlcy5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgb25TaHV0ZG93bigpIHtcbiAgICByZXR1cm47XG4gIH1cbn1cbiJdfQ==