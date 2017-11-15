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
     * Handles post-startup routines, may be extended for initializing databases and services.
     *
     * @returns {Promise<void>}
     */
    onStartup() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvc2VydmVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQkFBK0I7QUFDL0IsaUNBQWlDO0FBQ2pDLG1DQUFtQztBQUNuQyx3Q0FBd0M7QUFDeEMsK0NBQStDO0FBQy9DLG9DQUFvQztBQUNwQywwQ0FBMEM7QUFDMUMsOENBQThDO0FBQzlDLGtEQUFrRDtBQUNsRCxvREFBb0Q7QUFFcEQscUNBQWtDO0FBQ2xDLCtDQUF5RTtBQUN6RSx5REFBcUY7QUFDckYsMkNBQTJDO0FBRzNDLG9EQUF5RTtBQWlCdkUscUJBakJPLHVCQUFVLENBaUJQO0FBQUUsY0FqQk8sZ0JBQUcsQ0FpQlA7QUFBRSxlQWpCTyxpQkFBSSxDQWlCUDtBQUFFLGNBakJPLGdCQUFHLENBaUJQO0FBQUUsaUJBakJPLG1CQUFNLENBaUJQO0FBaEJwQyxvREFBNkM7QUFpQjNDLG1CQWpCSyxrQkFBUSxDQWlCTDtBQWhCVixzREFBK0M7QUFnQm5DLG9CQWhCTCxtQkFBUyxDQWdCSztBQWRyQixNQUFNLE1BQU0sR0FBRyxlQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7QUFZYix3QkFBTTtBQVZuQyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFO0lBQ3JGLElBQUksQ0FBQztRQUNILE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEIsQ0FBQztJQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDakIsQ0FBQztBQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFTCwrQ0FBeUQ7QUFBaEQsOEJBQUEsT0FBTyxDQUFZO0FBd0M1QjtJQUlFLFlBQW1CLE1BQXFCLEVBQVMs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QUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTTtRQUNYLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNyQywyQkFBMkI7WUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQVksRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDM0YsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQVksRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7UUFDakQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNVLElBQUk7O1lBQ2YsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDeEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzlCLENBQUM7UUFDSCxDQUFDO0tBQUE7SUFHRDs7OztPQUlHO0lBQ1UsU0FBUzs7WUFDcEIsTUFBTSxDQUFDO1FBQ1QsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNVLFVBQVU7O1lBQ3JCLE1BQU0sQ0FBQztRQUNULENBQUM7S0FBQTtDQUNGO0FBbEtELHlCQWtLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJhdmVuIGZyb20gJ3JhdmVuJztcbmltcG9ydCAqIGFzIG11bHRlciBmcm9tICdtdWx0ZXInO1xuaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCAqIGFzIHJlcXVlc3RJcCBmcm9tICdyZXF1ZXN0LWlwJztcbmltcG9ydCAqIGFzIHVzZXJBZ2VudCBmcm9tICdleHByZXNzLXVzZXJhZ2VudCc7XG5pbXBvcnQgKiBhcyBHaXQgZnJvbSAnZ2l0LXJldi1zeW5jJztcbmltcG9ydCAqIGFzIGJvZHlQYXJzZXIgZnJvbSAnYm9keS1wYXJzZXInO1xuaW1wb3J0ICogYXMgY29va2llUGFyc2VyIGZyb20gJ2Nvb2tpZS1wYXJzZXInO1xuaW1wb3J0ICogYXMgbWV0aG9kT3ZlcnJpZGUgZnJvbSAnbWV0aG9kLW92ZXJyaWRlJztcbmltcG9ydCAqIGFzIE9BdXRoU2VydmVyIGZyb20gJ2V4cHJlc3Mtb2F1dGgtc2VydmVyJztcbmltcG9ydCB7IExvZ2dlckluc3RhbmNlIH0gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICcuL3JvdXRlcic7XG5pbXBvcnQgeyBjb3JzLCBsZWdhY3lQYXJhbXMsIHJlc3BvbnNlQmluZGVyIH0gZnJvbSAnLi9taWRkbGV3YXJlcy9pbmRleCc7XG5pbXBvcnQgeyBkZWZhdWx0IGFzIGVycm9yTWlkZGxld2FyZSwgRXJyb3JEZWZpbml0aW9ucyB9IGZyb20gXCIuL2Vycm9yL0Vycm9yUmVwb3J0ZXJcIjtcbmltcG9ydCBTaW1wbGVMb2dnZXIgZnJvbSBcIi4uL2xvZ2dlci9pbmRleFwiO1xuaW1wb3J0IHsgQmFzZVJlcXVlc3QgfSBmcm9tIFwiLi4vYmFzZS9CYXNlUmVxdWVzdFwiO1xuaW1wb3J0IHsgQmFzZVJlc3BvbnNlIH0gZnJvbSBcIi4uL2Jhc2UvQmFzZVJlc3BvbnNlXCI7XG5pbXBvcnQgeyBDb250cm9sbGVyLCBHZXQsIFBvc3QsIFB1dCwgRGVsZXRlIH0gZnJvbSAnLi9yb3V0ZXIvZGVjb3JhdG9ycyc7XG5pbXBvcnQgSHR0cENvZGUgZnJvbSAnLi9lcnJvci9odHRwL0h0dHBDb2RlJztcbmltcG9ydCBIdHRwRXJyb3IgZnJvbSAnLi9lcnJvci9odHRwL0h0dHBFcnJvcic7XG5cbmNvbnN0IExvZ2dlciA9IFNpbXBsZUxvZ2dlci5nZXRJbnN0YW5jZSgpO1xuXG5jb25zdCBTRU5UUllfUkVMRUFTRSA9IHByb2Nlc3MuZW52LlNFTlRSWV9SRUxFQVNFID8gcHJvY2Vzcy5lbnYuU0VOVFJZX1JFTEVBU0UgOiAoKCkgPT4ge1xuICB0cnkge1xuICAgIHJldHVybiBHaXQubG9uZygpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICB9XG59KSgpO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIHJlc3BvbnNlIH0gZnJvbSAnLi9oZWxwZXJzL3Jlc3BvbnNlJztcblxuZXhwb3J0IHtcbiAgQmFzZVJlcXVlc3QsIEJhc2VSZXNwb25zZSwgTG9nZ2VyLFxuICBDb250cm9sbGVyLCBHZXQsIFBvc3QsIFB1dCwgRGVsZXRlLFxuICBIdHRwQ29kZSwgSHR0cEVycm9yLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZXJPcHRpb25zIHtcbiAgcG9ydDogbnVtYmVyLFxuICBzZWNyZXQ/OiBzdHJpbmcsXG4gIHJvdXRlcz86IGFueSxcbiAgY29ycz86IGJvb2xlYW4sXG4gIHVzZXJBZ2VudD86IGJvb2xlYW4sXG4gIGNvbnRyb2xsZXJzPzogb2JqZWN0O1xuICBwYXRoPzoge1xuICAgIGZpbHRlcnM/OiBzdHJpbmc7XG4gICAgY29udHJvbGxlcnM/OiBzdHJpbmc7XG4gIH07XG4gIHNlbnRyeT86IHtcbiAgICBkc246IHN0cmluZztcbiAgfTtcbiAgbXVsdGVyPzogYW55LFxuICBvYXV0aD86IHtcbiAgICBtb2RlbDogYW55OyAvLyBUT0RPOiBTcGVjaWZ5IHRoZSBzaWduYXR1cmVcbiAgICB1c2VFcnJvckhhbmRsZXI/OiBib29sZWFuO1xuICAgIGNvbnRpbnVlTWlkZGxld2FyZT86IGJvb2xlYW47XG4gICAgYWxsb3dFeHRlbmRlZFRva2VuQXR0cmlidXRlcz86IGJvb2xlYW47XG4gICAgdG9rZW4/OiB7XG4gICAgICBleHRlbmRlZEdyYW50VHlwZXM/OiBhbnk7XG4gICAgICBhY2Nlc3NUb2tlbkxpZmV0aW1lPzogbnVtYmVyO1xuICAgICAgcmVmcmVzaFRva2VuTGlmZXRpbWU/OiBudW1iZXI7XG4gICAgICByZXF1aXJlQ2xpZW50QXV0aGVudGljYXRpb24/OiBib29sZWFuO1xuICAgICAgYWxsb3dFeHRlbmRlZFRva2VuQXR0cmlidXRlcz86IGJvb2xlYW47XG4gICAgfVxuICB9LFxuICBsb2dnZXI/OiBMb2dnZXJJbnN0YW5jZTtcbiAgZXJyb3JzPzogRXJyb3JEZWZpbml0aW9ucztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VydmVyIHtcbiAgX3NlcnZlcjogYW55O1xuICBsb2dnZXI6IExvZ2dlckluc3RhbmNlO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb25maWc6IFNlcnZlck9wdGlvbnMsIHB1YmxpYyBhcHA/OiBhbnkpIHtcbiAgICB0aGlzLmFwcCA9IGFwcCB8fCBleHByZXNzKCk7XG4gICAgdGhpcy5sb2dnZXIgPSBjb25maWcubG9nZ2VyO1xuXG4gICAgLy8gUHJlcGFyZSBzZXJ2ZXIgY29uZmlndXJhdGlvblxuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgLi4uY29uZmlnLFxuICAgICAgcG9ydDogY29uZmlnLnBvcnQgfHwgMzAwMFxuICAgIH07XG5cbiAgICAvLyBTdGFydCBieSByZWdpc3RlcmluZyBTZW50cnkgaWYgYXZhaWxhYmxlXG4gICAgaWYgKHRoaXMubG9nZ2VyICYmIHRoaXMuY29uZmlnLnNlbnRyeSkge1xuICAgICAgdGhpcy5sb2dnZXIuaW5mbygnSW5pdGlhbGl6aW5nIHNlcnZlciBtaWRkbGV3YXJlOiBTZW50cnknKTtcblxuICAgICAgUmF2ZW4uY29uZmlnKHRoaXMuY29uZmlnLnNlbnRyeS5kc24sIHtcbiAgICAgICAgYXV0b0JyZWFkY3J1bWJzOiB0cnVlLFxuICAgICAgICBsb2dnZXI6ICdkZXZudXAtc2VydmVyJyxcbiAgICAgICAgcmVsZWFzZTogU0VOVFJZX1JFTEVBU0VcbiAgICAgIH0pLmluc3RhbGwoKTtcblxuICAgICAgdGhpcy5hcHAudXNlKFJhdmVuLnJlcXVlc3RIYW5kbGVyKCkpO1xuICAgIH1cblxuICAgIC8vIEVuYWJsZSB0aGUgbG9nZ2VyIG1pZGRsZXdhcmVcbiAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgIHRoaXMuYXBwLnVzZSgocmVxOiBCYXNlUmVxdWVzdCwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIHJlcS5sb2dnZXIgPSB0aGlzLmxvZ2dlcjtcbiAgICAgICAgbmV4dCgpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdGhlIENPUlMgbWlkZGxld2FyZVxuICAgIGlmICh0aGlzLmNvbmZpZy5jb3JzKSB7XG4gICAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuaW5mbygnSW5pdGlhbGl6aW5nIHNlcnZlciBtaWRkbGV3YXJlOiBDT1JTJyk7XG4gICAgICB9XG4gICAgICB0aGlzLmFwcC51c2UoY29ycygpKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgbXVsdGVyIG1pZGRsZXdhcmVcbiAgICBpZiAodGhpcy5jb25maWcubXVsdGVyKSB7XG4gICAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuaW5mbygnSW5pdGlhbGl6aW5nIHNlcnZlciBtaWRkbGV3YXJlOiBNdWx0ZXInKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYXBwLnVzZShtdWx0ZXIodGhpcy5jb25maWcubXVsdGVyKS5zaW5nbGUoJ3BpY3R1cmUnKSk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHVzZXIgYWdlbnQgbWlkZGxld2FyZVxuICAgIGlmICh0aGlzLmNvbmZpZy51c2VyQWdlbnQpIHtcbiAgICAgIGlmICh0aGlzLmxvZ2dlcikge1xuICAgICAgICB0aGlzLmxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcgc2VydmVyIG1pZGRsZXdhcmU6IFVzZXIgQWdlbnQnKTtcbiAgICAgIH1cblxuICAgICAgLy8gUGFyc2VzIHJlcXVlc3QgZm9yIHRoZSByZWFsIElQXG4gICAgICB0aGlzLmFwcC51c2UocmVxdWVzdElwLm13KCkpO1xuXG4gICAgICAvLyBQYXJzZXMgcmVxdWVzdCB1c2VyIGFnZW50IGluZm9ybWF0aW9uXG4gICAgICB0aGlzLmFwcC51c2UodXNlckFnZW50LmV4cHJlc3MoKSk7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIGJhc2ljIGV4cHJlc3MgbWlkZGxld2FyZXNcbiAgICAvLyBUT0RPOiBQYXNzIGFsbCBvZiB0aGlzIHRvIGNvbmZpZ1xuICAgIHRoaXMuYXBwLnNldCgndHJ1c3RfcHJveHknLCAxKTtcbiAgICB0aGlzLmFwcC51c2UoYm9keVBhcnNlci5qc29uKCkpO1xuICAgIHRoaXMuYXBwLnVzZShib2R5UGFyc2VyLnVybGVuY29kZWQoeyBleHRlbmRlZDogZmFsc2UgfSkpO1xuICAgIHRoaXMuYXBwLnVzZShtZXRob2RPdmVycmlkZSgpKTtcblxuICAgIC8vIE9ubHkgZW5hYmxlIGNvb2tpZSBwYXJzZXIgaWYgYSBzZWNyZXQgd2FzIHNldFxuICAgIGlmICh0aGlzLmNvbmZpZy5zZWNyZXQpIHtcbiAgICAgIGlmICh0aGlzLmxvZ2dlcikge1xuICAgICAgICB0aGlzLmxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcgc2VydmVyIG1pZGRsZXdhcmU6IENvb2tpZVBhcnNlcicpO1xuICAgICAgfVxuICAgICAgdGhpcy5hcHAudXNlKGNvb2tpZVBhcnNlcih0aGlzLmNvbmZpZy5zZWNyZXQpKTtcbiAgICB9XG5cbiAgICAvLyBVdGlsaXRhcnkgbWlkZGxld2FyZXMgZm9yIHJlcXVlc3RzIGFuZCByZXNwb25zZXNcbiAgICB0aGlzLmFwcC51c2UobGVnYWN5UGFyYW1zKTtcbiAgICB0aGlzLmFwcC51c2UocmVzcG9uc2VCaW5kZXIpO1xuXG4gICAgLy8gVXNlIGJhc2Ugcm91dGVyIGZvciBtYXBwaW5nIHRoZSByb3V0ZXMgdG8gdGhlIEV4cHJlc3Mgc2VydmVyXG4gICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICB0aGlzLmxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcgc2VydmVyIG1pZGRsZXdhcmU6IFJvdXRlcicpO1xuICAgIH1cblxuICAgIC8vIEJ1aWxkcyB0aGUgcm91dGUgbWFwIGFuZCBiaW5kcyB0byBjdXJyZW50IGV4cHJlc3MgYXBwbGljYXRpb25cbiAgICBSb3V0ZXIuYnVpbGQodGhpcy5jb25maWcuY29udHJvbGxlcnMsIHRoaXMuY29uZmlnLnJvdXRlcywge1xuICAgICAgYXBwOiB0aGlzLmFwcCxcbiAgICAgIHBhdGg6IHRoaXMuY29uZmlnLnBhdGgsXG4gICAgICBsb2dnZXI6IHRoaXMuY29uZmlnLmxvZ2dlcixcbiAgICB9KTtcblxuICAgIC8vIEhhbmRsZXMgb2F1dGggc2VydmVyXG4gICAgaWYgKHRoaXMuY29uZmlnLm9hdXRoKSB7XG4gICAgICBjb25zdCB7IHRva2VuLCAuLi5vYXV0aCB9ID0gdGhpcy5jb25maWcub2F1dGg7XG4gICAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuaW5mbygnSW5pdGlhbGl6aW5nIHNlcnZlciBtaWRkbGV3YXJlOiBPQXV0aDInKTtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGFyZSBPQXV0aCAyLjAgc2VydmVyIGluc3RhbmNlIGFuZCB0b2tlbiBlbmRwb2ludFxuICAgICAgdGhpcy5hcHAub2F1dGggPSBuZXcgT0F1dGhTZXJ2ZXIob2F1dGgpO1xuICAgICAgdGhpcy5hcHAucG9zdCgnL29hdXRoL3Rva2VuJywgdGhpcy5hcHAub2F1dGgudG9rZW4odG9rZW4pKTtcbiAgICB9XG5cbiAgICAvLyBCaW5kIHRoZSBlcnJvciBoYW5kbGVyc1xuICAgIGlmICh0aGlzLmxvZ2dlcikge1xuICAgICAgdGhpcy5sb2dnZXIuaW5mbygnSW5pdGlhbGl6aW5nIHNlcnZlciBtaWRkbGV3YXJlOiBFcnJvclJlcG9ydGVyJyk7XG4gICAgfVxuXG4gICAgZXJyb3JNaWRkbGV3YXJlKHRoaXMuY29uZmlnLmVycm9ycywge1xuICAgICAgbG9nZ2VyOiB0aGlzLmxvZ2dlcixcbiAgICAgIHJhdmVuOiB0aGlzLmNvbmZpZy5zZW50cnkgPyBSYXZlbiA6IHVuZGVmaW5lZFxuICAgIH0pKHRoaXMuYXBwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgbGlzdGVuaW5nIG9uIHRoZSBjb25maWd1cmVkIHBvcnQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPFNlcnZlck9wdGlvbnM+fVxuICAgKi9cbiAgcHVibGljIGxpc3RlbigpOiBQcm9taXNlPFNlcnZlck9wdGlvbnM+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gR2V0IGh0dHAgc2VydmVyIGluc3RhbmNlXG4gICAgICB0aGlzLl9zZXJ2ZXIgPSB0aGlzLmFwcC5saXN0ZW4odGhpcy5jb25maWcucG9ydCwgKCkgPT4ge1xuICAgICAgICB0aGlzLm9uU3RhcnR1cCgpLnRoZW4oKCkgPT4gcmVzb2x2ZSh0aGlzLmNvbmZpZykpLmNhdGNoKChlcnJvcjogRXJyb3IpID0+IHJlamVjdChlcnJvcikpO1xuICAgICAgfSkub24oJ2Vycm9yJywgKGVycm9yOiBFcnJvcikgPT4gcmVqZWN0KGVycm9yKSlcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyB0aGUgc2VydmVyIGFuZCBjbG9zZXMgdGhlIGNvbm5lY3Rpb24gdG8gdGhlIHBvcnQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgcHVibGljIGFzeW5jIHN0b3AoKSB7XG4gICAgYXdhaXQgdGhpcy5vblNodXRkb3duKCk7XG4gICAgaWYgKHRoaXMuX3NlcnZlcikge1xuICAgICAgcmV0dXJuIHRoaXMuX3NlcnZlci5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgcG9zdC1zdGFydHVwIHJvdXRpbmVzLCBtYXkgYmUgZXh0ZW5kZWQgZm9yIGluaXRpYWxpemluZyBkYXRhYmFzZXMgYW5kIHNlcnZpY2VzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIHB1YmxpYyBhc3luYyBvblN0YXJ0dXAoKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgcHJlLXNodXRkb3duIHJvdXRpbmVzLCBtYXkgYmUgZXh0ZW5kZWQgZm9yIGRpc2Nvbm5lY3RpbmcgZnJvbSBkYXRhYmFzZXMgYW5kIHNlcnZpY2VzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIHB1YmxpYyBhc3luYyBvblNodXRkb3duKCkge1xuICAgIHJldHVybjtcbiAgfVxufVxuIl19