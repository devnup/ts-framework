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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3NlcnZlci9yb3V0ZXIvcm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3QixtQ0FBbUM7QUFFbkMsMENBQTBDO0FBQzFDLGdEQUFtRDtBQUNuRCw4Q0FBK0M7QUFHL0MsMkNBQTJDO0FBQzNDLHNEQUFzRDtBQUN0RCxNQUFNLFNBQVMsR0FBRywwQkFBMEIsQ0FBQztBQUU3QyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztBQVd4RDtJQU1FLFlBQVksV0FBZ0IsRUFBRSxNQUFXLEVBQUUsVUFBK0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO1FBQ3BGLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLCtEQUErRCxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxlQUFlLENBQUM7UUFFakYsTUFBTSxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDdEIsV0FBVyxHQUFHLFdBQVcsSUFBSSxFQUFFLENBQUM7UUFDaEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUUxRCxJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1osR0FBRyxvQkFBTyxlQUFlLENBQUMsR0FBRyxFQUFLLE1BQU0sQ0FBQyxHQUFHLENBQUU7WUFDOUMsSUFBSSxvQkFBTyxlQUFlLENBQUMsSUFBSSxFQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUU7WUFDakQsR0FBRyxvQkFBTyxlQUFlLENBQUMsR0FBRyxFQUFLLE1BQU0sQ0FBQyxHQUFHLENBQUU7WUFDOUMsUUFBUSxvQkFBTyxlQUFlLENBQUMsTUFBTSxFQUFLLE1BQU0sQ0FBQyxNQUFNLENBQUU7U0FDMUQsQ0FBQztRQUVGLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILHdCQUF3QixDQUFDLE1BQU0sRUFBRSxJQUFJO1FBQ25DLE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUUzQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25HLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNuRCxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEQsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLGVBQWUsQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsZUFBZSxDQUFDLFdBQVc7UUFDekIsSUFBSSxlQUFlLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFFbkUseURBQXlEO1FBQ3pELE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUMsSUFBSTtZQUNKLFNBQVMsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUztZQUN0QyxXQUFXLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVc7WUFDMUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUU7U0FDbkMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2IsZUFBZSxDQUFDLEdBQUcscUJBQ2QsZUFBZSxDQUFDLEdBQUcsRUFDbkIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FDOUMsQ0FBQztZQUNGLGVBQWUsQ0FBQyxJQUFJLHFCQUNmLGVBQWUsQ0FBQyxJQUFJLEVBQ3BCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQy9DLENBQUM7WUFDRixlQUFlLENBQUMsR0FBRyxxQkFDZCxlQUFlLENBQUMsR0FBRyxFQUNuQixJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUM5QyxDQUFDO1lBQ0YsZUFBZSxDQUFDLE1BQU0scUJBQ2pCLGVBQWUsQ0FBQyxNQUFNLEVBQ3RCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQ2pELENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxlQUFlLENBQUM7SUFDekIsQ0FBQztJQUVELElBQUk7UUFDRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsVUFBVSxDQUFDLE1BQU0sRUFBRSxNQUFNO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDdkIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDckQsNkJBQTZCO2dCQUM3QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5RSxDQUFDO2dCQUVELDBCQUEwQjtnQkFDMUIsb0NBQW9DO2dCQUNwQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUU5QyxxREFBcUQ7Z0JBQ3JELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUVsRCx1QkFBdUI7b0JBQ3ZCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDbEYsQ0FBQztvQkFFRCxtRUFBbUU7b0JBQ25FLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsZ0JBQWM7eUJBQ3BDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzt5QkFDbkQsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFcEIsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixzREFBc0Q7b0JBQ3RELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO2dCQUNoQyxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMxQixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1FBRWhDLHdCQUF3QjtRQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDO2dCQUNILDRCQUE0QjtnQkFDNUIsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLENBQUMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFOUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RDLHVEQUF1RDtvQkFDdkQsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMseUJBQXlCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDL0UsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUN4QixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLGdCQUFnQjtvQkFDaEIsTUFBTSxDQUFDLENBQUM7Z0JBQ1YsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0MsaUNBQWlDO1lBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsUUFBUSxDQUFDLEdBQWlCO1FBQ3hCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDL0QsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCwwQkFBMEI7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQTRCLEVBQUUsTUFBdUIsRUFBRSxPQUE2QjtRQUMvRixJQUFJLE9BQU8sQ0FBQztRQUVaLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxPQUFPLEdBQUcsSUFBSSxZQUFZLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixPQUFPLEdBQUcsSUFBSSxZQUFZLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM3RCxDQUFDO0NBQ0Y7QUF6TkQsK0JBeU5DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgKiBhcyBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgQXBwbGljYXRpb24gfSBmcm9tICdleHByZXNzJztcbmltcG9ydCAqIGFzIGNsZWFuU3RhY2sgZnJvbSAnY2xlYW4tc3RhY2snO1xuaW1wb3J0IGFzeW5jTWlkZGxld2FyZSBmcm9tICcuLi9taWRkbGV3YXJlcy9hc3luYyc7XG5pbXBvcnQgRmlsdGVyc1dyYXBwZXIgZnJvbSAnLi4vaGVscGVycy9maWx0ZXInO1xuaW1wb3J0IHsgTG9nZ2VySW5zdGFuY2UgfSBmcm9tIFwid2luc3RvblwiO1xuXG4vLyBUT0RPOiBJbmplY3QgdGhpcyBjb25zdGFudHMgZnJvbSBvdXRzaWRlXG4vLyBQcmVwYXJlIHN0YXRpYyBmdWxsIHBhdGhzLCByZWxhdGl2ZSB0byBwcm9qZWN0IHJvb3RcbmNvbnN0IGN0cmxfcGF0aCA9ICcuLi8uLi8uLi9hcGkvY29udHJvbGxlcnMnO1xuXG5jb25zdCBCQVNFX0NUUkxTX1BBVEggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBjdHJsX3BhdGgpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcnZlclJvdXRlck9wdGlvbnMge1xuICBsb2dnZXI/OiBMb2dnZXJJbnN0YW5jZSxcbiAgYXBwPzogQXBwbGljYXRpb24sXG4gIHBhdGg6IHtcbiAgICBjb250cm9sbGVycz86IHN0cmluZztcbiAgICBmaWx0ZXJzPzogc3RyaW5nO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcnZlclJvdXRlciB7XG4gIGFwcDogYW55O1xuICByb3V0ZXM6IGFueTtcbiAgbG9nZ2VyOiBMb2dnZXJJbnN0YW5jZTtcbiAgb3B0aW9uczogU2VydmVyUm91dGVyT3B0aW9ucztcblxuICBjb25zdHJ1Y3Rvcihjb250cm9sbGVyczogYW55LCByb3V0ZXM6IGFueSwgb3B0aW9uczogU2VydmVyUm91dGVyT3B0aW9ucyA9IHsgcGF0aDoge30gfSkge1xuICAgIGlmICghY29udHJvbGxlcnMgJiYgIXJvdXRlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgaW5pdGlhbGl6ZSB0aGUgcm91dGVyIHdpdGhvdXQgcm91dGVzIG9yIGNvbnRyb2xsZXJzJyk7XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmxvZ2dlciA9IG9wdGlvbnMubG9nZ2VyO1xuICAgIHRoaXMub3B0aW9ucy5wYXRoID0gdGhpcy5vcHRpb25zLnBhdGggfHwge307XG4gICAgdGhpcy5vcHRpb25zLnBhdGguY29udHJvbGxlcnMgPSB0aGlzLm9wdGlvbnMucGF0aC5jb250cm9sbGVycyB8fCBCQVNFX0NUUkxTX1BBVEg7XG5cbiAgICByb3V0ZXMgPSByb3V0ZXMgfHwge307XG4gICAgY29udHJvbGxlcnMgPSBjb250cm9sbGVycyB8fCB7fTtcbiAgICBjb25zdCBkZWNvcmF0ZWRSb3V0ZXMgPSB0aGlzLmRlY29yYXRlZFJvdXRlcyhjb250cm9sbGVycyk7XG5cbiAgICB0aGlzLnJvdXRlcyA9IHtcbiAgICAgIGdldDogeyAuLi5kZWNvcmF0ZWRSb3V0ZXMuZ2V0LCAuLi5yb3V0ZXMuZ2V0IH0sXG4gICAgICBwb3N0OiB7IC4uLmRlY29yYXRlZFJvdXRlcy5wb3N0LCAuLi5yb3V0ZXMucG9zdCB9LFxuICAgICAgcHV0OiB7IC4uLmRlY29yYXRlZFJvdXRlcy5wdXQsIC4uLnJvdXRlcy5wdXQgfSxcbiAgICAgICdkZWxldGUnOiB7IC4uLmRlY29yYXRlZFJvdXRlcy5kZWxldGUsIC4uLnJvdXRlcy5kZWxldGUgfSxcbiAgICB9O1xuXG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICogUHJlcGFyZSB0aGUgY29udHJvbGxlciBtZXRob2RzIHRvIGJlaW5nIGJvdW5kLlxuICAgKiBAcGFyYW0gbWV0aG9kXG4gICAqIEBwYXJhbSBjdHJsXG4gICAqIEByZXR1cm5zIHt7fX1cbiAgICovXG4gIHByZXBhcmVDb250cm9sbGVyTWV0aG9kcyhtZXRob2QsIGN0cmwpIHtcbiAgICBjb25zdCBkZWNvcmF0ZWRSb3V0ZXMgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKGN0cmwucm91dGVzW21ldGhvZF0gfHwge30pLm1hcChyb3V0ZSA9PiB7XG4gICAgICBpZiAoY3RybC5iYXNlRmlsdGVycykge1xuICAgICAgICBjdHJsLnJvdXRlc1ttZXRob2RdW3JvdXRlXS5maWx0ZXJzID0gY3RybC5iYXNlRmlsdGVycy5jb25jYXQoY3RybC5yb3V0ZXNbbWV0aG9kXVtyb3V0ZV0uZmlsdGVycyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjdHJsLmJhc2VSb3V0ZSkge1xuICAgICAgICBjb25zdCBmdWxsUm91dGUgPSBwYXRoLmpvaW4oY3RybC5iYXNlUm91dGUsIHJvdXRlKTtcbiAgICAgICAgZGVjb3JhdGVkUm91dGVzW2Z1bGxSb3V0ZV0gPSBjdHJsLnJvdXRlc1ttZXRob2RdW3JvdXRlXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlY29yYXRlZFJvdXRlc1tyb3V0ZV0gPSBjdHJsLnJvdXRlc1ttZXRob2RdW3JvdXRlXTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBkZWNvcmF0ZWRSb3V0ZXM7XG4gIH1cblxuICAvKipcbiAgICogUHJlcGFyZSB0aGUgZGVjb3JhdGVkIHJvdXRlcyBmb3IgYmVpbmcgbWVyZ2VkIGludG8gdGhlIHJvdXRlcyBtYXAuXG4gICAqXG4gICAqIEBwYXJhbSBjb250cm9sbGVycyBUaGUgY29udHJvbGxlcnMgbWFwXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAqL1xuICBkZWNvcmF0ZWRSb3V0ZXMoY29udHJvbGxlcnMpIHtcbiAgICBsZXQgZGVjb3JhdGVkUm91dGVzID0geyBnZXQ6IHt9LCBwb3N0OiB7fSwgcHV0OiB7fSwgJ2RlbGV0ZSc6IHt9IH07XG5cbiAgICAvLyBQcmVwYXJlIEFQSSByb3V0ZXMgYW5kIGl0cyBjb250cm9sbGVycyBmcm9tIGRlY29yYXRvcnNcbiAgICBPYmplY3Qua2V5cyhjb250cm9sbGVycyB8fCB7fSkubWFwKG5hbWUgPT4gKHtcbiAgICAgIG5hbWUsXG4gICAgICBiYXNlUm91dGU6IGNvbnRyb2xsZXJzW25hbWVdLmJhc2VSb3V0ZSxcbiAgICAgIGJhc2VGaWx0ZXJzOiBjb250cm9sbGVyc1tuYW1lXS5iYXNlRmlsdGVycyxcbiAgICAgIHJvdXRlczogY29udHJvbGxlcnNbbmFtZV0ucm91dGVzKCksXG4gICAgfSkpLm1hcChjdHJsID0+IHtcbiAgICAgIGRlY29yYXRlZFJvdXRlcy5nZXQgPSB7XG4gICAgICAgIC4uLmRlY29yYXRlZFJvdXRlcy5nZXQsXG4gICAgICAgIC4uLnRoaXMucHJlcGFyZUNvbnRyb2xsZXJNZXRob2RzKCdnZXQnLCBjdHJsKSxcbiAgICAgIH07XG4gICAgICBkZWNvcmF0ZWRSb3V0ZXMucG9zdCA9IHtcbiAgICAgICAgLi4uZGVjb3JhdGVkUm91dGVzLnBvc3QsXG4gICAgICAgIC4uLnRoaXMucHJlcGFyZUNvbnRyb2xsZXJNZXRob2RzKCdwb3N0JywgY3RybCksXG4gICAgICB9O1xuICAgICAgZGVjb3JhdGVkUm91dGVzLnB1dCA9IHtcbiAgICAgICAgLi4uZGVjb3JhdGVkUm91dGVzLnB1dCxcbiAgICAgICAgLi4udGhpcy5wcmVwYXJlQ29udHJvbGxlck1ldGhvZHMoJ3B1dCcsIGN0cmwpLFxuICAgICAgfTtcbiAgICAgIGRlY29yYXRlZFJvdXRlcy5kZWxldGUgPSB7XG4gICAgICAgIC4uLmRlY29yYXRlZFJvdXRlcy5kZWxldGUsXG4gICAgICAgIC4uLnRoaXMucHJlcGFyZUNvbnRyb2xsZXJNZXRob2RzKCdkZWxldGUnLCBjdHJsKSxcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZGVjb3JhdGVkUm91dGVzO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBjb25zdCBtYXAgPSB0aGlzLnJvdXRlcztcbiAgICBPYmplY3Qua2V5cyhtYXApLm1hcCgobWV0aG9kKSA9PiB0aGlzLmJpbmRNZXRob2QobWV0aG9kLCBtYXBbbWV0aG9kXSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGFsbCByb3V0ZXMgcmVnaXN0ZXJlZCBpbiB0aGUgbWV0aG9kIHN1cHBsaWVkXG4gICAqXG4gICAqIEBwYXJhbSBtZXRob2QgVGhlIGh0dHAgbWV0aG9kIHRvIGJpbmRcbiAgICogQHBhcmFtIHJvdXRlcyBUaGUgcm91dGVzIG1hcFxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGJpbmRNZXRob2QobWV0aG9kLCByb3V0ZXMpIHtcbiAgICBmb3IgKGNvbnN0IHIgaW4gcm91dGVzKSB7XG4gICAgICBpZiAocm91dGVzLmhhc093blByb3BlcnR5KHIpICYmIHJvdXRlc1tyXS5jb250cm9sbGVyKSB7XG4gICAgICAgIC8vIEVuc3VyZSBsb2dnZXIgaXMgYXZhaWxhYmxlXG4gICAgICAgIGlmICh0aGlzLmxvZ2dlcikge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLnNpbGx5KGBSZWdpc3RlcmluZyBzZXJ2ZXIgcm91dGU6ICR7bWV0aG9kLnRvVXBwZXJDYXNlKCl9ICR7cn1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCBjb250cm9sbGVyIGZyb20gbWFwXG4gICAgICAgIC8vIG5vaW5zcGVjdGlvbiBKU1VucmVzb2x2ZWRWYXJpYWJsZVxuICAgICAgICBsZXQgY3RybCA9IHRoaXMucmVnaXN0ZXJDb250cm9sbGVyKHJvdXRlcywgcik7XG5cbiAgICAgICAgLy8gQWRkIHRoZSBmaWx0ZXJzIHdyYXBwZXIgaW5zdGFuY2UgdG8gdGhlIHJvdXRlcyBtYXBcbiAgICAgICAgaWYgKHJvdXRlc1tyXS5maWx0ZXJzICYmIHJvdXRlc1tyXS5maWx0ZXJzLmxlbmd0aCkge1xuXG4gICAgICAgICAgLy8gVmFsaWRhdGUgYWxsIGZpbHRlcnNcbiAgICAgICAgICBpZiAocm91dGVzW3JdLmZpbHRlcnMuZmlsdGVyKGYgPT4gIWYpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJvdXRlc1tyXS5maWx0ZXJzKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBmaWx0ZXJzIGZvciByb3V0ZTogJyArIG1ldGhvZC50b1VwcGVyQ2FzZSgpICsgJyAnICsgcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmVnaXN0ZXIgcm91dGUgd2l0aCBmaWx0ZXJzIGluIGN1cnJlbnQgbWFwIGZvciBiaWRpbmcgdG8gZXhwcmVzc1xuICAgICAgICAgIHRoaXMucm91dGVzW21ldGhvZF1bcl0gPSBGaWx0ZXJzV3JhcHBlclxuICAgICAgICAgICAgLmFwcGx5KHJvdXRlc1tyXS5maWx0ZXJzLCB0aGlzLm9wdGlvbnMucGF0aC5maWx0ZXJzKVxuICAgICAgICAgICAgLmNvbmNhdChbY3RybF0pO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUmVnaXN0ZXIgcm91dGUgaW4gY3VycmVudCBtYXAgZm9yIGJpZGluZyB0byBleHByZXNzXG4gICAgICAgICAgdGhpcy5yb3V0ZXNbbWV0aG9kXVtyXSA9IGN0cmw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgdGhlIGNvbnRyb2xsZXIgZGVmaW5lZCBieSB0aGUgcm91dGUgc3VwcGxpZWQuXG4gICAqXG4gICAqIEBwYXJhbSByb3V0ZXMgVGhlIHJvdXRlcyBtYXBcbiAgICogQHBhcmFtIHIgVGhlIHJvdXRlIHRvIHJlZ2lzdGVyXG4gICAqXG4gICAqIEByZXR1cm5zIHthbnl9XG4gICAqL1xuICByZWdpc3RlckNvbnRyb2xsZXIocm91dGVzLCByKSB7XG4gICAgbGV0IGN0cmwgPSByb3V0ZXNbcl0uY29udHJvbGxlcjtcblxuICAgIC8vIENoZWNrIGNvbnRyb2xsZXIgdHlwZVxuICAgIGlmIChjdHJsICYmIHV0aWwuaXNTdHJpbmcoY3RybCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIExvYWQgY29udHJvbGxlciBmcm9tIHBhdGhcbiAgICAgICAgY3RybCA9IHJlcXVpcmUocGF0aC5qb2luKHRoaXMub3B0aW9ucy5wYXRoLmNvbnRyb2xsZXJzLCBjdHJsKSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGUuc3RhY2sgPSBjbGVhblN0YWNrKGUuc3RhY2spO1xuXG4gICAgICAgIGlmIChlLm1lc3NhZ2UubWF0Y2gobmV3IFJlZ0V4cChjdHJsKSkpIHtcbiAgICAgICAgICAvLyBUaHJvdyBhIGRpcmVjdCBtZXNzYWdlIHdoZW4gY29udHJvbGxlciB3YXMgbm90IGZvdW5kXG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoYENvbnRyb2xsZXIgbm90IGZvdW5kOiAke3BhdGguam9pbihjdHJsX3BhdGgsIGN0cmwpfWApO1xuICAgICAgICAgIGVycm9yLnN0YWNrID0gZS5zdGFjaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBVbmtub3duIGVycm9yXG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIWN0cmwgfHwgIXV0aWwuaXNGdW5jdGlvbihjdHJsKSkge1xuICAgICAgLy8gVGhyb3cgaW52YWxpZCBjb250cm9sbGVyIGVycm9yXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbnRyb2xsZXIgaXMgbm90IHZhbGlkIGZvciByb3V0ZTogJHtyfWApO1xuICAgIH1cbiAgICByZXR1cm4gY3RybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyB0aGUgY29udHJvbGxlciB0byB0aGUgZXhwcmVzcyBhcHBsaWNhdGlvbiBvciBjcmVhdGVzIGEgbmV3IG9uZS5cbiAgICpcbiAgICogQHBhcmFtIHtleHByZXNzLkFwcGxpY2F0aW9ufSBbYXBwXSBUaGUgZXhwcmVzcyBhcHBsaWNhdGlvblxuICAgKlxuICAgKiBAcmV0dXJucyB7ZXhwcmVzcy5BcHBsaWNhdGlvbn1cbiAgICovXG4gIHJlZ2lzdGVyKGFwcD86IEFwcGxpY2F0aW9uKSB7XG4gICAgdGhpcy5hcHAgPSBhcHAgfHwgZXhwcmVzcygpO1xuICAgIGZvciAoY29uc3QgbWV0aG9kIGluIHRoaXMucm91dGVzKSB7XG4gICAgICBpZiAodGhpcy5yb3V0ZXMuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHIgaW4gdGhpcy5yb3V0ZXNbbWV0aG9kXSkge1xuICAgICAgICAgIGlmIChyICYmIHRoaXMucm91dGVzW21ldGhvZF0uaGFzT3duUHJvcGVydHkocikpIHtcbiAgICAgICAgICAgIHRoaXMuYXBwW21ldGhvZF0ociwgYXN5bmNNaWRkbGV3YXJlKHRoaXMucm91dGVzW21ldGhvZF1bcl0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmV0dXJuIHRoZSBhcHAgaW5zdGFuY2VcbiAgICByZXR1cm4gdGhpcy5hcHA7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgYSByb3V0ZXIgdXNpbmcgdGhlIHN1cHBsaWVkIHJvdXRlcyBtYXAgYW5kIG9wdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0IHwgc3RyaW5nfSBjb250cm9sbGVycyBUaGUgbWFwIG9mIGNvbnRyb2xsZXIgY2xhc3NlcyB0byBiaW5kIHRvXG4gICAqIEBwYXJhbSB7T2JqZWN0IHwgc3RyaW5nfSByb3V0ZXMgVGhlIG1hcCBvZiByb3V0ZSBmaWxlcyBvdCBiaW5kIHRvXG4gICAqXG4gICAqIEBwYXJhbSB7U2VydmVyUm91dGVyT3B0aW9uc30gb3B0aW9uc1xuICAgKi9cbiAgc3RhdGljIGJ1aWxkKGNvbnRyb2xsZXJzOiBvYmplY3QgfCBzdHJpbmcsIHJvdXRlczogb2JqZWN0IHwgc3RyaW5nLCBvcHRpb25zPzogU2VydmVyUm91dGVyT3B0aW9ucykge1xuICAgIGxldCB3cmFwcGVyO1xuXG4gICAgaWYgKHJvdXRlcyAmJiB1dGlsLmlzU3RyaW5nKHJvdXRlcykpIHtcbiAgICAgIHdyYXBwZXIgPSBuZXcgU2VydmVyUm91dGVyKGNvbnRyb2xsZXJzLCByZXF1aXJlKHJvdXRlcyksIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3cmFwcGVyID0gbmV3IFNlcnZlclJvdXRlcihjb250cm9sbGVycywgcm91dGVzLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd3JhcHBlci5yZWdpc3RlcihvcHRpb25zID8gb3B0aW9ucy5hcHAgOiB1bmRlZmluZWQpO1xuICB9XG59XG4iXX0=