"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const SentryTransport = require("winston-raven-sentry");
class SimpleLogger extends winston.Logger {
    constructor(options = {}) {
        // Prepare default console transport
        const opt = {
            transports: options.transports || SimpleLogger.DEFAULT_TRANSPORTS,
        };
        // Add sentry if available
        if (options.sentry) {
            opt.transports.push(new SentryTransport(options.sentry));
        }
        super(opt);
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new SimpleLogger();
        }
        return this.instance;
    }
}
SimpleLogger.DEFAULT_TRANSPORTS = [
    new (winston.transports.Console)({
        // TODO: Get from default configuration layer
        level: process.env.LOG_LEVEL || 'silly',
        colorize: true,
    }),
];
exports.default = SimpleLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvbG9nZ2VyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQW1DO0FBQ25DLHdEQUF3RDtBQU94RCxrQkFBa0MsU0FBUSxPQUFPLENBQUMsTUFBTTtJQVd0RCxZQUFtQixVQUErQixFQUFFO1FBQ2xELG9DQUFvQztRQUNwQyxNQUFNLEdBQUcsR0FBRztZQUNWLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxJQUFJLFlBQVksQ0FBQyxrQkFBa0I7U0FDbEUsQ0FBQztRQUVGLDBCQUEwQjtRQUMxQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNuQixHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVNLE1BQU0sQ0FBQyxXQUFXO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDOztBQTNCTSwrQkFBa0IsR0FBdUM7SUFDOUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0IsNkNBQTZDO1FBQzdDLEtBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxPQUFPO1FBQ3ZDLFFBQVEsRUFBRSxJQUFJO0tBQ2YsQ0FBQztDQUNILENBQUM7QUFUSiwrQkErQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB3aW5zdG9uIGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0ICogYXMgU2VudHJ5VHJhbnNwb3J0IGZyb20gJ3dpbnN0b24tcmF2ZW4tc2VudHJ5JztcbmltcG9ydCB7IFNlbnRyeVRyYW5zcG9ydE9wdGlvbnMgfSBmcm9tICcuL3NlbnRyeS9TZW50cnlUcmFuc3BvcnRPcHRpb25zJztcblxuZXhwb3J0IGludGVyZmFjZSBTaW1wbGVMb2dnZXJPcHRpb25zIGV4dGVuZHMgd2luc3Rvbi5Mb2dnZXJPcHRpb25zIHtcbiAgc2VudHJ5PzogU2VudHJ5VHJhbnNwb3J0T3B0aW9ucztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2ltcGxlTG9nZ2VyIGV4dGVuZHMgd2luc3Rvbi5Mb2dnZXIge1xuICBwcm90ZWN0ZWQgc3RhdGljIGluc3RhbmNlOiBTaW1wbGVMb2dnZXI7XG5cbiAgc3RhdGljIERFRkFVTFRfVFJBTlNQT1JUUzogd2luc3Rvbi5Db25zb2xlVHJhbnNwb3J0SW5zdGFuY2VbXSA9IFtcbiAgICBuZXcgKHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKSh7XG4gICAgICAvLyBUT0RPOiBHZXQgZnJvbSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gbGF5ZXJcbiAgICAgIGxldmVsOiBwcm9jZXNzLmVudi5MT0dfTEVWRUwgfHwgJ3NpbGx5JyxcbiAgICAgIGNvbG9yaXplOiB0cnVlLFxuICAgIH0pLFxuICBdO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBTaW1wbGVMb2dnZXJPcHRpb25zID0ge30pIHtcbiAgICAvLyBQcmVwYXJlIGRlZmF1bHQgY29uc29sZSB0cmFuc3BvcnRcbiAgICBjb25zdCBvcHQgPSB7XG4gICAgICB0cmFuc3BvcnRzOiBvcHRpb25zLnRyYW5zcG9ydHMgfHwgU2ltcGxlTG9nZ2VyLkRFRkFVTFRfVFJBTlNQT1JUUyxcbiAgICB9O1xuXG4gICAgLy8gQWRkIHNlbnRyeSBpZiBhdmFpbGFibGVcbiAgICBpZiAob3B0aW9ucy5zZW50cnkpIHtcbiAgICAgIG9wdC50cmFuc3BvcnRzLnB1c2gobmV3IFNlbnRyeVRyYW5zcG9ydChvcHRpb25zLnNlbnRyeSkpO1xuICAgIH1cblxuICAgIHN1cGVyKG9wdCk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6IHdpbnN0b24uTG9nZ2VySW5zdGFuY2Uge1xuICAgIGlmICghdGhpcy5pbnN0YW5jZSkge1xuICAgICAgdGhpcy5pbnN0YW5jZSA9IG5ldyBTaW1wbGVMb2dnZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG4gIH1cbn1cbiJdfQ==