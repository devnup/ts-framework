/// <reference types="winston" />
/// <reference types="express" />
import * as express from 'express';
import { LoggerInstance } from 'winston';
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
    constructor(controllers: any, routes: any, options?: ServerRouterOptions);
    /**
     * Prepare the controller methods to being bound.
     * @param method
     * @param ctrl
     * @returns {{}}
     */
    prepareControllerMethods(method: any, ctrl: any): {};
    /**
     * Prepare the decorated routes for being merged into the routes map.
     *
     * @param controllers The controllers map
     *
     * @returns {Object}
     */
    decoratedRoutes(controllers: any): {
        get: {};
        post: {};
        put: {};
        delete: {};
    };
    init(): void;
    /**
     * Binds all routes registered in the method supplied
     *
     * @param method The http method to bind
     * @param routes The routes map
     *
     * @returns {boolean}
     */
    bindMethod(method: any, routes: any): boolean;
    /**
     * Register the controller defined by the route supplied.
     *
     * @param routes The routes map
     * @param r The route to register
     *
     * @returns {any}
     */
    registerController(routes: any, r: any): any;
    /**
     * Binds the controller to the express application or creates a new one.
     *
     * @param {express.Application} [app] The express application
     *
     * @returns {express.Application}
     */
    register(app?: express.Application): any;
    /**
     * Build a router using the supplied routes map and options.
     *
     * @param {Object | string} controllers The map of controller classes to bind to
     * @param {Object | string} routes The map of route files ot bind to
     *
     * @param {ServerRouterOptions} options
     */
    static build(controllers: object | string, routes: object | string, options?: ServerRouterOptions): any;
}
