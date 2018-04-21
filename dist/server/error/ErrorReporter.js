"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../logger");
const HttpCode_1 = require("./http/HttpCode");
const HttpError_1 = require("./http/HttpError");
class ErrorReporter {
    constructor(errorDefinitions, options = {}) {
        this.errorDefinitions = errorDefinitions;
        this.options = options;
        this.logger = options.logger || logger_1.default.getInstance();
    }
    static middleware(errorDefinitions, options) {
        const reporter = new ErrorReporter(errorDefinitions, options);
        return function errorReporterMiddleware(app) {
            app.use((req, res) => reporter.notFound(req, res));
            app.use((error, req, res, next) => reporter.unknownError(error, req, res, next));
        };
    }
    ;
    notFound(req, res) {
        // Build error instance
        const error = new HttpError_1.default(`The resource was not found: ${req.method.toUpperCase()} ${req.originalUrl}`, 404, {
            method: req.method,
            originalUrl: req.originalUrl,
        });
        // Send to Sentry if available
        if (this.options.raven) {
            this.options.raven.captureException(error, {
                req: req,
                level: 'warning',
                tags: { stackId: error.stackId }
            });
        }
        // Log to console
        this.logger.warn(error.message, error.details);
        // Respond with error
        res.error(error);
    }
    unknownError(error, req, res, next) {
        let serverError;
        // Prepare error instance
        if (error && error.inner && error.inner instanceof HttpError_1.default) {
            // Fix for OAuth 2.0 errors, which encapsulate the original one into the "inner" property
            serverError = error.inner;
        }
        else if (error && error instanceof HttpError_1.default) {
            serverError = error;
        }
        else {
            serverError = new HttpError_1.default(error.message, error.status || HttpCode_1.HttpServerErrors.INTERNAL_SERVER_ERROR, {
                code: error.code ? error.code : undefined
            });
            serverError.stack = error.stack || serverError.stack;
        }
        // Send to Sentry if available
        if (this.options.raven) {
            this.options.raven.captureException(serverError, {
                req: req,
                level: serverError.status >= 500 ? 'error' : 'warning',
                tags: { stackId: serverError.stackId }
            });
        }
        // Log to console
        this.logger.error(error.message, serverError.details);
        // TODO: Hide stack in production
        console.error(error.stack);
        // Respond with error
        res.error ? res.error(serverError) : res.status(serverError.status || 500).json(serverError.toJSON());
    }
}
exports.ErrorReporter = ErrorReporter;
exports.default = ErrorReporter.middleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXJyb3JSZXBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zZXJ2ZXIvZXJyb3IvRXJyb3JSZXBvcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLHlDQUF3QztBQUN4Qyw4Q0FBbUQ7QUFDbkQsZ0RBQXlDO0FBY3pDO0lBS0UsWUFBWSxnQkFBa0MsRUFBRSxVQUFnQyxFQUFFO1FBQ2hGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksZ0JBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM3RCxDQUFDO0lBRUQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxnQkFBa0MsRUFBRSxPQUE2QjtRQUNqRixNQUFNLFFBQVEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RCxNQUFNLENBQUMsaUNBQWlDLEdBQUc7WUFDekMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25GLENBQUMsQ0FBQztJQUNKLENBQUM7SUFBQSxDQUFDO0lBRUYsUUFBUSxDQUFDLEdBQWdCLEVBQUUsR0FBaUI7UUFDMUMsdUJBQXVCO1FBQ3ZCLE1BQU0sS0FBSyxHQUFHLElBQUksbUJBQVMsQ0FBQywrQkFBK0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxFQUFFO1lBQzdHLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtZQUNsQixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVc7U0FDN0IsQ0FBQyxDQUFDO1FBRUgsOEJBQThCO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3pDLEdBQUcsRUFBRSxHQUFHO2dCQUNSLEtBQUssRUFBRSxTQUFTO2dCQUNoQixJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRTthQUMxQixDQUFDLENBQUM7UUFDWixDQUFDO1FBRUQsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRS9DLHFCQUFxQjtRQUNyQixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFFRCxZQUFZLENBQUMsS0FBVSxFQUFFLEdBQWdCLEVBQUUsR0FBaUIsRUFBRSxJQUFjO1FBQzFFLElBQUksV0FBc0IsQ0FBQztRQUUzQix5QkFBeUI7UUFDekIsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssWUFBWSxtQkFBUyxDQUFDLENBQUMsQ0FBQztZQUM3RCx5RkFBeUY7WUFDekYsV0FBVyxHQUFHLEtBQUssQ0FBQyxLQUFrQixDQUFDO1FBQ3pDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLEtBQUssWUFBWSxtQkFBUyxDQUFDLENBQUMsQ0FBQztZQUMvQyxXQUFXLEdBQUcsS0FBa0IsQ0FBQztRQUNuQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixXQUFXLEdBQUcsSUFBSSxtQkFBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE1BQU0sSUFBSSwyQkFBZ0IsQ0FBQyxxQkFBcUIsRUFBRTtnQkFDakcsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVM7YUFDMUMsQ0FBQyxDQUFDO1lBQ0gsV0FBVyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUM7UUFDdkQsQ0FBQztRQUVELDhCQUE4QjtRQUM5QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFO2dCQUMvQyxHQUFHLEVBQUUsR0FBRztnQkFDUixLQUFLLEVBQUUsV0FBVyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUztnQkFDdEQsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxPQUFPLEVBQUU7YUFDaEMsQ0FBQyxDQUFDO1FBQ1osQ0FBQztRQUVELGlCQUFpQjtRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0RCxpQ0FBaUM7UUFDakMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0IscUJBQXFCO1FBQ3JCLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDeEcsQ0FBQztDQUNGO0FBNUVELHNDQTRFQztBQUVELGtCQUFlLGFBQWEsQ0FBQyxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSYXZlbiBmcm9tICdyYXZlbic7XG5pbXBvcnQgeyBCYXNlUmVxdWVzdCwgQmFzZVJlc3BvbnNlIH0gZnJvbSBcIi4uL2hlbHBlcnMvcmVzcG9uc2VcIjtcbmltcG9ydCB7IExvZ2dlckluc3RhbmNlIH0gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgU2ltcGxlTG9nZ2VyIGZyb20gJy4uLy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBIdHRwU2VydmVyRXJyb3JzIH0gZnJvbSBcIi4vaHR0cC9IdHRwQ29kZVwiO1xuaW1wb3J0IEh0dHBFcnJvciBmcm9tIFwiLi9odHRwL0h0dHBFcnJvclwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVycm9yUmVwb3J0ZXJPcHRpb25zIHtcbiAgcmF2ZW4/OiBSYXZlbi5DbGllbnQ7XG4gIGxvZ2dlcj86IExvZ2dlckluc3RhbmNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVycm9yRGVmaW5pdGlvbnMge1xuICBbY29kZTogc3RyaW5nXToge1xuICAgIHN0YXR1czogbnVtYmVyO1xuICAgIG1lc3NhZ2U6IG51bWJlcjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRXJyb3JSZXBvcnRlciB7XG4gIGxvZ2dlcjogTG9nZ2VySW5zdGFuY2U7XG4gIG9wdGlvbnM6IEVycm9yUmVwb3J0ZXJPcHRpb25zO1xuICBlcnJvckRlZmluaXRpb25zOiBFcnJvckRlZmluaXRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKGVycm9yRGVmaW5pdGlvbnM6IEVycm9yRGVmaW5pdGlvbnMsIG9wdGlvbnM6IEVycm9yUmVwb3J0ZXJPcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmVycm9yRGVmaW5pdGlvbnMgPSBlcnJvckRlZmluaXRpb25zO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5sb2dnZXIgPSBvcHRpb25zLmxvZ2dlciB8fCBTaW1wbGVMb2dnZXIuZ2V0SW5zdGFuY2UoKTtcbiAgfVxuXG4gIHN0YXRpYyBtaWRkbGV3YXJlKGVycm9yRGVmaW5pdGlvbnM6IEVycm9yRGVmaW5pdGlvbnMsIG9wdGlvbnM6IEVycm9yUmVwb3J0ZXJPcHRpb25zKTogKEFwcGxpY2F0aW9uKSA9PiB2b2lkIHtcbiAgICBjb25zdCByZXBvcnRlciA9IG5ldyBFcnJvclJlcG9ydGVyKGVycm9yRGVmaW5pdGlvbnMsIG9wdGlvbnMpO1xuICAgIHJldHVybiBmdW5jdGlvbiBlcnJvclJlcG9ydGVyTWlkZGxld2FyZShhcHApIHtcbiAgICAgIGFwcC51c2UoKHJlcSwgcmVzKSA9PiByZXBvcnRlci5ub3RGb3VuZChyZXEsIHJlcykpO1xuICAgICAgYXBwLnVzZSgoZXJyb3IsIHJlcSwgcmVzLCBuZXh0KSA9PiByZXBvcnRlci51bmtub3duRXJyb3IoZXJyb3IsIHJlcSwgcmVzLCBuZXh0KSk7XG4gICAgfTtcbiAgfTtcblxuICBub3RGb3VuZChyZXE6IEJhc2VSZXF1ZXN0LCByZXM6IEJhc2VSZXNwb25zZSkge1xuICAgIC8vIEJ1aWxkIGVycm9yIGluc3RhbmNlXG4gICAgY29uc3QgZXJyb3IgPSBuZXcgSHR0cEVycm9yKGBUaGUgcmVzb3VyY2Ugd2FzIG5vdCBmb3VuZDogJHtyZXEubWV0aG9kLnRvVXBwZXJDYXNlKCl9ICR7cmVxLm9yaWdpbmFsVXJsfWAsIDQwNCwge1xuICAgICAgbWV0aG9kOiByZXEubWV0aG9kLFxuICAgICAgb3JpZ2luYWxVcmw6IHJlcS5vcmlnaW5hbFVybCxcbiAgICB9KTtcblxuICAgIC8vIFNlbmQgdG8gU2VudHJ5IGlmIGF2YWlsYWJsZVxuICAgIGlmICh0aGlzLm9wdGlvbnMucmF2ZW4pIHtcbiAgICAgIHRoaXMub3B0aW9ucy5yYXZlbi5jYXB0dXJlRXhjZXB0aW9uKGVycm9yLCB7XG4gICAgICAgIHJlcTogcmVxLFxuICAgICAgICBsZXZlbDogJ3dhcm5pbmcnLFxuICAgICAgICB0YWdzOiB7IHN0YWNrSWQ6IGVycm9yLnN0YWNrSWQgfVxuICAgICAgfSBhcyBhbnkpO1xuICAgIH1cblxuICAgIC8vIExvZyB0byBjb25zb2xlXG4gICAgdGhpcy5sb2dnZXIud2FybihlcnJvci5tZXNzYWdlLCBlcnJvci5kZXRhaWxzKTtcblxuICAgIC8vIFJlc3BvbmQgd2l0aCBlcnJvclxuICAgIHJlcy5lcnJvcihlcnJvcik7XG4gIH1cblxuICB1bmtub3duRXJyb3IoZXJyb3I6IGFueSwgcmVxOiBCYXNlUmVxdWVzdCwgcmVzOiBCYXNlUmVzcG9uc2UsIG5leHQ6IEZ1bmN0aW9uKSB7XG4gICAgbGV0IHNlcnZlckVycm9yOiBIdHRwRXJyb3I7XG5cbiAgICAvLyBQcmVwYXJlIGVycm9yIGluc3RhbmNlXG4gICAgaWYgKGVycm9yICYmIGVycm9yLmlubmVyICYmIGVycm9yLmlubmVyIGluc3RhbmNlb2YgSHR0cEVycm9yKSB7XG4gICAgICAvLyBGaXggZm9yIE9BdXRoIDIuMCBlcnJvcnMsIHdoaWNoIGVuY2Fwc3VsYXRlIHRoZSBvcmlnaW5hbCBvbmUgaW50byB0aGUgXCJpbm5lclwiIHByb3BlcnR5XG4gICAgICBzZXJ2ZXJFcnJvciA9IGVycm9yLmlubmVyIGFzIEh0dHBFcnJvcjtcbiAgICB9IGVsc2UgaWYgKGVycm9yICYmIGVycm9yIGluc3RhbmNlb2YgSHR0cEVycm9yKSB7XG4gICAgICBzZXJ2ZXJFcnJvciA9IGVycm9yIGFzIEh0dHBFcnJvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VydmVyRXJyb3IgPSBuZXcgSHR0cEVycm9yKGVycm9yLm1lc3NhZ2UsIGVycm9yLnN0YXR1cyB8fCBIdHRwU2VydmVyRXJyb3JzLklOVEVSTkFMX1NFUlZFUl9FUlJPUiwge1xuICAgICAgICBjb2RlOiBlcnJvci5jb2RlID8gZXJyb3IuY29kZSA6IHVuZGVmaW5lZFxuICAgICAgfSk7XG4gICAgICBzZXJ2ZXJFcnJvci5zdGFjayA9IGVycm9yLnN0YWNrIHx8IHNlcnZlckVycm9yLnN0YWNrO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdG8gU2VudHJ5IGlmIGF2YWlsYWJsZVxuICAgIGlmICh0aGlzLm9wdGlvbnMucmF2ZW4pIHtcbiAgICAgIHRoaXMub3B0aW9ucy5yYXZlbi5jYXB0dXJlRXhjZXB0aW9uKHNlcnZlckVycm9yLCB7XG4gICAgICAgIHJlcTogcmVxLFxuICAgICAgICBsZXZlbDogc2VydmVyRXJyb3Iuc3RhdHVzID49IDUwMCA/ICdlcnJvcicgOiAnd2FybmluZycsXG4gICAgICAgIHRhZ3M6IHsgc3RhY2tJZDogc2VydmVyRXJyb3Iuc3RhY2tJZCB9XG4gICAgICB9IGFzIGFueSk7XG4gICAgfVxuXG4gICAgLy8gTG9nIHRvIGNvbnNvbGVcbiAgICB0aGlzLmxvZ2dlci5lcnJvcihlcnJvci5tZXNzYWdlLCBzZXJ2ZXJFcnJvci5kZXRhaWxzKTtcblxuICAgIC8vIFRPRE86IEhpZGUgc3RhY2sgaW4gcHJvZHVjdGlvblxuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3Iuc3RhY2spO1xuXG4gICAgLy8gUmVzcG9uZCB3aXRoIGVycm9yXG4gICAgcmVzLmVycm9yID8gcmVzLmVycm9yKHNlcnZlckVycm9yKSA6IHJlcy5zdGF0dXMoc2VydmVyRXJyb3Iuc3RhdHVzIHx8IDUwMCkuanNvbihzZXJ2ZXJFcnJvci50b0pTT04oKSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRXJyb3JSZXBvcnRlci5taWRkbGV3YXJlOyJdfQ==