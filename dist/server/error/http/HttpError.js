"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("../../../error/BaseError");
class HttpError extends BaseError_1.default {
    constructor(message, status, details = {}) {
        super(`[${status}] ${message}`, details);
        this.status = status;
    }
    toObject() {
        return Object.assign({ status: this.status }, super.toObject());
    }
}
exports.default = HttpError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHR0cEVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbGliL3NlcnZlci9lcnJvci9odHRwL0h0dHBFcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdEQUFpRDtBQUlqRCxlQUErQixTQUFRLG1CQUFTO0lBRzlDLFlBQVksT0FBTyxFQUFFLE1BQWdCLEVBQUUsVUFBa0IsRUFBRTtRQUN6RCxLQUFLLENBQUMsSUFBSSxNQUFNLEtBQUssT0FBTyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVNLFFBQVE7UUFDYixNQUFNLGlCQUNKLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxJQUNoQixLQUFLLENBQUMsUUFBUSxFQUFFLEVBQ3BCO0lBQ0gsQ0FBQztDQUNGO0FBZEQsNEJBY0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUVycm9yIGZyb20gXCIuLi8uLi8uLi9lcnJvci9CYXNlRXJyb3JcIjtcbmltcG9ydCB7IEh0dHBDb2RlIH0gZnJvbSBcIi4vSHR0cENvZGVcIjtcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIdHRwRXJyb3IgZXh0ZW5kcyBCYXNlRXJyb3Ige1xuICBzdGF0dXM6IEh0dHBDb2RlO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIHN0YXR1czogSHR0cENvZGUsIGRldGFpbHM6IG9iamVjdCA9IHt9KSB7XG4gICAgc3VwZXIoYFske3N0YXR1c31dICR7bWVzc2FnZX1gLCBkZXRhaWxzKTtcbiAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgfVxuXG4gIHB1YmxpYyB0b09iamVjdCgpOiBhbnkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgLi4uc3VwZXIudG9PYmplY3QoKVxuICAgIH1cbiAgfVxufVxuIl19