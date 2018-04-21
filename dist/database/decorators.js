"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @Model
 *
 * The decorator for assigning a Schema to a Mongoose Model.
 *
 * @param name The mongoose model name
 * @param schema The mongoode schema
 */
// tslint:disable-next-line:function-name
function Model(name, schema) {
    return function controllerDecorator(constructor) {
        if (!name || !name.length) {
            throw new Error('The name passed to the @Model() decorator cannot be empty');
        }
        // Load constructor class into supplied schema
        constructor.Schema = schema || constructor.Schema;
        constructor.Schema.loadClass(constructor);
        return _a = class extends constructor {
            },
            _a.modelName = name,
            _a.Schema = constructor.Schema,
            _a;
        var _a;
    };
}
exports.Model = Model;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9kYXRhYmFzZS9kZWNvcmF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBU0E7Ozs7Ozs7R0FPRztBQUNGLHlDQUF5QztBQUMxQyxlQUFzQixJQUFZLEVBQUUsTUFBZTtJQUNqRCxNQUFNLENBQUMsNkJBQTZELFdBQWM7UUFFaEYsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUVELDhDQUE4QztRQUM5QyxXQUFXLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDO1FBQ2xELFdBQVcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTFDLE1BQU0sTUFBQyxLQUFNLFNBQVEsV0FBVzthQUcvQjtZQUZRLFlBQVMsR0FBRyxJQUFLO1lBQ2pCLFNBQU0sR0FBRyxXQUFXLENBQUMsTUFBTztlQUNuQzs7SUFDSixDQUFDLENBQUM7QUFDSixDQUFDO0FBaEJELHNCQWdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNjaGVtYSB9IGZyb20gJ21vbmdvb3NlJztcblxuZXhwb3J0IGludGVyZmFjZSBCYXNlTW9kZWxDb25zdHJ1Y3RvciB7XG4gIG5ldyguLi5hcmdzOiBhbnlbXSk6IHt9O1xuXG4gIFNjaGVtYT86IFNjaGVtYTtcbiAgbW9kZWxOYW1lPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEBNb2RlbFxuICogXG4gKiBUaGUgZGVjb3JhdG9yIGZvciBhc3NpZ25pbmcgYSBTY2hlbWEgdG8gYSBNb25nb29zZSBNb2RlbC5cbiAqIFxuICogQHBhcmFtIG5hbWUgVGhlIG1vbmdvb3NlIG1vZGVsIG5hbWVcbiAqIEBwYXJhbSBzY2hlbWEgVGhlIG1vbmdvb2RlIHNjaGVtYVxuICovIFxuIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpmdW5jdGlvbi1uYW1lXG5leHBvcnQgZnVuY3Rpb24gTW9kZWwobmFtZTogc3RyaW5nLCBzY2hlbWE/OiBTY2hlbWEpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbnRyb2xsZXJEZWNvcmF0b3I8VCBleHRlbmRzIEJhc2VNb2RlbENvbnN0cnVjdG9yPihjb25zdHJ1Y3RvcjogVCkge1xuXG4gICAgaWYgKCFuYW1lIHx8ICFuYW1lLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgbmFtZSBwYXNzZWQgdG8gdGhlIEBNb2RlbCgpIGRlY29yYXRvciBjYW5ub3QgYmUgZW1wdHknKTtcbiAgICB9XG5cbiAgICAvLyBMb2FkIGNvbnN0cnVjdG9yIGNsYXNzIGludG8gc3VwcGxpZWQgc2NoZW1hXG4gICAgY29uc3RydWN0b3IuU2NoZW1hID0gc2NoZW1hIHx8IGNvbnN0cnVjdG9yLlNjaGVtYTtcbiAgICBjb25zdHJ1Y3Rvci5TY2hlbWEubG9hZENsYXNzKGNvbnN0cnVjdG9yKTtcblxuICAgIHJldHVybiBjbGFzcyBleHRlbmRzIGNvbnN0cnVjdG9yIHtcbiAgICAgIHN0YXRpYyBtb2RlbE5hbWUgPSBuYW1lO1xuICAgICAgc3RhdGljIFNjaGVtYSA9IGNvbnN0cnVjdG9yLlNjaGVtYTtcbiAgICB9O1xuICB9O1xufVxuIl19