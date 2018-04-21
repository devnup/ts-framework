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
        if (constructor.Schema && constructor.Schema.loadClass) {
            constructor.Schema.loadClass(constructor);
        }
        return _a = class extends constructor {
            },
            _a.modelName = name,
            _a.Schema = constructor.Schema,
            _a;
        var _a;
    };
}
exports.Model = Model;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9kYXRhYmFzZS9kZWNvcmF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBU0E7Ozs7Ozs7R0FPRztBQUNILHlDQUF5QztBQUN6QyxlQUFzQixJQUFZLEVBQUUsTUFBZTtJQUNqRCxNQUFNLENBQUMsNkJBQTZELFdBQWM7UUFFaEYsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUVELDhDQUE4QztRQUM5QyxXQUFXLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELFdBQVcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxNQUFNLE1BQUMsS0FBTSxTQUFRLFdBQVc7YUFHL0I7WUFGUSxZQUFTLEdBQUcsSUFBSztZQUNqQixTQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU87ZUFDbkM7O0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWxCRCxzQkFrQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTY2hlbWEgfSBmcm9tICdtb25nb29zZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZU1vZGVsQ29uc3RydWN0b3Ige1xuICBuZXcoLi4uYXJnczogYW55W10pOiB7fTtcblxuICBTY2hlbWE/OiBTY2hlbWE7XG4gIG1vZGVsTmFtZT86IHN0cmluZztcbn1cblxuLyoqXG4gKiBATW9kZWxcbiAqIFxuICogVGhlIGRlY29yYXRvciBmb3IgYXNzaWduaW5nIGEgU2NoZW1hIHRvIGEgTW9uZ29vc2UgTW9kZWwuXG4gKiBcbiAqIEBwYXJhbSBuYW1lIFRoZSBtb25nb29zZSBtb2RlbCBuYW1lXG4gKiBAcGFyYW0gc2NoZW1hIFRoZSBtb25nb29kZSBzY2hlbWFcbiAqL1xuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmZ1bmN0aW9uLW5hbWVcbmV4cG9ydCBmdW5jdGlvbiBNb2RlbChuYW1lOiBzdHJpbmcsIHNjaGVtYT86IFNjaGVtYSkge1xuICByZXR1cm4gZnVuY3Rpb24gY29udHJvbGxlckRlY29yYXRvcjxUIGV4dGVuZHMgQmFzZU1vZGVsQ29uc3RydWN0b3I+KGNvbnN0cnVjdG9yOiBUKSB7XG5cbiAgICBpZiAoIW5hbWUgfHwgIW5hbWUubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBuYW1lIHBhc3NlZCB0byB0aGUgQE1vZGVsKCkgZGVjb3JhdG9yIGNhbm5vdCBiZSBlbXB0eScpO1xuICAgIH1cblxuICAgIC8vIExvYWQgY29uc3RydWN0b3IgY2xhc3MgaW50byBzdXBwbGllZCBzY2hlbWFcbiAgICBjb25zdHJ1Y3Rvci5TY2hlbWEgPSBzY2hlbWEgfHwgY29uc3RydWN0b3IuU2NoZW1hO1xuICAgIGlmIChjb25zdHJ1Y3Rvci5TY2hlbWEgJiYgY29uc3RydWN0b3IuU2NoZW1hLmxvYWRDbGFzcykge1xuICAgICAgY29uc3RydWN0b3IuU2NoZW1hLmxvYWRDbGFzcyhjb25zdHJ1Y3Rvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsYXNzIGV4dGVuZHMgY29uc3RydWN0b3Ige1xuICAgICAgc3RhdGljIG1vZGVsTmFtZSA9IG5hbWU7XG4gICAgICBzdGF0aWMgU2NoZW1hID0gY29uc3RydWN0b3IuU2NoZW1hO1xuICAgIH07XG4gIH07XG59XG4iXX0=