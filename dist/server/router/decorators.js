"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Simple factory for generating the routes decorators */
const routeDecoratorFactory = (method) => {
    return (route, filters = []) => {
        return function getRouteDecorator(target, key, descriptor) {
            target.routes = target.routes || {};
            target.routes[method] = target.routes[method] || {};
            target.routes[method][route] = {
                controller: target[key],
                filters: filters,
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
exports.Controller = (route, filters = []) => {
    return function controllerDecorator(constructor) {
        return _a = class extends constructor {
                static routes() {
                    return constructor.routes || {};
                }
            },
            _a.baseRoute = route,
            _a.baseFilters = filters,
            _a;
        var _a;
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
exports.Get = routeDecoratorFactory('get');
/**
 * The @Post route decorator.
 *
 * @type {Function}
 *
 * @param {string} route The route to be assigned to the decorated method.
 * @param {Function[]} filters The filters to be called before the decorated method.
 */
exports.Post = routeDecoratorFactory('post');
/**
 * The @Put route decorator.
 *
 * @type {Function}
 *
 * @param {string} route The route to be assigned to the decorated method.
 * @param {Function[]} filters The filters to be called before the decorated method.
 */
exports.Put = routeDecoratorFactory('put');
/**
 * The @Delete route decorator.
 *
 * @type {Function}
 *
 * @param {string} route The route to be assigned to the decorated method.
 * @param {Function[]} filters The filters to be called before the decorated method.
 */
exports.Delete = routeDecoratorFactory('delete');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zZXJ2ZXIvcm91dGVyL2RlY29yYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSx5REFBeUQ7QUFDekQsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLE1BQU0sRUFBWSxFQUFFO0lBQ2pELE1BQU0sQ0FBQyxDQUFDLEtBQWEsRUFBRSxVQUFzQixFQUFFLEVBQUUsRUFBRTtRQUNqRCxNQUFNLENBQUMsMkJBQTJCLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVTtZQUN2RCxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRztnQkFDN0IsVUFBVSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUM7Z0JBQ3ZCLE9BQU8sRUFBRSxPQUFPO2FBQ2pCLENBQUM7WUFDRixNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3BCLENBQUMsQ0FBQTtJQUNILENBQUMsQ0FBQTtBQUNILENBQUMsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ1UsUUFBQSxVQUFVLEdBQUcsQ0FBQyxLQUFjLEVBQUUsVUFBc0IsRUFBRSxFQUFFLEVBQUU7SUFDckUsTUFBTSxDQUFDLDZCQUF1RCxXQUFjO1FBQzFFLE1BQU0sTUFBQyxLQUFNLFNBQVEsV0FBVztnQkFJOUIsTUFBTSxDQUFDLE1BQU07b0JBQ1gsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO2dCQUNsQyxDQUFDO2FBQ0Y7WUFOUSxZQUFTLEdBQUcsS0FBTTtZQUNsQixjQUFXLEdBQUcsT0FBUTtlQUs5Qjs7SUFDSCxDQUFDLENBQUE7QUFDSCxDQUFDLENBQUM7QUFFRjs7Ozs7OztHQU9HO0FBQ1UsUUFBQSxHQUFHLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFaEQ7Ozs7Ozs7R0FPRztBQUNVLFFBQUEsSUFBSSxHQUFHLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRWxEOzs7Ozs7O0dBT0c7QUFDVSxRQUFBLEdBQUcsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUVoRDs7Ozs7OztHQU9HO0FBQ1UsUUFBQSxNQUFNLEdBQUcscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCYXNlQ29udHJvbGxlciB9IGZyb20gXCIuL2NvbnRyb2xsZXJcIjtcblxuLyogU2ltcGxlIGZhY3RvcnkgZm9yIGdlbmVyYXRpbmcgdGhlIHJvdXRlcyBkZWNvcmF0b3JzICovXG5jb25zdCByb3V0ZURlY29yYXRvckZhY3RvcnkgPSAobWV0aG9kKTogRnVuY3Rpb24gPT4ge1xuICByZXR1cm4gKHJvdXRlOiBzdHJpbmcsIGZpbHRlcnM6IEZ1bmN0aW9uW10gPSBbXSkgPT4ge1xuICAgIHJldHVybiBmdW5jdGlvbiBnZXRSb3V0ZURlY29yYXRvcih0YXJnZXQsIGtleSwgZGVzY3JpcHRvcikge1xuICAgICAgdGFyZ2V0LnJvdXRlcyA9IHRhcmdldC5yb3V0ZXMgfHwge307XG4gICAgICB0YXJnZXQucm91dGVzW21ldGhvZF0gPSB0YXJnZXQucm91dGVzW21ldGhvZF0gfHwge307XG4gICAgICB0YXJnZXQucm91dGVzW21ldGhvZF1bcm91dGVdID0ge1xuICAgICAgICBjb250cm9sbGVyOiB0YXJnZXRba2V5XSxcbiAgICAgICAgZmlsdGVyczogZmlsdGVycyxcbiAgICAgIH07XG4gICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogVGhlIEBDb250cm9sbGVyIGRlY29yYXRvci5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcm91dGUgVGhlIHJvdXRlIHRvIGJlIGFzc2lnbmVkIHRvIGFsbCBtZXRob2RzIG9mIGRlY29yYXRlZCBjbGFzcy5cbiAqIEBwYXJhbSB7RnVuY3Rpb25bXX0gZmlsdGVycyBUaGUgZmlsdGVycyB0byBiZSBjYWxsZWQgYmVmb3JlIGFsbCBtZXRob2RzIG9mIGRlY29yYXRlZCBjbGFzcy5cbiAqL1xuZXhwb3J0IGNvbnN0IENvbnRyb2xsZXIgPSAocm91dGU/OiBzdHJpbmcsIGZpbHRlcnM6IEZ1bmN0aW9uW10gPSBbXSkgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24gY29udHJvbGxlckRlY29yYXRvcjxUIGV4dGVuZHMgQmFzZUNvbnRyb2xsZXI+KGNvbnN0cnVjdG9yOiBUKSB7XG4gICAgcmV0dXJuIGNsYXNzIGV4dGVuZHMgY29uc3RydWN0b3Ige1xuICAgICAgc3RhdGljIGJhc2VSb3V0ZSA9IHJvdXRlO1xuICAgICAgc3RhdGljIGJhc2VGaWx0ZXJzID0gZmlsdGVycztcblxuICAgICAgc3RhdGljIHJvdXRlcygpIHtcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJvdXRlcyB8fCB7fTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogVGhlIEBHZXQgcm91dGUgZGVjb3JhdG9yLlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcm91dGUgVGhlIHJvdXRlIHRvIGJlIGFzc2lnbmVkIHRvIHRoZSBkZWNvcmF0ZWQgbWV0aG9kLlxuICogQHBhcmFtIHtGdW5jdGlvbltdfSBmaWx0ZXJzIFRoZSBmaWx0ZXJzIHRvIGJlIGNhbGxlZCBiZWZvcmUgdGhlIGRlY29yYXRlZCBtZXRob2QuXG4gKi9cbmV4cG9ydCBjb25zdCBHZXQgPSByb3V0ZURlY29yYXRvckZhY3RvcnkoJ2dldCcpO1xuXG4vKipcbiAqIFRoZSBAUG9zdCByb3V0ZSBkZWNvcmF0b3IuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByb3V0ZSBUaGUgcm91dGUgdG8gYmUgYXNzaWduZWQgdG8gdGhlIGRlY29yYXRlZCBtZXRob2QuXG4gKiBAcGFyYW0ge0Z1bmN0aW9uW119IGZpbHRlcnMgVGhlIGZpbHRlcnMgdG8gYmUgY2FsbGVkIGJlZm9yZSB0aGUgZGVjb3JhdGVkIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGNvbnN0IFBvc3QgPSByb3V0ZURlY29yYXRvckZhY3RvcnkoJ3Bvc3QnKTtcblxuLyoqXG4gKiBUaGUgQFB1dCByb3V0ZSBkZWNvcmF0b3IuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByb3V0ZSBUaGUgcm91dGUgdG8gYmUgYXNzaWduZWQgdG8gdGhlIGRlY29yYXRlZCBtZXRob2QuXG4gKiBAcGFyYW0ge0Z1bmN0aW9uW119IGZpbHRlcnMgVGhlIGZpbHRlcnMgdG8gYmUgY2FsbGVkIGJlZm9yZSB0aGUgZGVjb3JhdGVkIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGNvbnN0IFB1dCA9IHJvdXRlRGVjb3JhdG9yRmFjdG9yeSgncHV0Jyk7XG5cbi8qKlxuICogVGhlIEBEZWxldGUgcm91dGUgZGVjb3JhdG9yLlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcm91dGUgVGhlIHJvdXRlIHRvIGJlIGFzc2lnbmVkIHRvIHRoZSBkZWNvcmF0ZWQgbWV0aG9kLlxuICogQHBhcmFtIHtGdW5jdGlvbltdfSBmaWx0ZXJzIFRoZSBmaWx0ZXJzIHRvIGJlIGNhbGxlZCBiZWZvcmUgdGhlIGRlY29yYXRlZCBtZXRob2QuXG4gKi9cbmV4cG9ydCBjb25zdCBEZWxldGUgPSByb3V0ZURlY29yYXRvckZhY3RvcnkoJ2RlbGV0ZScpO1xuIl19