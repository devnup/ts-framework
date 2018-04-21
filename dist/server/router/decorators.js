"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Simple factory for generating the routes decorators */
const routeDecoratorFactory = (method) => {
    return (route, filters = []) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zZXJ2ZXIvcm91dGVyL2RlY29yYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSx5REFBeUQ7QUFDekQsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLE1BQU0sRUFBWSxFQUFFO0lBQ2pELE1BQU0sQ0FBQyxDQUFDLEtBQWEsRUFBRSxVQUFzQixFQUFFLEVBQUUsRUFBRTtRQUNqRCxNQUFNLENBQUMsMkJBQTJCLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVTtZQUN2RCxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRztnQkFDN0IsT0FBTztnQkFDUCxVQUFVLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQzthQUN4QixDQUFDO1lBQ0YsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNwQixDQUFDLENBQUM7SUFDSixDQUFDLENBQUM7QUFDSixDQUFDLENBQUM7QUFFRjs7Ozs7R0FLRztBQUNVLFFBQUEsVUFBVSxHQUFHLENBQUMsS0FBYyxFQUFFLFVBQXNCLEVBQUUsRUFBRSxFQUFFO0lBQ3JFLE1BQU0sQ0FBQyw2QkFBdUQsV0FBYztRQUMxRSxNQUFNLE1BQUMsS0FBTSxTQUFRLFdBQVc7Z0JBSTlCLE1BQU0sQ0FBQyxNQUFNO29CQUNYLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQzthQUNGO1lBTlEsWUFBUyxHQUFHLEtBQU07WUFDbEIsY0FBVyxHQUFHLE9BQVE7ZUFLN0I7O0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBRUY7Ozs7Ozs7R0FPRztBQUNVLFFBQUEsR0FBRyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRWhEOzs7Ozs7O0dBT0c7QUFDVSxRQUFBLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUVsRDs7Ozs7OztHQU9HO0FBQ1UsUUFBQSxHQUFHLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFaEQ7Ozs7Ozs7R0FPRztBQUNVLFFBQUEsTUFBTSxHQUFHLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmFzZUNvbnRyb2xsZXIgfSBmcm9tICcuL2NvbnRyb2xsZXInO1xuXG4vKiBTaW1wbGUgZmFjdG9yeSBmb3IgZ2VuZXJhdGluZyB0aGUgcm91dGVzIGRlY29yYXRvcnMgKi9cbmNvbnN0IHJvdXRlRGVjb3JhdG9yRmFjdG9yeSA9IChtZXRob2QpOiBGdW5jdGlvbiA9PiB7XG4gIHJldHVybiAocm91dGU6IHN0cmluZywgZmlsdGVyczogRnVuY3Rpb25bXSA9IFtdKSA9PiB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGdldFJvdXRlRGVjb3JhdG9yKHRhcmdldCwga2V5LCBkZXNjcmlwdG9yKSB7XG4gICAgICB0YXJnZXQucm91dGVzID0gdGFyZ2V0LnJvdXRlcyB8fCB7fTtcbiAgICAgIHRhcmdldC5yb3V0ZXNbbWV0aG9kXSA9IHRhcmdldC5yb3V0ZXNbbWV0aG9kXSB8fCB7fTtcbiAgICAgIHRhcmdldC5yb3V0ZXNbbWV0aG9kXVtyb3V0ZV0gPSB7XG4gICAgICAgIGZpbHRlcnMsXG4gICAgICAgIGNvbnRyb2xsZXI6IHRhcmdldFtrZXldLFxuICAgICAgfTtcbiAgICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICAgIH07XG4gIH07XG59O1xuXG4vKipcbiAqIFRoZSBAQ29udHJvbGxlciBkZWNvcmF0b3IuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJvdXRlIFRoZSByb3V0ZSB0byBiZSBhc3NpZ25lZCB0byBhbGwgbWV0aG9kcyBvZiBkZWNvcmF0ZWQgY2xhc3MuXG4gKiBAcGFyYW0ge0Z1bmN0aW9uW119IGZpbHRlcnMgVGhlIGZpbHRlcnMgdG8gYmUgY2FsbGVkIGJlZm9yZSBhbGwgbWV0aG9kcyBvZiBkZWNvcmF0ZWQgY2xhc3MuXG4gKi9cbmV4cG9ydCBjb25zdCBDb250cm9sbGVyID0gKHJvdXRlPzogc3RyaW5nLCBmaWx0ZXJzOiBGdW5jdGlvbltdID0gW10pID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbnRyb2xsZXJEZWNvcmF0b3I8VCBleHRlbmRzIEJhc2VDb250cm9sbGVyPihjb25zdHJ1Y3RvcjogVCkge1xuICAgIHJldHVybiBjbGFzcyBleHRlbmRzIGNvbnN0cnVjdG9yIHtcbiAgICAgIHN0YXRpYyBiYXNlUm91dGUgPSByb3V0ZTtcbiAgICAgIHN0YXRpYyBiYXNlRmlsdGVycyA9IGZpbHRlcnM7XG5cbiAgICAgIHN0YXRpYyByb3V0ZXMoKSB7XG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yb3V0ZXMgfHwge307XG4gICAgICB9XG4gICAgfTtcbiAgfTtcbn07XG5cbi8qKlxuICogVGhlIEBHZXQgcm91dGUgZGVjb3JhdG9yLlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcm91dGUgVGhlIHJvdXRlIHRvIGJlIGFzc2lnbmVkIHRvIHRoZSBkZWNvcmF0ZWQgbWV0aG9kLlxuICogQHBhcmFtIHtGdW5jdGlvbltdfSBmaWx0ZXJzIFRoZSBmaWx0ZXJzIHRvIGJlIGNhbGxlZCBiZWZvcmUgdGhlIGRlY29yYXRlZCBtZXRob2QuXG4gKi9cbmV4cG9ydCBjb25zdCBHZXQgPSByb3V0ZURlY29yYXRvckZhY3RvcnkoJ2dldCcpO1xuXG4vKipcbiAqIFRoZSBAUG9zdCByb3V0ZSBkZWNvcmF0b3IuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByb3V0ZSBUaGUgcm91dGUgdG8gYmUgYXNzaWduZWQgdG8gdGhlIGRlY29yYXRlZCBtZXRob2QuXG4gKiBAcGFyYW0ge0Z1bmN0aW9uW119IGZpbHRlcnMgVGhlIGZpbHRlcnMgdG8gYmUgY2FsbGVkIGJlZm9yZSB0aGUgZGVjb3JhdGVkIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGNvbnN0IFBvc3QgPSByb3V0ZURlY29yYXRvckZhY3RvcnkoJ3Bvc3QnKTtcblxuLyoqXG4gKiBUaGUgQFB1dCByb3V0ZSBkZWNvcmF0b3IuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByb3V0ZSBUaGUgcm91dGUgdG8gYmUgYXNzaWduZWQgdG8gdGhlIGRlY29yYXRlZCBtZXRob2QuXG4gKiBAcGFyYW0ge0Z1bmN0aW9uW119IGZpbHRlcnMgVGhlIGZpbHRlcnMgdG8gYmUgY2FsbGVkIGJlZm9yZSB0aGUgZGVjb3JhdGVkIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGNvbnN0IFB1dCA9IHJvdXRlRGVjb3JhdG9yRmFjdG9yeSgncHV0Jyk7XG5cbi8qKlxuICogVGhlIEBEZWxldGUgcm91dGUgZGVjb3JhdG9yLlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcm91dGUgVGhlIHJvdXRlIHRvIGJlIGFzc2lnbmVkIHRvIHRoZSBkZWNvcmF0ZWQgbWV0aG9kLlxuICogQHBhcmFtIHtGdW5jdGlvbltdfSBmaWx0ZXJzIFRoZSBmaWx0ZXJzIHRvIGJlIGNhbGxlZCBiZWZvcmUgdGhlIGRlY29yYXRlZCBtZXRob2QuXG4gKi9cbmV4cG9ydCBjb25zdCBEZWxldGUgPSByb3V0ZURlY29yYXRvckZhY3RvcnkoJ2RlbGV0ZScpO1xuIl19