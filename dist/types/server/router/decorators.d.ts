import { BaseController } from './controller';
/**
 * The @Controller decorator.
 *
 * @param {string} route The route to be assigned to all methods of decorated class.
 * @param {Function[]} filters The filters to be called before all methods of decorated class.
 */
export declare const Controller: (route?: string, filters?: Function[]) => <T extends BaseController>(constructor: T) => {
    new (...args: any[]): {};
    baseRoute: string;
    baseFilters: Function[];
    routes(): any;
} & T;
/**
 * The @Get route decorator.
 *
 * @type {Function}
 *
 * @param {string} route The route to be assigned to the decorated method.
 * @param {Function[]} filters The filters to be called before the decorated method.
 */
export declare const Get: Function;
/**
 * The @Post route decorator.
 *
 * @type {Function}
 *
 * @param {string} route The route to be assigned to the decorated method.
 * @param {Function[]} filters The filters to be called before the decorated method.
 */
export declare const Post: Function;
/**
 * The @Put route decorator.
 *
 * @type {Function}
 *
 * @param {string} route The route to be assigned to the decorated method.
 * @param {Function[]} filters The filters to be called before the decorated method.
 */
export declare const Put: Function;
/**
 * The @Delete route decorator.
 *
 * @type {Function}
 *
 * @param {string} route The route to be assigned to the decorated method.
 * @param {Function[]} filters The filters to be called before the decorated method.
 */
export declare const Delete: Function;
