"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO
const util = require("util");
/**
 * Wraps function to handle assertions as promises.
 *
 * @param {(req, res) => void} fn The function with assertions
 * @returns {Promise<any>}
 */
const AssertionHelper = function (fn) {
    return function (req, res, next) {
        try {
            const cb = fn(req, res);
            if (cb && util.isFunction(cb.catch)) {
                return cb.then(next).catch(error => {
                    error.status = error.status || 400;
                    next(error);
                });
            }
            else {
                next();
            }
            return cb;
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    };
};
exports.default = AssertionHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvYXNzZXJ0aW9uL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBTztBQUNQLDZCQUE2QjtBQU03Qjs7Ozs7R0FLRztBQUNILE1BQU0sZUFBZSxHQUFHLFVBQVUsRUFBc0I7SUFDdEQsTUFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJO1FBQzdCLElBQUksQ0FBQztZQUNILE1BQU0sRUFBRSxHQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFTLENBQUM7WUFDakMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNqQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO29CQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBSSxFQUFFLENBQUM7WUFDVCxDQUFDO1lBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBUSxDQUFDO0FBQ1gsQ0FBQyxDQUFDO0FBRUYsa0JBQWUsZUFBbUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRPRE9cbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcInV0aWxcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJQXNzZXJ0aW9uSGVscGVyIHtcbiAgKGZuOiAocmVxLCByZXMpID0+IHZvaWQpOiB2b2lkO1xufVxuXG4vKipcbiAqIFdyYXBzIGZ1bmN0aW9uIHRvIGhhbmRsZSBhc3NlcnRpb25zIGFzIHByb21pc2VzLlxuICpcbiAqIEBwYXJhbSB7KHJlcSwgcmVzKSA9PiB2b2lkfSBmbiBUaGUgZnVuY3Rpb24gd2l0aCBhc3NlcnRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICovXG5jb25zdCBBc3NlcnRpb25IZWxwZXIgPSBmdW5jdGlvbiAoZm46IChyZXEsIHJlcykgPT4gdm9pZCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNiID0gKGZuKHJlcSwgcmVzKSBhcyBhbnkpO1xuICAgICAgaWYgKGNiICYmIHV0aWwuaXNGdW5jdGlvbihjYi5jYXRjaCkpIHtcbiAgICAgICAgcmV0dXJuIGNiLnRoZW4obmV4dCkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGVycm9yLnN0YXR1cyA9IGVycm9yLnN0YXR1cyB8fCA0MDA7XG4gICAgICAgICAgbmV4dChlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNiO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgIG5leHQoZXJyb3IpO1xuICAgIH1cbiAgfSBhcyBhbnk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBc3NlcnRpb25IZWxwZXIgYXMgSUFzc2VydGlvbkhlbHBlcjsiXX0=