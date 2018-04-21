import * as path from 'path';
import * as util from 'util';
import * as express from 'express';
import * as cleanStack from 'clean-stack';
import asyncMiddleware from '../middlewares/async';
import FiltersWrapper from '../helpers/filter';
import { LoggerInstance } from 'winston';

// TODO: Inject this constants from outside
// Prepare static full paths, relative to project root
const ctrl_path = '../../../api/controllers';

const BASE_CTRLS_PATH = path.join(__dirname, ctrl_path);

export interface ServerRouterOptions {
  logger?: LoggerInstance;
  app?: express.Application;
  path: {
    controllers?: string;
    filters?: string;
  };
}

export default class ServerRouter {
  app: any;
  routes: any;
  logger: LoggerInstance;
  options: ServerRouterOptions;

  constructor(controllers: any, routes: any, options: ServerRouterOptions = { path: {} }) {

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
      get: { ...decoratedRoutes.get, ...r.get },
      post: { ...decoratedRoutes.post, ...r.post },
      put: { ...decoratedRoutes.put, ...r.put },
      delete: { ...decoratedRoutes.delete, ...r.delete },
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

    Object.keys(ctrl.routes[method] || {}).map((route: string) => {
      if (ctrl.baseFilters) {
        ctrl.routes[method][route].filters = ctrl.baseFilters.concat(ctrl.routes[method][route].filters);
      }

      if (ctrl.baseRoute) {
        const fullRoute = path.join(ctrl.baseRoute, route);
        decoratedRoutes[fullRoute] = ctrl.routes[method][route];
      } else {
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
    })).map((ctrl: any) => {
      decoratedRoutes.get = {
        ...decoratedRoutes.get,
        ...this.prepareControllerMethods('get', ctrl),
      };
      decoratedRoutes.post = {
        ...decoratedRoutes.post,
        ...this.prepareControllerMethods('post', ctrl),
      };
      decoratedRoutes.put = {
        ...decoratedRoutes.put,
        ...this.prepareControllerMethods('put', ctrl),
      };
      decoratedRoutes.delete = {
        ...decoratedRoutes.delete,
        ...this.prepareControllerMethods('delete', ctrl),
      };
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
          this.routes[method][r] = FiltersWrapper
            .apply(routes[r].filters, this.options.path.filters)
            .concat([ctrl]);

        } else {
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
      } catch (e) {
        e.stack = cleanStack(e.stack);

        if (e.message.match(new RegExp(ctrl))) {
          // Throw a direct message when controller was not found
          const error = new Error(`Controller not found: ${path.join(ctrl_path, ctrl)}`);
          error.stack = e.stack;
        } else {
          // Unknown error
          throw e;
        }
      }
    } else if (!ctrl || !util.isFunction(ctrl)) {
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
  register(app?: express.Application) {
    this.app = app || express();
    for (const method in this.routes) {
      if (this.routes.hasOwnProperty(method)) {
        for (const r in this.routes[method]) {
          if (r && this.routes[method].hasOwnProperty(r)) {
            this.app[method](r, asyncMiddleware(this.routes[method][r]));
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
  static build(controllers: object | string, routes: object | string, options?: ServerRouterOptions) {
    let wrapper;

    if (routes && util.isString(routes)) {
      wrapper = new ServerRouter(controllers, require(routes), options);
    } else {
      wrapper = new ServerRouter(controllers, routes, options);
    }

    return wrapper.register(options ? options.app : undefined);
  }
}
