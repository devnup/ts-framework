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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHR0cEVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbGliL3NlcnZlci9lcnJvci9odHRwL0h0dHBFcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdEQUFpRDtBQUlqRCxlQUErQixTQUFRLG1CQUFTO0lBRzlDLFlBQVksT0FBTyxFQUFFLE1BQWdCLEVBQUUsVUFBa0IsRUFBRTtRQUN6RCxLQUFLLENBQUMsSUFBSSxNQUFNLEtBQUssT0FBTyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVNLFFBQVE7UUFDYixNQUFNLGlCQUNKLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxJQUNoQixLQUFLLENBQUMsUUFBUSxFQUFFLEVBQ25CO0lBQ0osQ0FBQztDQUNGO0FBZEQsNEJBY0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUVycm9yIGZyb20gJy4uLy4uLy4uL2Vycm9yL0Jhc2VFcnJvcic7XG5pbXBvcnQgeyBIdHRwQ29kZSB9IGZyb20gJy4vSHR0cENvZGUnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEh0dHBFcnJvciBleHRlbmRzIEJhc2VFcnJvciB7XG4gIHN0YXR1czogSHR0cENvZGU7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZSwgc3RhdHVzOiBIdHRwQ29kZSwgZGV0YWlsczogb2JqZWN0ID0ge30pIHtcbiAgICBzdXBlcihgWyR7c3RhdHVzfV0gJHttZXNzYWdlfWAsIGRldGFpbHMpO1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB9XG5cbiAgcHVibGljIHRvT2JqZWN0KCk6IGFueSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICAuLi5zdXBlci50b09iamVjdCgpLFxuICAgIH07XG4gIH1cbn1cbiJdfQ==