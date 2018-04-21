"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const util = require("util");
const express = require("express");
const cleanStack = require("clean-stack");
const async_1 = require("../middlewares/async");
const filter_1 = require("../helpers/filter");
// TODO: Inject this constants from outside
// Prepare static full paths, relative to project root
const ctrl_path = '../../../api/controllers';
const BASE_CTRLS_PATH = path.join(__dirname, ctrl_path);
class ServerRouter {
    constructor(controllers, routes, options = { path: {} }) {
        if (!controllers && !routes) {
            throw new Error('Could not initialize the router without routes or controllers');
        }
        this.options = options;
        this.logger = options.logger;
        this.options.path = this.options.path || {};
        this.options.path.controllers = this.options.path.controllers || BASE_CTRLS_PATH;
        const r = routes || {};
        const c = controllers || {};
        const decoratedRoutes = this.decoratedRoutes(c);
        this.routes = {
            get: Object.assign({}, decoratedRoutes.get, r.get),
            post: Object.assign({}, decoratedRoutes.post, r.post),
            put: Object.assign({}, decoratedRoutes.put, r.put),
            delete: Object.assign({}, decoratedRoutes.delete, r.delete),
        };
        this.init();
    }
    /**
     * Prepare the controller methods to being bound.
     * @param method
     * @param ctrl
     * @returns {{}}
     */
    prepareControllerMethods(method, ctrl) {
        const decoratedRoutes = {};
        Object.keys(ctrl.routes[method] || {}).map((route) => {
            if (ctrl.baseFilters) {
                ctrl.routes[method][route].filters = ctrl.baseFilters.concat(ctrl.routes[method][route].filters);
            }
            if (ctrl.baseRoute) {
                const fullRoute = path.join(ctrl.baseRoute, route);
                decoratedRoutes[fullRoute] = ctrl.routes[method][route];
            }
            else {
                decoratedRoutes[route] = ctrl.routes[method][route];
            }
        });
        return decoratedRoutes;
    }
    /**
     * Prepare the decorated routes for being merged into the routes map.
     *
     * @param controllers The controllers map
     *
     * @returns {Object}
     */
    decoratedRoutes(controllers) {
        const decoratedRoutes = { get: {}, post: {}, put: {}, delete: {} };
        // Prepare API routes and its controllers from decorators
        Object.keys(controllers || {}).map(name => ({
            name,
            baseRoute: controllers[name].baseRoute,
            baseFilters: controllers[name].baseFilters,
            routes: controllers[name].routes(),
        })).map((ctrl) => {
            decoratedRoutes.get = Object.assign({}, decoratedRoutes.get, this.prepareControllerMethods('get', ctrl));
            decoratedRoutes.post = Object.assign({}, decoratedRoutes.post, this.prepareControllerMethods('post', ctrl));
            decoratedRoutes.put = Object.assign({}, decoratedRoutes.put, this.prepareControllerMethods('put', ctrl));
            decoratedRoutes.delete = Object.assign({}, decoratedRoutes.delete, this.prepareControllerMethods('delete', ctrl));
        });
        return decoratedRoutes;
    }
    init() {
        const map = this.routes;
        Object.keys(map).map(method => this.bindMethod(method, map[method]));
    }
    /**
     * Binds all routes registered in the method supplied
     *
     * @param method The http method to bind
     * @param routes The routes map
     *
     * @returns {boolean}
     */
    bindMethod(method, routes) {
        for (const r in routes) {
            if (routes.hasOwnProperty(r) && routes[r].controller) {
                // Ensure logger is available
                if (this.logger) {
                    this.logger.silly(`Registering server route: ${method.toUpperCase()} ${r}`);
                }
                // Get controller from map
                // noinspection JSUnresolvedVariable
                const ctrl = this.registerController(routes, r);
                // Add the filters wrapper instance to the routes map
                if (routes[r].filters && routes[r].filters.length) {
                    // Validate all filters
                    if (routes[r].filters.filter(f => !f).length > 0) {
                        console.log(routes[r].filters);
                        throw new Error('Invalid filters for route: ' + method.toUpperCase() + ' ' + r);
                    }
                    // Register route with filters in current map for biding to express
                    this.routes[method][r] = filter_1.default
                        .apply(routes[r].filters, this.options.path.filters)
                        .concat([ctrl]);
                }
                else {
                    // Register route in current map for biding to express
                    this.routes[method][r] = ctrl;
                }
            }
        }
        return true;
    }
    /**
     * Register the controller defined by the route supplied.
     *
     * @param routes The routes map
     * @param r The route to register
     *
     * @returns {any}
     */
    registerController(routes, r) {
        let ctrl = routes[r].controller;
        // Check controller type
        if (ctrl && util.isString(ctrl)) {
            try {
                // Load controller from path
                ctrl = require(path.join(this.options.path.controllers, ctrl));
                // Fix for moth modules systems (import / require)
                ctrl = ctrl.default || ctrl;
            }
            catch (e) {
                e.stack = cleanStack(e.stack);
                if (e.message.match(new RegExp(ctrl))) {
                    // Throw a direct message when controller was not found
                    const error = new Error(`Controller not found: ${path.join(ctrl_path, ctrl)}`);
                    error.stack = e.stack;
                }
                else {
                    // Unknown error
                    throw e;
                }
            }
        }
        else if (!ctrl || !util.isFunction(ctrl)) {
            // Throw invalid controller error
            throw new Error(`Controller is not valid for route: ${r}`);
        }
        return ctrl;
    }
    /**
     * Binds the controller to the express application or creates a new one.
     *
     * @param {express.Application} [app] The express application
     *
     * @returns {express.Application}
     */
    register(app) {
        this.app = app || express();
        for (const method in this.routes) {
            if (this.routes.hasOwnProperty(method)) {
                for (const r in this.routes[method]) {
                    if (r && this.routes[method].hasOwnProperty(r)) {
                        this.app[method](r, async_1.default(this.routes[method][r]));
                    }
                }
            }
        }
        // Return the app instance
        return this.app;
    }
    /**
     * Build a router using the supplied routes map and options.
     *
     * @param {Object | string} controllers The map of controller classes to bind to
     * @param {Object | string} routes The map of route files ot bind to
     *
     * @param {ServerRouterOptions} options
     */
    static build(controllers, routes, options) {
        let wrapper;
        if (routes && util.isString(routes)) {
            wrapper = new ServerRouter(controllers, require(routes), options);
        }
        else {
            wrapper = new ServerRouter(controllers, routes, options);
        }
        return wrapper.register(options ? options.app : undefined);
    }
}
exports.default = ServerRouter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3NlcnZlci9yb3V0ZXIvcm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3QixtQ0FBbUM7QUFDbkMsMENBQTBDO0FBQzFDLGdEQUFtRDtBQUNuRCw4Q0FBK0M7QUFHL0MsMkNBQTJDO0FBQzNDLHNEQUFzRDtBQUN0RCxNQUFNLFNBQVMsR0FBRywwQkFBMEIsQ0FBQztBQUU3QyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztBQVd4RDtJQU1FLFlBQVksV0FBZ0IsRUFBRSxNQUFXLEVBQUUsVUFBK0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO1FBRXBGLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLCtEQUErRCxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxlQUFlLENBQUM7UUFFakYsTUFBTSxDQUFDLEdBQUcsTUFBTSxJQUFJLEVBQUUsQ0FBQztRQUN2QixNQUFNLENBQUMsR0FBRyxXQUFXLElBQUksRUFBRSxDQUFDO1FBQzVCLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7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QyxXQUFXLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BFLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE9BQU8sR0FBRyxJQUFJLFlBQVksQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdELENBQUM7Q0FDRjtBQTVORCwrQkE0TkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgKiBhcyBjbGVhblN0YWNrIGZyb20gJ2NsZWFuLXN0YWNrJztcbmltcG9ydCBhc3luY01pZGRsZXdhcmUgZnJvbSAnLi4vbWlkZGxld2FyZXMvYXN5bmMnO1xuaW1wb3J0IEZpbHRlcnNXcmFwcGVyIGZyb20gJy4uL2hlbHBlcnMvZmlsdGVyJztcbmltcG9ydCB7IExvZ2dlckluc3RhbmNlIH0gZnJvbSAnd2luc3Rvbic7XG5cbi8vIFRPRE86IEluamVjdCB0aGlzIGNvbnN0YW50cyBmcm9tIG91dHNpZGVcbi8vIFByZXBhcmUgc3RhdGljIGZ1bGwgcGF0aHMsIHJlbGF0aXZlIHRvIHByb2plY3Qgcm9vdFxuY29uc3QgY3RybF9wYXRoID0gJy4uLy4uLy4uL2FwaS9jb250cm9sbGVycyc7XG5cbmNvbnN0IEJBU0VfQ1RSTFNfUEFUSCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIGN0cmxfcGF0aCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VydmVyUm91dGVyT3B0aW9ucyB7XG4gIGxvZ2dlcj86IExvZ2dlckluc3RhbmNlO1xuICBhcHA/OiBleHByZXNzLkFwcGxpY2F0aW9uO1xuICBwYXRoOiB7XG4gICAgY29udHJvbGxlcnM/OiBzdHJpbmc7XG4gICAgZmlsdGVycz86IHN0cmluZztcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VydmVyUm91dGVyIHtcbiAgYXBwOiBhbnk7XG4gIHJvdXRlczogYW55O1xuICBsb2dnZXI6IExvZ2dlckluc3RhbmNlO1xuICBvcHRpb25zOiBTZXJ2ZXJSb3V0ZXJPcHRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKGNvbnRyb2xsZXJzOiBhbnksIHJvdXRlczogYW55LCBvcHRpb25zOiBTZXJ2ZXJSb3V0ZXJPcHRpb25zID0geyBwYXRoOiB7fSB9KSB7XG5cbiAgICBpZiAoIWNvbnRyb2xsZXJzICYmICFyb3V0ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGluaXRpYWxpemUgdGhlIHJvdXRlciB3aXRob3V0IHJvdXRlcyBvciBjb250cm9sbGVycycpO1xuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5sb2dnZXIgPSBvcHRpb25zLmxvZ2dlcjtcbiAgICB0aGlzLm9wdGlvbnMucGF0aCA9IHRoaXMub3B0aW9ucy5wYXRoIHx8IHt9O1xuICAgIHRoaXMub3B0aW9ucy5wYXRoLmNvbnRyb2xsZXJzID0gdGhpcy5vcHRpb25zLnBhdGguY29udHJvbGxlcnMgfHwgQkFTRV9DVFJMU19QQVRIO1xuXG4gICAgY29uc3QgciA9IHJvdXRlcyB8fCB7fTtcbiAgICBjb25zdCBjID0gY29udHJvbGxlcnMgfHwge307XG4gICAgY29uc3QgZGVjb3JhdGVkUm91dGVzID0gdGhpcy5kZWNvcmF0ZWRSb3V0ZXMoYyk7XG5cbiAgICB0aGlzLnJvdXRlcyA9IHtcbiAgICAgIGdldDogeyAuLi5kZWNvcmF0ZWRSb3V0ZXMuZ2V0LCAuLi5yLmdldCB9LFxuICAgICAgcG9zdDogeyAuLi5kZWNvcmF0ZWRSb3V0ZXMucG9zdCwgLi4uci5wb3N0IH0sXG4gICAgICBwdXQ6IHsgLi4uZGVjb3JhdGVkUm91dGVzLnB1dCwgLi4uci5wdXQgfSxcbiAgICAgIGRlbGV0ZTogeyAuLi5kZWNvcmF0ZWRSb3V0ZXMuZGVsZXRlLCAuLi5yLmRlbGV0ZSB9LFxuICAgIH07XG5cbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwYXJlIHRoZSBjb250cm9sbGVyIG1ldGhvZHMgdG8gYmVpbmcgYm91bmQuXG4gICAqIEBwYXJhbSBtZXRob2RcbiAgICogQHBhcmFtIGN0cmxcbiAgICogQHJldHVybnMge3t9fVxuICAgKi9cbiAgcHJlcGFyZUNvbnRyb2xsZXJNZXRob2RzKG1ldGhvZCwgY3RybCkge1xuICAgIGNvbnN0IGRlY29yYXRlZFJvdXRlcyA9IHt9O1xuXG4gICAgT2JqZWN0LmtleXMoY3RybC5yb3V0ZXNbbWV0aG9kXSB8fCB7fSkubWFwKChyb3V0ZTogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoY3RybC5iYXNlRmlsdGVycykge1xuICAgICAgICBjdHJsLnJvdXRlc1ttZXRob2RdW3JvdXRlXS5maWx0ZXJzID0gY3RybC5iYXNlRmlsdGVycy5jb25jYXQoY3RybC5yb3V0ZXNbbWV0aG9kXVtyb3V0ZV0uZmlsdGVycyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjdHJsLmJhc2VSb3V0ZSkge1xuICAgICAgICBjb25zdCBmdWxsUm91dGUgPSBwYXRoLmpvaW4oY3RybC5iYXNlUm91dGUsIHJvdXRlKTtcbiAgICAgICAgZGVjb3JhdGVkUm91dGVzW2Z1bGxSb3V0ZV0gPSBjdHJsLnJvdXRlc1ttZXRob2RdW3JvdXRlXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlY29yYXRlZFJvdXRlc1tyb3V0ZV0gPSBjdHJsLnJvdXRlc1ttZXRob2RdW3JvdXRlXTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBkZWNvcmF0ZWRSb3V0ZXM7XG4gIH1cblxuICAvKipcbiAgICogUHJlcGFyZSB0aGUgZGVjb3JhdGVkIHJvdXRlcyBmb3IgYmVpbmcgbWVyZ2VkIGludG8gdGhlIHJvdXRlcyBtYXAuXG4gICAqXG4gICAqIEBwYXJhbSBjb250cm9sbGVycyBUaGUgY29udHJvbGxlcnMgbWFwXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAqL1xuICBkZWNvcmF0ZWRSb3V0ZXMoY29udHJvbGxlcnMpIHtcbiAgICBjb25zdCBkZWNvcmF0ZWRSb3V0ZXMgPSB7IGdldDoge30sIHBvc3Q6IHt9LCBwdXQ6IHt9LCBkZWxldGU6IHt9IH07XG5cbiAgICAvLyBQcmVwYXJlIEFQSSByb3V0ZXMgYW5kIGl0cyBjb250cm9sbGVycyBmcm9tIGRlY29yYXRvcnNcbiAgICBPYmplY3Qua2V5cyhjb250cm9sbGVycyB8fCB7fSkubWFwKG5hbWUgPT4gKHtcbiAgICAgIG5hbWUsXG4gICAgICBiYXNlUm91dGU6IGNvbnRyb2xsZXJzW25hbWVdLmJhc2VSb3V0ZSxcbiAgICAgIGJhc2VGaWx0ZXJzOiBjb250cm9sbGVyc1tuYW1lXS5iYXNlRmlsdGVycyxcbiAgICAgIHJvdXRlczogY29udHJvbGxlcnNbbmFtZV0ucm91dGVzKCksXG4gICAgfSkpLm1hcCgoY3RybDogYW55KSA9PiB7XG4gICAgICBkZWNvcmF0ZWRSb3V0ZXMuZ2V0ID0ge1xuICAgICAgICAuLi5kZWNvcmF0ZWRSb3V0ZXMuZ2V0LFxuICAgICAgICAuLi50aGlzLnByZXBhcmVDb250cm9sbGVyTWV0aG9kcygnZ2V0JywgY3RybCksXG4gICAgICB9O1xuICAgICAgZGVjb3JhdGVkUm91dGVzLnBvc3QgPSB7XG4gICAgICAgIC4uLmRlY29yYXRlZFJvdXRlcy5wb3N0LFxuICAgICAgICAuLi50aGlzLnByZXBhcmVDb250cm9sbGVyTWV0aG9kcygncG9zdCcsIGN0cmwpLFxuICAgICAgfTtcbiAgICAgIGRlY29yYXRlZFJvdXRlcy5wdXQgPSB7XG4gICAgICAgIC4uLmRlY29yYXRlZFJvdXRlcy5wdXQsXG4gICAgICAgIC4uLnRoaXMucHJlcGFyZUNvbnRyb2xsZXJNZXRob2RzKCdwdXQnLCBjdHJsKSxcbiAgICAgIH07XG4gICAgICBkZWNvcmF0ZWRSb3V0ZXMuZGVsZXRlID0ge1xuICAgICAgICAuLi5kZWNvcmF0ZWRSb3V0ZXMuZGVsZXRlLFxuICAgICAgICAuLi50aGlzLnByZXBhcmVDb250cm9sbGVyTWV0aG9kcygnZGVsZXRlJywgY3RybCksXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRlY29yYXRlZFJvdXRlcztcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5yb3V0ZXM7XG4gICAgT2JqZWN0LmtleXMobWFwKS5tYXAobWV0aG9kID0+IHRoaXMuYmluZE1ldGhvZChtZXRob2QsIG1hcFttZXRob2RdKSk7XG4gIH1cblxuICAvKipcbiAgICogQmluZHMgYWxsIHJvdXRlcyByZWdpc3RlcmVkIGluIHRoZSBtZXRob2Qgc3VwcGxpZWRcbiAgICpcbiAgICogQHBhcmFtIG1ldGhvZCBUaGUgaHR0cCBtZXRob2QgdG8gYmluZFxuICAgKiBAcGFyYW0gcm91dGVzIFRoZSByb3V0ZXMgbWFwXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgYmluZE1ldGhvZChtZXRob2QsIHJvdXRlcykge1xuICAgIGZvciAoY29uc3QgciBpbiByb3V0ZXMpIHtcbiAgICAgIGlmIChyb3V0ZXMuaGFzT3duUHJvcGVydHkocikgJiYgcm91dGVzW3JdLmNvbnRyb2xsZXIpIHtcbiAgICAgICAgLy8gRW5zdXJlIGxvZ2dlciBpcyBhdmFpbGFibGVcbiAgICAgICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIuc2lsbHkoYFJlZ2lzdGVyaW5nIHNlcnZlciByb3V0ZTogJHttZXRob2QudG9VcHBlckNhc2UoKX0gJHtyfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IGNvbnRyb2xsZXIgZnJvbSBtYXBcbiAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEpTVW5yZXNvbHZlZFZhcmlhYmxlXG4gICAgICAgIGNvbnN0IGN0cmwgPSB0aGlzLnJlZ2lzdGVyQ29udHJvbGxlcihyb3V0ZXMsIHIpO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgZmlsdGVycyB3cmFwcGVyIGluc3RhbmNlIHRvIHRoZSByb3V0ZXMgbWFwXG4gICAgICAgIGlmIChyb3V0ZXNbcl0uZmlsdGVycyAmJiByb3V0ZXNbcl0uZmlsdGVycy5sZW5ndGgpIHtcblxuICAgICAgICAgIC8vIFZhbGlkYXRlIGFsbCBmaWx0ZXJzXG4gICAgICAgICAgaWYgKHJvdXRlc1tyXS5maWx0ZXJzLmZpbHRlcihmID0+ICFmKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyb3V0ZXNbcl0uZmlsdGVycyk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZmlsdGVycyBmb3Igcm91dGU6ICcgKyBtZXRob2QudG9VcHBlckNhc2UoKSArICcgJyArIHIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFJlZ2lzdGVyIHJvdXRlIHdpdGggZmlsdGVycyBpbiBjdXJyZW50IG1hcCBmb3IgYmlkaW5nIHRvIGV4cHJlc3NcbiAgICAgICAgICB0aGlzLnJvdXRlc1ttZXRob2RdW3JdID0gRmlsdGVyc1dyYXBwZXJcbiAgICAgICAgICAgIC5hcHBseShyb3V0ZXNbcl0uZmlsdGVycywgdGhpcy5vcHRpb25zLnBhdGguZmlsdGVycylcbiAgICAgICAgICAgIC5jb25jYXQoW2N0cmxdKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFJlZ2lzdGVyIHJvdXRlIGluIGN1cnJlbnQgbWFwIGZvciBiaWRpbmcgdG8gZXhwcmVzc1xuICAgICAgICAgIHRoaXMucm91dGVzW21ldGhvZF1bcl0gPSBjdHJsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIHRoZSBjb250cm9sbGVyIGRlZmluZWQgYnkgdGhlIHJvdXRlIHN1cHBsaWVkLlxuICAgKlxuICAgKiBAcGFyYW0gcm91dGVzIFRoZSByb3V0ZXMgbWFwXG4gICAqIEBwYXJhbSByIFRoZSByb3V0ZSB0byByZWdpc3RlclxuICAgKlxuICAgKiBAcmV0dXJucyB7YW55fVxuICAgKi9cbiAgcmVnaXN0ZXJDb250cm9sbGVyKHJvdXRlcywgcikge1xuICAgIGxldCBjdHJsID0gcm91dGVzW3JdLmNvbnRyb2xsZXI7XG5cbiAgICAvLyBDaGVjayBjb250cm9sbGVyIHR5cGVcbiAgICBpZiAoY3RybCAmJiB1dGlsLmlzU3RyaW5nKGN0cmwpKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGNvbnRyb2xsZXIgZnJvbSBwYXRoXG4gICAgICAgIGN0cmwgPSByZXF1aXJlKHBhdGguam9pbih0aGlzLm9wdGlvbnMucGF0aC5jb250cm9sbGVycywgY3RybCkpO1xuICAgICAgICAvLyBGaXggZm9yIG1vdGggbW9kdWxlcyBzeXN0ZW1zIChpbXBvcnQgLyByZXF1aXJlKVxuICAgICAgICBjdHJsID0gY3RybC5kZWZhdWx0IHx8IGN0cmw7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGUuc3RhY2sgPSBjbGVhblN0YWNrKGUuc3RhY2spO1xuXG4gICAgICAgIGlmIChlLm1lc3NhZ2UubWF0Y2gobmV3IFJlZ0V4cChjdHJsKSkpIHtcbiAgICAgICAgICAvLyBUaHJvdyBhIGRpcmVjdCBtZXNzYWdlIHdoZW4gY29udHJvbGxlciB3YXMgbm90IGZvdW5kXG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoYENvbnRyb2xsZXIgbm90IGZvdW5kOiAke3BhdGguam9pbihjdHJsX3BhdGgsIGN0cmwpfWApO1xuICAgICAgICAgIGVycm9yLnN0YWNrID0gZS5zdGFjaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBVbmtub3duIGVycm9yXG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIWN0cmwgfHwgIXV0aWwuaXNGdW5jdGlvbihjdHJsKSkge1xuICAgICAgLy8gVGhyb3cgaW52YWxpZCBjb250cm9sbGVyIGVycm9yXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbnRyb2xsZXIgaXMgbm90IHZhbGlkIGZvciByb3V0ZTogJHtyfWApO1xuICAgIH1cbiAgICByZXR1cm4gY3RybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyB0aGUgY29udHJvbGxlciB0byB0aGUgZXhwcmVzcyBhcHBsaWNhdGlvbiBvciBjcmVhdGVzIGEgbmV3IG9uZS5cbiAgICpcbiAgICogQHBhcmFtIHtleHByZXNzLkFwcGxpY2F0aW9ufSBbYXBwXSBUaGUgZXhwcmVzcyBhcHBsaWNhdGlvblxuICAgKlxuICAgKiBAcmV0dXJucyB7ZXhwcmVzcy5BcHBsaWNhdGlvbn1cbiAgICovXG4gIHJlZ2lzdGVyKGFwcD86IGV4cHJlc3MuQXBwbGljYXRpb24pIHtcbiAgICB0aGlzLmFwcCA9IGFwcCB8fCBleHByZXNzKCk7XG4gICAgZm9yIChjb25zdCBtZXRob2QgaW4gdGhpcy5yb3V0ZXMpIHtcbiAgICAgIGlmICh0aGlzLnJvdXRlcy5oYXNPd25Qcm9wZXJ0eShtZXRob2QpKSB7XG4gICAgICAgIGZvciAoY29uc3QgciBpbiB0aGlzLnJvdXRlc1ttZXRob2RdKSB7XG4gICAgICAgICAgaWYgKHIgJiYgdGhpcy5yb3V0ZXNbbWV0aG9kXS5oYXNPd25Qcm9wZXJ0eShyKSkge1xuICAgICAgICAgICAgdGhpcy5hcHBbbWV0aG9kXShyLCBhc3luY01pZGRsZXdhcmUodGhpcy5yb3V0ZXNbbWV0aG9kXVtyXSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZXR1cm4gdGhlIGFwcCBpbnN0YW5jZVxuICAgIHJldHVybiB0aGlzLmFwcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCBhIHJvdXRlciB1c2luZyB0aGUgc3VwcGxpZWQgcm91dGVzIG1hcCBhbmQgb3B0aW9ucy5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3QgfCBzdHJpbmd9IGNvbnRyb2xsZXJzIFRoZSBtYXAgb2YgY29udHJvbGxlciBjbGFzc2VzIHRvIGJpbmQgdG9cbiAgICogQHBhcmFtIHtPYmplY3QgfCBzdHJpbmd9IHJvdXRlcyBUaGUgbWFwIG9mIHJvdXRlIGZpbGVzIG90IGJpbmQgdG9cbiAgICpcbiAgICogQHBhcmFtIHtTZXJ2ZXJSb3V0ZXJPcHRpb25zfSBvcHRpb25zXG4gICAqL1xuICBzdGF0aWMgYnVpbGQoY29udHJvbGxlcnM6IG9iamVjdCB8IHN0cmluZywgcm91dGVzOiBvYmplY3QgfCBzdHJpbmcsIG9wdGlvbnM/OiBTZXJ2ZXJSb3V0ZXJPcHRpb25zKSB7XG4gICAgbGV0IHdyYXBwZXI7XG5cbiAgICBpZiAocm91dGVzICYmIHV0aWwuaXNTdHJpbmcocm91dGVzKSkge1xuICAgICAgd3JhcHBlciA9IG5ldyBTZXJ2ZXJSb3V0ZXIoY29udHJvbGxlcnMsIHJlcXVpcmUocm91dGVzKSwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdyYXBwZXIgPSBuZXcgU2VydmVyUm91dGVyKGNvbnRyb2xsZXJzLCByb3V0ZXMsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHJldHVybiB3cmFwcGVyLnJlZ2lzdGVyKG9wdGlvbnMgPyBvcHRpb25zLmFwcCA6IHVuZGVmaW5lZCk7XG4gIH1cbn1cbiJdfQ==