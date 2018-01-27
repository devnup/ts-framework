"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugins_1 = require("./plugins");
exports.Plugins = plugins_1.default;
const mongoose = require("mongoose");
const model_1 = require("./model");
exports.BaseModel = model_1.BaseModel;
exports.BaseDAO = model_1.BaseModel;
const decorators_1 = require("./decorators");
exports.Model = decorators_1.Model;
const BaseError_1 = require("../error/BaseError");
const util_1 = require("./util");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
exports.Schema = Schema;
class DatabaseError extends BaseError_1.default {
}
exports.DatabaseError = DatabaseError;
class Database {
    constructor(options) {
        this.options = options;
        if (options.logger) {
            this.logger = options.logger;
            this.logger.info(`Initializing mongodb database`, { url: util_1.maskAuthUrl(options.url) });
        }
        this.mongoose = options.mongoose || new mongoose.Mongoose();
    }
    /**
     * Gets or registers a moongoose model instance by its name or definition.
     *
     * @param {string} name The model name
     *
     * @returns {any}
     */
    model(name) {
        if (typeof name === 'string') {
            return this.mongoose.model(name);
        }
        else if (name.Schema) {
            if (this.logger) {
                this.logger.silly(`Registering model in database: ${name.modelName}`);
            }
            return this.mongoose.model(name.modelName, name.Schema);
        }
        // Schema is not defined, there's nothing left to do
        const n = name.modelName ? name.modelName : (name.name ? name.name : name);
        throw new DatabaseError(`Cannot register the model "${n}": Schema is not defined. ` +
            `Make sure you have decorated the class with @Model(name, schema) or set the static Schema property.`);
    }
    /**
     * Connects to the remote database.
     *
     * @returns {Promise<void>}
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.logger) {
                this.logger.silly(`Connecting to mongodb database`, { url: util_1.maskAuthUrl(this.options.url) });
            }
            return this.mongoose.connect(this.options.url, {
                useMongoClient: true,
                promiseLibrary: global.Promise,
            }).then(() => {
                if (this.logger) {
                    this.logger.silly(`Successfully connected to mongodb database`, { url: util_1.maskAuthUrl(this.options.url) });
                }
                return this.options;
            });
        });
    }
    /**
     * Disconnects the database.
     *
     * @returns {Promise<void>}
     */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.mongoose.disconnect();
        });
    }
    /**
     * Checks if the database is connected and ready for transactions.
     *
     * @returns {boolean}
     */
    isReady() {
        return !!this.mongoose.connection.readyState;
    }
    /**
     * Handles database errors, can be extended to include process graceful shutdown.
     * @param error
     */
    onError(error) {
        if (this.logger) {
            // Let it be extended by outside classes, by default just log to the console
            this.logger.error(`Unhandled database error: ${error.message}`, error);
        }
    }
}
exports.default = Database;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvZGF0YWJhc2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHVDQUFnQztBQWdCOUIsa0JBaEJLLGlCQUFPLENBZ0JMO0FBZlQscUNBQXFDO0FBQ3JDLG1DQUFvQztBQWVsQyxvQkFmTyxpQkFBUyxDQWVQO0FBR1csa0JBbEJiLGlCQUFTLENBa0JXO0FBakI3Qiw2Q0FBcUM7QUFXbkMsZ0JBWE8sa0JBQUssQ0FXUDtBQVZQLGtEQUEyQztBQUczQyxpQ0FBcUM7QUFFcEMsUUFBZ0IsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUUzQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBSTdCLHdCQUFNO0FBT1IsbUJBQTJCLFNBQVEsbUJBQVM7Q0FFM0M7QUFGRCxzQ0FFQztBQVFEO0lBSUUsWUFBbUIsT0FBd0I7UUFBeEIsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFDekMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLCtCQUErQixFQUFFLEVBQUUsR0FBRyxFQUFFLGtCQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2RixDQUFDO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzlELENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQXNCLElBQXNCO1FBQ3RELEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBUSxDQUFDO1FBQzFDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUN4RSxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBUSxDQUFDO1FBQ2pFLENBQUM7UUFFRCxvREFBb0Q7UUFDcEQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzRSxNQUFNLElBQUksYUFBYSxDQUFDLDhCQUE4QixDQUFDLDRCQUE0QjtZQUNqRixxR0FBcUcsQ0FBQyxDQUFDO0lBQzNHLENBQUM7SUFFRDs7OztPQUlHO0lBQ1UsT0FBTzs7WUFDbEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEVBQUUsR0FBRyxFQUFFLGtCQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDOUYsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDN0MsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLGNBQWMsRUFBRSxNQUFNLENBQUMsT0FBTzthQUMvQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDWCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsNENBQTRDLEVBQUUsRUFBRSxHQUFHLEVBQUUsa0JBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDMUcsQ0FBQztnQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDVSxVQUFVOztZQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNwQyxDQUFDO0tBQUE7SUFFRDs7OztPQUlHO0lBQ0ksT0FBTztRQUNaLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO0lBQy9DLENBQUM7SUFFRDs7O09BR0c7SUFDTyxPQUFPLENBQUMsS0FBSztRQUNyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNoQiw0RUFBNEU7WUFDNUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RSxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBbkZELDJCQW1GQztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUGx1Z2lucyBmcm9tICcuL3BsdWdpbnMnO1xuaW1wb3J0ICogYXMgbW9uZ29vc2UgZnJvbSAnbW9uZ29vc2UnO1xuaW1wb3J0IHsgQmFzZU1vZGVsIH0gZnJvbSBcIi4vbW9kZWxcIjtcbmltcG9ydCB7IE1vZGVsIH0gZnJvbSAnLi9kZWNvcmF0b3JzJztcbmltcG9ydCBCYXNlRXJyb3IgZnJvbSBcIi4uL2Vycm9yL0Jhc2VFcnJvclwiO1xuaW1wb3J0IHsgTG9nZ2VySW5zdGFuY2UgfSBmcm9tIFwid2luc3RvblwiO1xuaW1wb3J0IFNpbXBsZUxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgbWFza0F1dGhVcmwgfSBmcm9tIFwiLi91dGlsXCI7XG5cbihtb25nb29zZSBhcyBhbnkpLlByb21pc2UgPSBnbG9iYWwuUHJvbWlzZTtcblxuY29uc3QgU2NoZW1hID0gbW9uZ29vc2UuU2NoZW1hO1xuXG5leHBvcnQge1xuICBNb2RlbCxcbiAgU2NoZW1hLFxuICBQbHVnaW5zLFxuICBCYXNlTW9kZWxcbn1cblxuZXhwb3J0IHsgQmFzZU1vZGVsIGFzIEJhc2VEQU8gfTtcblxuZXhwb3J0IGNsYXNzIERhdGFiYXNlRXJyb3IgZXh0ZW5kcyBCYXNlRXJyb3Ige1xuXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF0YWJhc2VPcHRpb25zIHtcbiAgdXJsPzogc3RyaW5nO1xuICBsb2dnZXI/OiBMb2dnZXJJbnN0YW5jZTtcbiAgbW9uZ29vc2U/OiBtb25nb29zZS5Nb25nb29zZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0YWJhc2Uge1xuICBsb2dnZXI6IExvZ2dlckluc3RhbmNlO1xuICBtb25nb29zZTogbW9uZ29vc2UuTW9uZ29vc2U7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG9wdGlvbnM6IERhdGFiYXNlT3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmxvZ2dlcikge1xuICAgICAgdGhpcy5sb2dnZXIgPSBvcHRpb25zLmxvZ2dlcjtcbiAgICAgIHRoaXMubG9nZ2VyLmluZm8oYEluaXRpYWxpemluZyBtb25nb2RiIGRhdGFiYXNlYCwgeyB1cmw6IG1hc2tBdXRoVXJsKG9wdGlvbnMudXJsKSB9KTtcbiAgICB9XG4gICAgdGhpcy5tb25nb29zZSA9IG9wdGlvbnMubW9uZ29vc2UgfHwgbmV3IG1vbmdvb3NlLk1vbmdvb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBvciByZWdpc3RlcnMgYSBtb29uZ29vc2UgbW9kZWwgaW5zdGFuY2UgYnkgaXRzIG5hbWUgb3IgZGVmaW5pdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG1vZGVsIG5hbWVcbiAgICpcbiAgICogQHJldHVybnMge2FueX1cbiAgICovXG4gIHB1YmxpYyBtb2RlbDxUIGV4dGVuZHMgQmFzZU1vZGVsPihuYW1lOiBzdHJpbmcgfCBUIHwgYW55KTogQmFzZU1vZGVsIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5tb25nb29zZS5tb2RlbChuYW1lKSBhcyBhbnk7XG4gICAgfSBlbHNlIGlmIChuYW1lLlNjaGVtYSkge1xuICAgICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLnNpbGx5KGBSZWdpc3RlcmluZyBtb2RlbCBpbiBkYXRhYmFzZTogJHtuYW1lLm1vZGVsTmFtZX1gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm1vbmdvb3NlLm1vZGVsKG5hbWUubW9kZWxOYW1lLCBuYW1lLlNjaGVtYSkgYXMgYW55O1xuICAgIH1cblxuICAgIC8vIFNjaGVtYSBpcyBub3QgZGVmaW5lZCwgdGhlcmUncyBub3RoaW5nIGxlZnQgdG8gZG9cbiAgICBjb25zdCBuID0gbmFtZS5tb2RlbE5hbWUgPyBuYW1lLm1vZGVsTmFtZSA6IChuYW1lLm5hbWUgPyBuYW1lLm5hbWUgOiBuYW1lKTtcbiAgICB0aHJvdyBuZXcgRGF0YWJhc2VFcnJvcihgQ2Fubm90IHJlZ2lzdGVyIHRoZSBtb2RlbCBcIiR7bn1cIjogU2NoZW1hIGlzIG5vdCBkZWZpbmVkLiBgICtcbiAgICAgIGBNYWtlIHN1cmUgeW91IGhhdmUgZGVjb3JhdGVkIHRoZSBjbGFzcyB3aXRoIEBNb2RlbChuYW1lLCBzY2hlbWEpIG9yIHNldCB0aGUgc3RhdGljIFNjaGVtYSBwcm9wZXJ0eS5gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25uZWN0cyB0byB0aGUgcmVtb3RlIGRhdGFiYXNlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIHB1YmxpYyBhc3luYyBjb25uZWN0KCk6IFByb21pc2U8RGF0YWJhc2VPcHRpb25zPiB7XG4gICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICB0aGlzLmxvZ2dlci5zaWxseShgQ29ubmVjdGluZyB0byBtb25nb2RiIGRhdGFiYXNlYCwgeyB1cmw6IG1hc2tBdXRoVXJsKHRoaXMub3B0aW9ucy51cmwpIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5tb25nb29zZS5jb25uZWN0KHRoaXMub3B0aW9ucy51cmwsIHtcbiAgICAgIHVzZU1vbmdvQ2xpZW50OiB0cnVlLFxuICAgICAgcHJvbWlzZUxpYnJhcnk6IGdsb2JhbC5Qcm9taXNlLFxuICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHRoaXMubG9nZ2VyKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLnNpbGx5KGBTdWNjZXNzZnVsbHkgY29ubmVjdGVkIHRvIG1vbmdvZGIgZGF0YWJhc2VgLCB7IHVybDogbWFza0F1dGhVcmwodGhpcy5vcHRpb25zLnVybCkgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3RzIHRoZSBkYXRhYmFzZS5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZGlzY29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5tb25nb29zZS5kaXNjb25uZWN0KCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBkYXRhYmFzZSBpcyBjb25uZWN0ZWQgYW5kIHJlYWR5IGZvciB0cmFuc2FjdGlvbnMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgcHVibGljIGlzUmVhZHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5tb25nb29zZS5jb25uZWN0aW9uLnJlYWR5U3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBkYXRhYmFzZSBlcnJvcnMsIGNhbiBiZSBleHRlbmRlZCB0byBpbmNsdWRlIHByb2Nlc3MgZ3JhY2VmdWwgc2h1dGRvd24uXG4gICAqIEBwYXJhbSBlcnJvclxuICAgKi9cbiAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgIC8vIExldCBpdCBiZSBleHRlbmRlZCBieSBvdXRzaWRlIGNsYXNzZXMsIGJ5IGRlZmF1bHQganVzdCBsb2cgdG8gdGhlIGNvbnNvbGVcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKGBVbmhhbmRsZWQgZGF0YWJhc2UgZXJyb3I6ICR7ZXJyb3IubWVzc2FnZX1gLCBlcnJvcik7XG4gICAgfVxuICB9XG59O1xuIl19