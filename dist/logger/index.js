"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const SentryTransport = require("winston-raven-sentry");
const winston_1 = require("winston");
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
    new (winston_1.transports.Console)({
        // TODO: Get from default configuration layer
        level: process.env.LOG_LEVEL || 'silly',
        colorize: true,
    })
];
exports.default = SimpleLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvbG9nZ2VyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQW1DO0FBQ25DLHdEQUF3RDtBQUN4RCxxQ0FBOEY7QUFPOUYsa0JBQWtDLFNBQVEsT0FBTyxDQUFDLE1BQU07SUFXdEQsWUFBbUIsVUFBK0IsRUFBRTtRQUNsRCxvQ0FBb0M7UUFDcEMsTUFBTSxHQUFHLEdBQUc7WUFDVixVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsSUFBSSxZQUFZLENBQUMsa0JBQWtCO1NBQ2xFLENBQUM7UUFFRiwwQkFBMEI7UUFDMUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbkIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFTSxNQUFNLENBQUMsV0FBVztRQUN2QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQTtRQUNwQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdkIsQ0FBQzs7QUEzQk0sK0JBQWtCLEdBQStCO0lBQ3RELElBQUksQ0FBQyxvQkFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZCLDZDQUE2QztRQUM3QyxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksT0FBTztRQUN2QyxRQUFRLEVBQUUsSUFBSTtLQUNmLENBQUM7Q0FDSCxDQUFDO0FBVEosK0JBK0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgd2luc3RvbiBmcm9tICd3aW5zdG9uJztcbmltcG9ydCAqIGFzIFNlbnRyeVRyYW5zcG9ydCBmcm9tICd3aW5zdG9uLXJhdmVuLXNlbnRyeSc7XG5pbXBvcnQgeyBDb25zb2xlVHJhbnNwb3J0SW5zdGFuY2UsIExvZ2dlckluc3RhbmNlLCBMb2dnZXJPcHRpb25zLCB0cmFuc3BvcnRzIH0gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyBTZW50cnlUcmFuc3BvcnRPcHRpb25zIH0gZnJvbSBcIi4vc2VudHJ5L1NlbnRyeVRyYW5zcG9ydE9wdGlvbnNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBTaW1wbGVMb2dnZXJPcHRpb25zIGV4dGVuZHMgTG9nZ2VyT3B0aW9ucyB7XG4gIHNlbnRyeT86IFNlbnRyeVRyYW5zcG9ydE9wdGlvbnM7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXBsZUxvZ2dlciBleHRlbmRzIHdpbnN0b24uTG9nZ2VyIHtcbiAgcHJvdGVjdGVkIHN0YXRpYyBpbnN0YW5jZTogU2ltcGxlTG9nZ2VyO1xuXG4gIHN0YXRpYyBERUZBVUxUX1RSQU5TUE9SVFM6IENvbnNvbGVUcmFuc3BvcnRJbnN0YW5jZVtdID0gW1xuICAgIG5ldyAodHJhbnNwb3J0cy5Db25zb2xlKSh7XG4gICAgICAvLyBUT0RPOiBHZXQgZnJvbSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gbGF5ZXJcbiAgICAgIGxldmVsOiBwcm9jZXNzLmVudi5MT0dfTEVWRUwgfHwgJ3NpbGx5JyxcbiAgICAgIGNvbG9yaXplOiB0cnVlLFxuICAgIH0pXG4gIF07XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFNpbXBsZUxvZ2dlck9wdGlvbnMgPSB7fSkge1xuICAgIC8vIFByZXBhcmUgZGVmYXVsdCBjb25zb2xlIHRyYW5zcG9ydFxuICAgIGNvbnN0IG9wdCA9IHtcbiAgICAgIHRyYW5zcG9ydHM6IG9wdGlvbnMudHJhbnNwb3J0cyB8fCBTaW1wbGVMb2dnZXIuREVGQVVMVF9UUkFOU1BPUlRTLFxuICAgIH07XG5cbiAgICAvLyBBZGQgc2VudHJ5IGlmIGF2YWlsYWJsZVxuICAgIGlmIChvcHRpb25zLnNlbnRyeSkge1xuICAgICAgb3B0LnRyYW5zcG9ydHMucHVzaChuZXcgU2VudHJ5VHJhbnNwb3J0KG9wdGlvbnMuc2VudHJ5KSk7XG4gICAgfVxuXG4gICAgc3VwZXIob3B0KTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoKTogTG9nZ2VySW5zdGFuY2Uge1xuICAgIGlmICghdGhpcy5pbnN0YW5jZSkge1xuICAgICAgdGhpcy5pbnN0YW5jZSA9IG5ldyBTaW1wbGVMb2dnZXIoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcbiAgfVxufSJdfQ==