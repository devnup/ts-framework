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
        routes = routes || {};
        controllers = controllers || {};
        const decoratedRoutes = this.decoratedRoutes(controllers);
        this.routes = {
            get: Object.assign({}, decoratedRoutes.get, routes.get),
            post: Object.assign({}, decoratedRoutes.post, routes.post),
            put: Object.assign({}, decoratedRoutes.put, routes.put),
            'delete': Object.assign({}, decoratedRoutes.delete, routes.delete),
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
        Object.keys(ctrl.routes[method] || {}).map(route => {
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
        let decoratedRoutes = { get: {}, post: {}, put: {}, 'delete': {} };
        // Prepare API routes and its controllers from decorators
        Object.keys(controllers || {}).map(name => ({
            name,
            baseRoute: controllers[name].baseRoute,
            baseFilters: controllers[name].baseFilters,
            routes: controllers[name].routes(),
        })).map(ctrl => {
            decoratedRoutes.get = Object.assign({}, decoratedRoutes.get, this.prepareControllerMethods('get', ctrl));
            decoratedRoutes.post = Object.assign({}, decoratedRoutes.post, this.prepareControllerMethods('post', ctrl));
            decoratedRoutes.put = Object.assign({}, decoratedRoutes.put, this.prepareControllerMethods('put', ctrl));
            decoratedRoutes.delete = Object.assign({}, decoratedRoutes.delete, this.prepareControllerMethods('delete', ctrl));
        });
        return decoratedRoutes;
    }
    init() {
        const map = this.routes;
        Object.keys(map).map((method) => this.bindMethod(method, map[method]));
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
                let ctrl = this.registerController(routes, r);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3NlcnZlci9yb3V0ZXIvcm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3QixtQ0FBbUM7QUFFbkMsMENBQTBDO0FBQzFDLGdEQUFtRDtBQUNuRCw4Q0FBK0M7QUFHL0MsMkNBQTJDO0FBQzNDLHNEQUFzRDtBQUN0RCxNQUFNLFNBQVMsR0FBRywwQkFBMEIsQ0FBQztBQUU3QyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztBQVd4RDtJQU1FLFlBQVksV0FBZ0IsRUFBRSxNQUFXLEVBQUUsVUFBK0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO1FBQ3BGLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLCtEQUErRCxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxlQUFlLENBQUM7UUFFakYsTUFBTSxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDdEIsV0FBVyxHQUFHLFdBQVcsSUFBSSxFQUFFLENBQUM7UUFDaEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUUxRCxJQUFJ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LENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sT0FBTyxHQUFHLElBQUksWUFBWSxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0QsQ0FBQztDQUNGO0FBM05ELCtCQTJOQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJ3V0aWwnO1xuaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IEFwcGxpY2F0aW9uIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgKiBhcyBjbGVhblN0YWNrIGZyb20gJ2NsZWFuLXN0YWNrJztcbmltcG9ydCBhc3luY01pZGRsZXdhcmUgZnJvbSAnLi4vbWlkZGxld2FyZXMvYXN5bmMnO1xuaW1wb3J0IEZpbHRlcnNXcmFwcGVyIGZyb20gJy4uL2hlbHBlcnMvZmlsdGVyJztcbmltcG9ydCB7IExvZ2dlckluc3RhbmNlIH0gZnJvbSBcIndpbnN0b25cIjtcblxuLy8gVE9ETzogSW5qZWN0IHRoaXMgY29uc3RhbnRzIGZyb20gb3V0c2lkZVxuLy8gUHJlcGFyZSBzdGF0aWMgZnVsbCBwYXRocywgcmVsYXRpdmUgdG8gcHJvamVjdCByb290XG5jb25zdCBjdHJsX3BhdGggPSAnLi4vLi4vLi4vYXBpL2NvbnRyb2xsZXJzJztcblxuY29uc3QgQkFTRV9DVFJMU19QQVRIID0gcGF0aC5qb2luKF9fZGlybmFtZSwgY3RybF9wYXRoKTtcblxuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZXJSb3V0ZXJPcHRpb25zIHtcbiAgbG9nZ2VyPzogTG9nZ2VySW5zdGFuY2UsXG4gIGFwcD86IEFwcGxpY2F0aW9uLFxuICBwYXRoOiB7XG4gICAgY29udHJvbGxlcnM/OiBzdHJpbmc7XG4gICAgZmlsdGVycz86IHN0cmluZztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2ZXJSb3V0ZXIge1xuICBhcHA6IGFueTtcbiAgcm91dGVzOiBhbnk7XG4gIGxvZ2dlcjogTG9nZ2VySW5zdGFuY2U7XG4gIG9wdGlvbnM6IFNlcnZlclJvdXRlck9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3IoY29udHJvbGxlcnM6IGFueSwgcm91dGVzOiBhbnksIG9wdGlvbnM6IFNlcnZlclJvdXRlck9wdGlvbnMgPSB7IHBhdGg6IHt9IH0pIHtcbiAgICBpZiAoIWNvbnRyb2xsZXJzICYmICFyb3V0ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGluaXRpYWxpemUgdGhlIHJvdXRlciB3aXRob3V0IHJvdXRlcyBvciBjb250cm9sbGVycycpO1xuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5sb2dnZXIgPSBvcHRpb25zLmxvZ2dlcjtcbiAgICB0aGlzLm9wdGlvbnMucGF0aCA9IHRoaXMub3B0aW9ucy5wYXRoIHx8IHt9O1xuICAgIHRoaXMub3B0aW9ucy5wYXRoLmNvbnRyb2xsZXJzID0gdGhpcy5vcHRpb25zLnBhdGguY29udHJvbGxlcnMgfHwgQkFTRV9DVFJMU19QQVRIO1xuXG4gICAgcm91dGVzID0gcm91dGVzIHx8IHt9O1xuICAgIGNvbnRyb2xsZXJzID0gY29udHJvbGxlcnMgfHwge307XG4gICAgY29uc3QgZGVjb3JhdGVkUm91dGVzID0gdGhpcy5kZWNvcmF0ZWRSb3V0ZXMoY29udHJvbGxlcnMpO1xuXG4gICAgdGhpcy5yb3V0ZXMgPSB7XG4gICAgICBnZXQ6IHsgLi4uZGVjb3JhdGVkUm91dGVzLmdldCwgLi4ucm91dGVzLmdldCB9LFxuICAgICAgcG9zdDogeyAuLi5kZWNvcmF0ZWRSb3V0ZXMucG9zdCwgLi4ucm91dGVzLnBvc3QgfSxcbiAgICAgIHB1dDogeyAuLi5kZWNvcmF0ZWRSb3V0ZXMucHV0LCAuLi5yb3V0ZXMucHV0IH0sXG4gICAgICAnZGVsZXRlJzogeyAuLi5kZWNvcmF0ZWRSb3V0ZXMuZGVsZXRlLCAuLi5yb3V0ZXMuZGVsZXRlIH0sXG4gICAgfTtcblxuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBhcmUgdGhlIGNvbnRyb2xsZXIgbWV0aG9kcyB0byBiZWluZyBib3VuZC5cbiAgICogQHBhcmFtIG1ldGhvZFxuICAgKiBAcGFyYW0gY3RybFxuICAgKiBAcmV0dXJucyB7e319XG4gICAqL1xuICBwcmVwYXJlQ29udHJvbGxlck1ldGhvZHMobWV0aG9kLCBjdHJsKSB7XG4gICAgY29uc3QgZGVjb3JhdGVkUm91dGVzID0ge307XG5cbiAgICBPYmplY3Qua2V5cyhjdHJsLnJvdXRlc1ttZXRob2RdIHx8IHt9KS5tYXAocm91dGUgPT4ge1xuICAgICAgaWYgKGN0cmwuYmFzZUZpbHRlcnMpIHtcbiAgICAgICAgY3RybC5yb3V0ZXNbbWV0aG9kXVtyb3V0ZV0uZmlsdGVycyA9IGN0cmwuYmFzZUZpbHRlcnMuY29uY2F0KGN0cmwucm91dGVzW21ldGhvZF1bcm91dGVdLmZpbHRlcnMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY3RybC5iYXNlUm91dGUpIHtcbiAgICAgICAgY29uc3QgZnVsbFJvdXRlID0gcGF0aC5qb2luKGN0cmwuYmFzZVJvdXRlLCByb3V0ZSk7XG4gICAgICAgIGRlY29yYXRlZFJvdXRlc1tmdWxsUm91dGVdID0gY3RybC5yb3V0ZXNbbWV0aG9kXVtyb3V0ZV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWNvcmF0ZWRSb3V0ZXNbcm91dGVdID0gY3RybC5yb3V0ZXNbbWV0aG9kXVtyb3V0ZV07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZGVjb3JhdGVkUm91dGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBhcmUgdGhlIGRlY29yYXRlZCByb3V0ZXMgZm9yIGJlaW5nIG1lcmdlZCBpbnRvIHRoZSByb3V0ZXMgbWFwLlxuICAgKlxuICAgKiBAcGFyYW0gY29udHJvbGxlcnMgVGhlIGNvbnRyb2xsZXJzIG1hcFxuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgKi9cbiAgZGVjb3JhdGVkUm91dGVzKGNvbnRyb2xsZXJzKSB7XG4gICAgbGV0IGRlY29yYXRlZFJvdXRlcyA9IHsgZ2V0OiB7fSwgcG9zdDoge30sIHB1dDoge30sICdkZWxldGUnOiB7fSB9O1xuXG4gICAgLy8gUHJlcGFyZSBBUEkgcm91dGVzIGFuZCBpdHMgY29udHJvbGxlcnMgZnJvbSBkZWNvcmF0b3JzXG4gICAgT2JqZWN0LmtleXMoY29udHJvbGxlcnMgfHwge30pLm1hcChuYW1lID0+ICh7XG4gICAgICBuYW1lLFxuICAgICAgYmFzZVJvdXRlOiBjb250cm9sbGVyc1tuYW1lXS5iYXNlUm91dGUsXG4gICAgICBiYXNlRmlsdGVyczogY29udHJvbGxlcnNbbmFtZV0uYmFzZUZpbHRlcnMsXG4gICAgICByb3V0ZXM6IGNvbnRyb2xsZXJzW25hbWVdLnJvdXRlcygpLFxuICAgIH0pKS5tYXAoY3RybCA9PiB7XG4gICAgICBkZWNvcmF0ZWRSb3V0ZXMuZ2V0ID0ge1xuICAgICAgICAuLi5kZWNvcmF0ZWRSb3V0ZXMuZ2V0LFxuICAgICAgICAuLi50aGlzLnByZXBhcmVDb250cm9sbGVyTWV0aG9kcygnZ2V0JywgY3RybCksXG4gICAgICB9O1xuICAgICAgZGVjb3JhdGVkUm91dGVzLnBvc3QgPSB7XG4gICAgICAgIC4uLmRlY29yYXRlZFJvdXRlcy5wb3N0LFxuICAgICAgICAuLi50aGlzLnByZXBhcmVDb250cm9sbGVyTWV0aG9kcygncG9zdCcsIGN0cmwpLFxuICAgICAgfTtcbiAgICAgIGRlY29yYXRlZFJvdXRlcy5wdXQgPSB7XG4gICAgICAgIC4uLmRlY29yYXRlZFJvdXRlcy5wdXQsXG4gICAgICAgIC4uLnRoaXMucHJlcGFyZUNvbnRyb2xsZXJNZXRob2RzKCdwdXQnLCBjdHJsKSxcbiAgICAgIH07XG4gICAgICBkZWNvcmF0ZWRSb3V0ZXMuZGVsZXRlID0ge1xuICAgICAgICAuLi5kZWNvcmF0ZWRSb3V0ZXMuZGVsZXRlLFxuICAgICAgICAuLi50aGlzLnByZXBhcmVDb250cm9sbGVyTWV0aG9kcygnZGVsZXRlJywgY3RybCksXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRlY29yYXRlZFJvdXRlcztcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5yb3V0ZXM7XG4gICAgT2JqZWN0LmtleXMobWFwKS5tYXAoKG1ldGhvZCkgPT4gdGhpcy5iaW5kTWV0aG9kKG1ldGhvZCwgbWFwW21ldGhvZF0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhbGwgcm91dGVzIHJlZ2lzdGVyZWQgaW4gdGhlIG1ldGhvZCBzdXBwbGllZFxuICAgKlxuICAgKiBAcGFyYW0gbWV0aG9kIFRoZSBodHRwIG1ldGhvZCB0byBiaW5kXG4gICAqIEBwYXJhbSByb3V0ZXMgVGhlIHJvdXRlcyBtYXBcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBiaW5kTWV0aG9kKG1ldGhvZCwgcm91dGVzKSB7XG4gICAgZm9yIChjb25zdCByIGluIHJvdXRlcykge1xuICAgICAgaWYgKHJvdXRlcy5oYXNPd25Qcm9wZXJ0eShyKSAmJiByb3V0ZXNbcl0uY29udHJvbGxlcikge1xuICAgICAgICAvLyBFbnN1cmUgbG9nZ2VyIGlzIGF2YWlsYWJsZVxuICAgICAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgICAgICB0aGlzLmxvZ2dlci5zaWxseShgUmVnaXN0ZXJpbmcgc2VydmVyIHJvdXRlOiAke21ldGhvZC50b1VwcGVyQ2FzZSgpfSAke3J9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgY29udHJvbGxlciBmcm9tIG1hcFxuICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNVbnJlc29sdmVkVmFyaWFibGVcbiAgICAgICAgbGV0IGN0cmwgPSB0aGlzLnJlZ2lzdGVyQ29udHJvbGxlcihyb3V0ZXMsIHIpO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgZmlsdGVycyB3cmFwcGVyIGluc3RhbmNlIHRvIHRoZSByb3V0ZXMgbWFwXG4gICAgICAgIGlmIChyb3V0ZXNbcl0uZmlsdGVycyAmJiByb3V0ZXNbcl0uZmlsdGVycy5sZW5ndGgpIHtcblxuICAgICAgICAgIC8vIFZhbGlkYXRlIGFsbCBmaWx0ZXJzXG4gICAgICAgICAgaWYgKHJvdXRlc1tyXS5maWx0ZXJzLmZpbHRlcihmID0+ICFmKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyb3V0ZXNbcl0uZmlsdGVycyk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZmlsdGVycyBmb3Igcm91dGU6ICcgKyBtZXRob2QudG9VcHBlckNhc2UoKSArICcgJyArIHIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFJlZ2lzdGVyIHJvdXRlIHdpdGggZmlsdGVycyBpbiBjdXJyZW50IG1hcCBmb3IgYmlkaW5nIHRvIGV4cHJlc3NcbiAgICAgICAgICB0aGlzLnJvdXRlc1ttZXRob2RdW3JdID0gRmlsdGVyc1dyYXBwZXJcbiAgICAgICAgICAgIC5hcHBseShyb3V0ZXNbcl0uZmlsdGVycywgdGhpcy5vcHRpb25zLnBhdGguZmlsdGVycylcbiAgICAgICAgICAgIC5jb25jYXQoW2N0cmxdKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFJlZ2lzdGVyIHJvdXRlIGluIGN1cnJlbnQgbWFwIGZvciBiaWRpbmcgdG8gZXhwcmVzc1xuICAgICAgICAgIHRoaXMucm91dGVzW21ldGhvZF1bcl0gPSBjdHJsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIHRoZSBjb250cm9sbGVyIGRlZmluZWQgYnkgdGhlIHJvdXRlIHN1cHBsaWVkLlxuICAgKlxuICAgKiBAcGFyYW0gcm91dGVzIFRoZSByb3V0ZXMgbWFwXG4gICAqIEBwYXJhbSByIFRoZSByb3V0ZSB0byByZWdpc3RlclxuICAgKlxuICAgKiBAcmV0dXJucyB7YW55fVxuICAgKi9cbiAgcmVnaXN0ZXJDb250cm9sbGVyKHJvdXRlcywgcikge1xuICAgIGxldCBjdHJsID0gcm91dGVzW3JdLmNvbnRyb2xsZXI7XG5cbiAgICAvLyBDaGVjayBjb250cm9sbGVyIHR5cGVcbiAgICBpZiAoY3RybCAmJiB1dGlsLmlzU3RyaW5nKGN0cmwpKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGNvbnRyb2xsZXIgZnJvbSBwYXRoXG4gICAgICAgIGN0cmwgPSByZXF1aXJlKHBhdGguam9pbih0aGlzLm9wdGlvbnMucGF0aC5jb250cm9sbGVycywgY3RybCkpO1xuICAgICAgICAvLyBGaXggZm9yIG1vdGggbW9kdWxlcyBzeXN0ZW1zIChpbXBvcnQgLyByZXF1aXJlKVxuICAgICAgICBjdHJsID0gY3RybC5kZWZhdWx0IHx8IGN0cmw7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGUuc3RhY2sgPSBjbGVhblN0YWNrKGUuc3RhY2spO1xuXG4gICAgICAgIGlmIChlLm1lc3NhZ2UubWF0Y2gobmV3IFJlZ0V4cChjdHJsKSkpIHtcbiAgICAgICAgICAvLyBUaHJvdyBhIGRpcmVjdCBtZXNzYWdlIHdoZW4gY29udHJvbGxlciB3YXMgbm90IGZvdW5kXG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoYENvbnRyb2xsZXIgbm90IGZvdW5kOiAke3BhdGguam9pbihjdHJsX3BhdGgsIGN0cmwpfWApO1xuICAgICAgICAgIGVycm9yLnN0YWNrID0gZS5zdGFjaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBVbmtub3duIGVycm9yXG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIWN0cmwgfHwgIXV0aWwuaXNGdW5jdGlvbihjdHJsKSkge1xuICAgICAgLy8gVGhyb3cgaW52YWxpZCBjb250cm9sbGVyIGVycm9yXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbnRyb2xsZXIgaXMgbm90IHZhbGlkIGZvciByb3V0ZTogJHtyfWApO1xuICAgIH1cbiAgICByZXR1cm4gY3RybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyB0aGUgY29udHJvbGxlciB0byB0aGUgZXhwcmVzcyBhcHBsaWNhdGlvbiBvciBjcmVhdGVzIGEgbmV3IG9uZS5cbiAgICpcbiAgICogQHBhcmFtIHtleHByZXNzLkFwcGxpY2F0aW9ufSBbYXBwXSBUaGUgZXhwcmVzcyBhcHBsaWNhdGlvblxuICAgKlxuICAgKiBAcmV0dXJucyB7ZXhwcmVzcy5BcHBsaWNhdGlvbn1cbiAgICovXG4gIHJlZ2lzdGVyKGFwcD86IEFwcGxpY2F0aW9uKSB7XG4gICAgdGhpcy5hcHAgPSBhcHAgfHwgZXhwcmVzcygpO1xuICAgIGZvciAoY29uc3QgbWV0aG9kIGluIHRoaXMucm91dGVzKSB7XG4gICAgICBpZiAodGhpcy5yb3V0ZXMuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHIgaW4gdGhpcy5yb3V0ZXNbbWV0aG9kXSkge1xuICAgICAgICAgIGlmIChyICYmIHRoaXMucm91dGVzW21ldGhvZF0uaGFzT3duUHJvcGVydHkocikpIHtcbiAgICAgICAgICAgIHRoaXMuYXBwW21ldGhvZF0ociwgYXN5bmNNaWRkbGV3YXJlKHRoaXMucm91dGVzW21ldGhvZF1bcl0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmV0dXJuIHRoZSBhcHAgaW5zdGFuY2VcbiAgICByZXR1cm4gdGhpcy5hcHA7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgYSByb3V0ZXIgdXNpbmcgdGhlIHN1cHBsaWVkIHJvdXRlcyBtYXAgYW5kIG9wdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0IHwgc3RyaW5nfSBjb250cm9sbGVycyBUaGUgbWFwIG9mIGNvbnRyb2xsZXIgY2xhc3NlcyB0byBiaW5kIHRvXG4gICAqIEBwYXJhbSB7T2JqZWN0IHwgc3RyaW5nfSByb3V0ZXMgVGhlIG1hcCBvZiByb3V0ZSBmaWxlcyBvdCBiaW5kIHRvXG4gICAqXG4gICAqIEBwYXJhbSB7U2VydmVyUm91dGVyT3B0aW9uc30gb3B0aW9uc1xuICAgKi9cbiAgc3RhdGljIGJ1aWxkKGNvbnRyb2xsZXJzOiBvYmplY3QgfCBzdHJpbmcsIHJvdXRlczogb2JqZWN0IHwgc3RyaW5nLCBvcHRpb25zPzogU2VydmVyUm91dGVyT3B0aW9ucykge1xuICAgIGxldCB3cmFwcGVyO1xuXG4gICAgaWYgKHJvdXRlcyAmJiB1dGlsLmlzU3RyaW5nKHJvdXRlcykpIHtcbiAgICAgIHdyYXBwZXIgPSBuZXcgU2VydmVyUm91dGVyKGNvbnRyb2xsZXJzLCByZXF1aXJlKHJvdXRlcyksIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3cmFwcGVyID0gbmV3IFNlcnZlclJvdXRlcihjb250cm9sbGVycywgcm91dGVzLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd3JhcHBlci5yZWdpc3RlcihvcHRpb25zID8gb3B0aW9ucy5hcHAgOiB1bmRlZmluZWQpO1xuICB9XG59XG4iXX0=