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
AssertionHelper.toBoolean = (fn) => {
    return function (req, res, next) {
        return fn(req, res);
    };
};
exports.default = AssertionHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvYXNzZXJ0aW9uL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBTztBQUNQLDZCQUE2QjtBQU03Qjs7Ozs7R0FLRztBQUNILE1BQU0sZUFBZSxHQUFHLFVBQVUsRUFBc0I7SUFDdEQsTUFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJO1FBQzdCLElBQUksQ0FBQztZQUNILE1BQU0sRUFBRSxHQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFTLENBQUM7WUFDakMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNqQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO29CQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBSSxFQUFFLENBQUM7WUFDVCxDQUFDO1lBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBUSxDQUFDO0FBQ1gsQ0FBQyxDQUFDO0FBRUQsZUFBdUIsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFzQixFQUFFLEVBQUU7SUFDOUQsTUFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJO1FBQzdCLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLENBQVEsQ0FBQztBQUNYLENBQUMsQ0FBQztBQUdGLGtCQUFlLGVBQW1DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUT0RPXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gXCJ1dGlsXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUFzc2VydGlvbkhlbHBlciB7XG4gIChmbjogKHJlcSwgcmVzKSA9PiB2b2lkKTogdm9pZDtcbn1cblxuLyoqXG4gKiBXcmFwcyBmdW5jdGlvbiB0byBoYW5kbGUgYXNzZXJ0aW9ucyBhcyBwcm9taXNlcy5cbiAqXG4gKiBAcGFyYW0geyhyZXEsIHJlcykgPT4gdm9pZH0gZm4gVGhlIGZ1bmN0aW9uIHdpdGggYXNzZXJ0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAqL1xuY29uc3QgQXNzZXJ0aW9uSGVscGVyID0gZnVuY3Rpb24gKGZuOiAocmVxLCByZXMpID0+IHZvaWQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChyZXEsIHJlcywgbmV4dCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjYiA9IChmbihyZXEsIHJlcykgYXMgYW55KTtcbiAgICAgIGlmIChjYiAmJiB1dGlsLmlzRnVuY3Rpb24oY2IuY2F0Y2gpKSB7XG4gICAgICAgIHJldHVybiBjYi50aGVuKG5leHQpLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBlcnJvci5zdGF0dXMgPSBlcnJvci5zdGF0dXMgfHwgNDAwO1xuICAgICAgICAgIG5leHQoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYjtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICBuZXh0KGVycm9yKTtcbiAgICB9XG4gIH0gYXMgYW55O1xufTtcblxuKEFzc2VydGlvbkhlbHBlciBhcyBhbnkpLnRvQm9vbGVhbiA9IChmbjogKHJlcSwgcmVzKSA9PiB2b2lkKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbiAocmVxLCByZXMsIG5leHQpIHtcbiAgICByZXR1cm4gZm4ocmVxLCByZXMpO1xuICB9IGFzIGFueTtcbn07XG5cblxuZXhwb3J0IGRlZmF1bHQgQXNzZXJ0aW9uSGVscGVyIGFzIElBc3NlcnRpb25IZWxwZXI7Il19