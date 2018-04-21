import { BaseController } from './controller';

/* Simple factory for generating the routes decorators */
const routeDecoratorFactory = (method): Function => {
  return (route: string, filters: Function[] = []) => {
    return function getRouteDecorator(target, key, descriptor) {
      target.routes = target.routes || {};
      target.routes[method] = target.routes[method] || {};
      target.routes[method][route] = {
        filters,
        controller: target[key],
      };
      return descriptor;
    };
  };
};

/**
 * The @Controller decorator.
 *
 * @param {string} route The route to be assigned to all methods of decorated class.
 * @param {Function[]} filters The filters to be called before all methods of decorated class.
 */
export const Controller = (route?: string, filters: Function[] = []) => {
  return function controllerDecorator<T extends BaseController>(constructor: T) {
    return class extends constructor {
      static baseRoute = route;
      static baseFilters = filters;

      static routes() {
        return constructor.routes || {};
      }
    };
  };
};

/**
 * The @Get route decorator.
 *
 * @type {Function}
 *
 * @param {string} route The route to be assigned to the decorated method.
 * @param {Function[]} filters The filters to be called before the decorated method.
 */
export const Get = routeDecoratorFactory('get');

/**
 * The @Post route decorator.
 *
 * @type {Function}
 *
 * @param {string} route The route to be assigned to the decorated method.
 * @param {Function[]} filters The filters to be called before the decorated method.
 */
export const Post = routeDecoratorFactory('post');

/**
 * The @Put route decorator.
 *
 * @type {Function}
 *
 * @param {string} route The route to be assigned to the decorated method.
 * @param {Function[]} filters The filters to be called before the decorated method.
 */
export const Put = routeDecoratorFactory('put');

/**
 * The @Delete route decorator.
 *
 * @type {Function}
 *
 * @param {string} route The route to be assigned to the decorated method.
 * @param {Function[]} filters The filters to be called before the decorated method.
 */
export const Delete = routeDecoratorFactory('delete');
