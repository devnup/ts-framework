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
        if (error instanceof HttpError_1.default) {
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
        res.error ? res.error(serverError) : res.json(serverError.toJSON());
    }
}
exports.ErrorReporter = ErrorReporter;
exports.default = ErrorReporter.middleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXJyb3JSZXBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zZXJ2ZXIvZXJyb3IvRXJyb3JSZXBvcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLHlDQUF3QztBQUN4Qyw4Q0FBbUQ7QUFDbkQsZ0RBQXlDO0FBY3pDO0lBS0UsWUFBWSxnQkFBa0MsRUFBRSxVQUFnQyxFQUFFO1FBQ2hGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksZ0JBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM3RCxDQUFDO0lBRUQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxnQkFBa0MsRUFBRSxPQUE2QjtRQUNqRixNQUFNLFFBQVEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RCxNQUFNLENBQUMsaUNBQWlDLEdBQUc7WUFDekMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25GLENBQUMsQ0FBQztJQUNKLENBQUM7SUFBQSxDQUFDO0lBRUYsUUFBUSxDQUFDLEdBQWdCLEVBQUUsR0FBaUI7UUFDMUMsdUJBQXVCO1FBQ3ZCLE1BQU0sS0FBSyxHQUFHLElBQUksbUJBQVMsQ0FBQywrQkFBK0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxFQUFFO1lBQzdHLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtZQUNsQixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVc7U0FDN0IsQ0FBQyxDQUFDO1FBRUgsOEJBQThCO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3pDLEdBQUcsRUFBRSxHQUFHO2dCQUNSLEtBQUssRUFBRSxTQUFTO2dCQUNoQixJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRTthQUMxQixDQUFDLENBQUM7UUFDWixDQUFDO1FBRUQsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRS9DLHFCQUFxQjtRQUNyQixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFFRCxZQUFZLENBQUMsS0FBVSxFQUFFLEdBQWdCLEVBQUUsR0FBaUIsRUFBRSxJQUFjO1FBQzFFLElBQUksV0FBc0IsQ0FBQztRQUUzQix5QkFBeUI7UUFDekIsRUFBRSxDQUFDLENBQUMsS0FBSyxZQUFZLG1CQUFTLENBQUMsQ0FBQyxDQUFDO1lBQy9CLFdBQVcsR0FBRyxLQUFZLENBQUM7UUFDN0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sV0FBVyxHQUFHLElBQUksbUJBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxNQUFNLElBQUksMkJBQWdCLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2pHLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTO2FBQzFDLENBQUMsQ0FBQztZQUNILFdBQVcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDO1FBQ3ZELENBQUM7UUFFRCw4QkFBOEI7UUFDOUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRTtnQkFDL0MsR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsS0FBSyxFQUFFLFdBQVcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVM7Z0JBQ3RELElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsT0FBTyxFQUFFO2FBQ2hDLENBQUMsQ0FBQztRQUNaLENBQUM7UUFFRCxpQkFBaUI7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFdEQsaUNBQWlDO1FBQ2pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTNCLHFCQUFxQjtRQUNyQixHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7Q0FDRjtBQXpFRCxzQ0F5RUM7QUFFRCxrQkFBZSxhQUFhLENBQUMsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmF2ZW4gZnJvbSAncmF2ZW4nO1xuaW1wb3J0IHsgQmFzZVJlcXVlc3QsIEJhc2VSZXNwb25zZSB9IGZyb20gXCIuLi9oZWxwZXJzL3Jlc3BvbnNlXCI7XG5pbXBvcnQgeyBMb2dnZXJJbnN0YW5jZSB9IGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IFNpbXBsZUxvZ2dlciBmcm9tICcuLi8uLi9sb2dnZXInO1xuaW1wb3J0IHsgSHR0cFNlcnZlckVycm9ycyB9IGZyb20gXCIuL2h0dHAvSHR0cENvZGVcIjtcbmltcG9ydCBIdHRwRXJyb3IgZnJvbSBcIi4vaHR0cC9IdHRwRXJyb3JcIjtcblxuZXhwb3J0IGludGVyZmFjZSBFcnJvclJlcG9ydGVyT3B0aW9ucyB7XG4gIHJhdmVuPzogUmF2ZW4uQ2xpZW50O1xuICBsb2dnZXI/OiBMb2dnZXJJbnN0YW5jZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFcnJvckRlZmluaXRpb25zIHtcbiAgW2NvZGU6IHN0cmluZ106IHtcbiAgICBzdGF0dXM6IG51bWJlcjtcbiAgICBtZXNzYWdlOiBudW1iZXI7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVycm9yUmVwb3J0ZXIge1xuICBsb2dnZXI6IExvZ2dlckluc3RhbmNlO1xuICBvcHRpb25zOiBFcnJvclJlcG9ydGVyT3B0aW9ucztcbiAgZXJyb3JEZWZpbml0aW9uczogRXJyb3JEZWZpbml0aW9ucztcblxuICBjb25zdHJ1Y3RvcihlcnJvckRlZmluaXRpb25zOiBFcnJvckRlZmluaXRpb25zLCBvcHRpb25zOiBFcnJvclJlcG9ydGVyT3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lcnJvckRlZmluaXRpb25zID0gZXJyb3JEZWZpbml0aW9ucztcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMubG9nZ2VyID0gb3B0aW9ucy5sb2dnZXIgfHwgU2ltcGxlTG9nZ2VyLmdldEluc3RhbmNlKCk7XG4gIH1cblxuICBzdGF0aWMgbWlkZGxld2FyZShlcnJvckRlZmluaXRpb25zOiBFcnJvckRlZmluaXRpb25zLCBvcHRpb25zOiBFcnJvclJlcG9ydGVyT3B0aW9ucyk6IChBcHBsaWNhdGlvbikgPT4gdm9pZCB7XG4gICAgY29uc3QgcmVwb3J0ZXIgPSBuZXcgRXJyb3JSZXBvcnRlcihlcnJvckRlZmluaXRpb25zLCBvcHRpb25zKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZXJyb3JSZXBvcnRlck1pZGRsZXdhcmUoYXBwKSB7XG4gICAgICBhcHAudXNlKChyZXEsIHJlcykgPT4gcmVwb3J0ZXIubm90Rm91bmQocmVxLCByZXMpKTtcbiAgICAgIGFwcC51c2UoKGVycm9yLCByZXEsIHJlcywgbmV4dCkgPT4gcmVwb3J0ZXIudW5rbm93bkVycm9yKGVycm9yLCByZXEsIHJlcywgbmV4dCkpO1xuICAgIH07XG4gIH07XG5cbiAgbm90Rm91bmQocmVxOiBCYXNlUmVxdWVzdCwgcmVzOiBCYXNlUmVzcG9uc2UpIHtcbiAgICAvLyBCdWlsZCBlcnJvciBpbnN0YW5jZVxuICAgIGNvbnN0IGVycm9yID0gbmV3IEh0dHBFcnJvcihgVGhlIHJlc291cmNlIHdhcyBub3QgZm91bmQ6ICR7cmVxLm1ldGhvZC50b1VwcGVyQ2FzZSgpfSAke3JlcS5vcmlnaW5hbFVybH1gLCA0MDQsIHtcbiAgICAgIG1ldGhvZDogcmVxLm1ldGhvZCxcbiAgICAgIG9yaWdpbmFsVXJsOiByZXEub3JpZ2luYWxVcmwsXG4gICAgfSk7XG5cbiAgICAvLyBTZW5kIHRvIFNlbnRyeSBpZiBhdmFpbGFibGVcbiAgICBpZiAodGhpcy5vcHRpb25zLnJhdmVuKSB7XG4gICAgICB0aGlzLm9wdGlvbnMucmF2ZW4uY2FwdHVyZUV4Y2VwdGlvbihlcnJvciwge1xuICAgICAgICByZXE6IHJlcSxcbiAgICAgICAgbGV2ZWw6ICd3YXJuaW5nJyxcbiAgICAgICAgdGFnczogeyBzdGFja0lkOiBlcnJvci5zdGFja0lkIH1cbiAgICAgIH0gYXMgYW55KTtcbiAgICB9XG5cbiAgICAvLyBMb2cgdG8gY29uc29sZVxuICAgIHRoaXMubG9nZ2VyLndhcm4oZXJyb3IubWVzc2FnZSwgZXJyb3IuZGV0YWlscyk7XG5cbiAgICAvLyBSZXNwb25kIHdpdGggZXJyb3JcbiAgICByZXMuZXJyb3IoZXJyb3IpO1xuICB9XG5cbiAgdW5rbm93bkVycm9yKGVycm9yOiBhbnksIHJlcTogQmFzZVJlcXVlc3QsIHJlczogQmFzZVJlc3BvbnNlLCBuZXh0OiBGdW5jdGlvbikge1xuICAgIGxldCBzZXJ2ZXJFcnJvcjogSHR0cEVycm9yO1xuXG4gICAgLy8gUHJlcGFyZSBlcnJvciBpbnN0YW5jZVxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEh0dHBFcnJvcikge1xuICAgICAgc2VydmVyRXJyb3IgPSBlcnJvciBhcyBhbnk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlcnZlckVycm9yID0gbmV3IEh0dHBFcnJvcihlcnJvci5tZXNzYWdlLCBlcnJvci5zdGF0dXMgfHwgSHR0cFNlcnZlckVycm9ycy5JTlRFUk5BTF9TRVJWRVJfRVJST1IsIHtcbiAgICAgICAgY29kZTogZXJyb3IuY29kZSA/IGVycm9yLmNvZGUgOiB1bmRlZmluZWRcbiAgICAgIH0pO1xuICAgICAgc2VydmVyRXJyb3Iuc3RhY2sgPSBlcnJvci5zdGFjayB8fCBzZXJ2ZXJFcnJvci5zdGFjaztcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRvIFNlbnRyeSBpZiBhdmFpbGFibGVcbiAgICBpZiAodGhpcy5vcHRpb25zLnJhdmVuKSB7XG4gICAgICB0aGlzLm9wdGlvbnMucmF2ZW4uY2FwdHVyZUV4Y2VwdGlvbihzZXJ2ZXJFcnJvciwge1xuICAgICAgICByZXE6IHJlcSxcbiAgICAgICAgbGV2ZWw6IHNlcnZlckVycm9yLnN0YXR1cyA+PSA1MDAgPyAnZXJyb3InIDogJ3dhcm5pbmcnLFxuICAgICAgICB0YWdzOiB7IHN0YWNrSWQ6IHNlcnZlckVycm9yLnN0YWNrSWQgfVxuICAgICAgfSBhcyBhbnkpO1xuICAgIH1cblxuICAgIC8vIExvZyB0byBjb25zb2xlXG4gICAgdGhpcy5sb2dnZXIuZXJyb3IoZXJyb3IubWVzc2FnZSwgc2VydmVyRXJyb3IuZGV0YWlscyk7XG5cbiAgICAvLyBUT0RPOiBIaWRlIHN0YWNrIGluIHByb2R1Y3Rpb25cbiAgICBjb25zb2xlLmVycm9yKGVycm9yLnN0YWNrKTtcblxuICAgIC8vIFJlc3BvbmQgd2l0aCBlcnJvclxuICAgIHJlcy5lcnJvciA/IHJlcy5lcnJvcihzZXJ2ZXJFcnJvcikgOiByZXMuanNvbihzZXJ2ZXJFcnJvci50b0pTT04oKSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRXJyb3JSZXBvcnRlci5taWRkbGV3YXJlOyJdfQ==