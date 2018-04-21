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
        if (name.Schema) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvZGF0YWJhc2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFDQUFxQztBQUNyQyxtQ0FBb0M7QUFjbEMsb0JBZE8saUJBQVMsQ0FjUDtBQUdXLGtCQWpCYixpQkFBUyxDQWlCVztBQWhCN0IsNkNBQXFDO0FBV25DLGdCQVhPLGtCQUFLLENBV1A7QUFWUCxrREFBMkM7QUFHM0MsaUNBQXFDO0FBRXBDLFFBQWdCLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFFM0MsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztBQUk3Qix3QkFBTTtBQU1SLG1CQUEyQixTQUFRLG1CQUFTO0NBRTNDO0FBRkQsc0NBRUM7QUFRRDtJQUlFLFlBQW1CLE9BQXdCO1FBQXhCLFlBQU8sR0FBUCxPQUFPLENBQWlCO1FBQ3pDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQywrQkFBK0IsRUFBRSxFQUFFLEdBQUcsRUFBRSxrQkFBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM5RCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksS0FBSyxDQUFzQixJQUFzQjtRQUN0RCxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQVEsQ0FBQztRQUMxQyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDaEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUN4RSxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBUSxDQUFDO1FBQ2pFLENBQUM7UUFFRCxvREFBb0Q7UUFDcEQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzRSxNQUFNLElBQUksYUFBYSxDQUFDLDhCQUE4QixDQUFDLDRCQUE0QjtZQUNqRixxR0FBcUcsQ0FBQyxDQUFDO0lBQzNHLENBQUM7SUFFRDs7OztPQUlHO0lBQ1UsT0FBTzs7WUFDbEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEVBQUUsR0FBRyxFQUFFLGtCQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDOUYsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDN0MsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLGNBQWMsRUFBRSxNQUFNLENBQUMsT0FBTzthQUMvQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDWCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsNENBQTRDLEVBQUUsRUFBRSxHQUFHLEVBQUUsa0JBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDMUcsQ0FBQztnQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDVSxVQUFVOztZQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNwQyxDQUFDO0tBQUE7SUFFRDs7OztPQUlHO0lBQ0ksT0FBTztRQUNaLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO0lBQy9DLENBQUM7SUFFRDs7O09BR0c7SUFDTyxPQUFPLENBQUMsS0FBSztRQUNyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNoQiw0RUFBNEU7WUFDNUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RSxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBcEZELDJCQW9GQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG1vbmdvb3NlIGZyb20gJ21vbmdvb3NlJztcbmltcG9ydCB7IEJhc2VNb2RlbCB9IGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IHsgTW9kZWwgfSBmcm9tICcuL2RlY29yYXRvcnMnO1xuaW1wb3J0IEJhc2VFcnJvciBmcm9tICcuLi9lcnJvci9CYXNlRXJyb3InO1xuaW1wb3J0IHsgTG9nZ2VySW5zdGFuY2UgfSBmcm9tICd3aW5zdG9uJztcbmltcG9ydCBTaW1wbGVMb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IG1hc2tBdXRoVXJsIH0gZnJvbSAnLi91dGlsJztcblxuKG1vbmdvb3NlIGFzIGFueSkuUHJvbWlzZSA9IGdsb2JhbC5Qcm9taXNlO1xuXG5jb25zdCBTY2hlbWEgPSBtb25nb29zZS5TY2hlbWE7XG5cbmV4cG9ydCB7XG4gIE1vZGVsLFxuICBTY2hlbWEsXG4gIEJhc2VNb2RlbCxcbn07XG5cbmV4cG9ydCB7IEJhc2VNb2RlbCBhcyBCYXNlREFPIH07XG5cbmV4cG9ydCBjbGFzcyBEYXRhYmFzZUVycm9yIGV4dGVuZHMgQmFzZUVycm9yIHtcblxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERhdGFiYXNlT3B0aW9ucyB7XG4gIHVybD86IHN0cmluZztcbiAgbG9nZ2VyPzogTG9nZ2VySW5zdGFuY2U7XG4gIG1vbmdvb3NlPzogbW9uZ29vc2UuTW9uZ29vc2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFiYXNlIHtcbiAgbG9nZ2VyOiBMb2dnZXJJbnN0YW5jZTtcbiAgbW9uZ29vc2U6IG1vbmdvb3NlLk1vbmdvb3NlO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBvcHRpb25zOiBEYXRhYmFzZU9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5sb2dnZXIpIHtcbiAgICAgIHRoaXMubG9nZ2VyID0gb3B0aW9ucy5sb2dnZXI7XG4gICAgICB0aGlzLmxvZ2dlci5pbmZvKGBJbml0aWFsaXppbmcgbW9uZ29kYiBkYXRhYmFzZWAsIHsgdXJsOiBtYXNrQXV0aFVybChvcHRpb25zLnVybCkgfSk7XG4gICAgfVxuICAgIHRoaXMubW9uZ29vc2UgPSBvcHRpb25zLm1vbmdvb3NlIHx8IG5ldyBtb25nb29zZS5Nb25nb29zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgb3IgcmVnaXN0ZXJzIGEgbW9vbmdvb3NlIG1vZGVsIGluc3RhbmNlIGJ5IGl0cyBuYW1lIG9yIGRlZmluaXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBtb2RlbCBuYW1lXG4gICAqXG4gICAqIEByZXR1cm5zIHthbnl9XG4gICAqL1xuICBwdWJsaWMgbW9kZWw8VCBleHRlbmRzIEJhc2VNb2RlbD4obmFtZTogc3RyaW5nIHwgVCB8IGFueSk6IEJhc2VNb2RlbCB7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHRoaXMubW9uZ29vc2UubW9kZWwobmFtZSkgYXMgYW55O1xuICAgIH0gXG4gICAgaWYgKG5hbWUuU2NoZW1hKSB7XG4gICAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuc2lsbHkoYFJlZ2lzdGVyaW5nIG1vZGVsIGluIGRhdGFiYXNlOiAke25hbWUubW9kZWxOYW1lfWApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMubW9uZ29vc2UubW9kZWwobmFtZS5tb2RlbE5hbWUsIG5hbWUuU2NoZW1hKSBhcyBhbnk7XG4gICAgfVxuXG4gICAgLy8gU2NoZW1hIGlzIG5vdCBkZWZpbmVkLCB0aGVyZSdzIG5vdGhpbmcgbGVmdCB0byBkb1xuICAgIGNvbnN0IG4gPSBuYW1lLm1vZGVsTmFtZSA/IG5hbWUubW9kZWxOYW1lIDogKG5hbWUubmFtZSA/IG5hbWUubmFtZSA6IG5hbWUpO1xuICAgIHRocm93IG5ldyBEYXRhYmFzZUVycm9yKGBDYW5ub3QgcmVnaXN0ZXIgdGhlIG1vZGVsIFwiJHtufVwiOiBTY2hlbWEgaXMgbm90IGRlZmluZWQuIGAgK1xuICAgICAgYE1ha2Ugc3VyZSB5b3UgaGF2ZSBkZWNvcmF0ZWQgdGhlIGNsYXNzIHdpdGggQE1vZGVsKG5hbWUsIHNjaGVtYSkgb3Igc2V0IHRoZSBzdGF0aWMgU2NoZW1hIHByb3BlcnR5LmApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbm5lY3RzIHRvIHRoZSByZW1vdGUgZGF0YWJhc2UuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKTogUHJvbWlzZTxEYXRhYmFzZU9wdGlvbnM+IHtcbiAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgIHRoaXMubG9nZ2VyLnNpbGx5KGBDb25uZWN0aW5nIHRvIG1vbmdvZGIgZGF0YWJhc2VgLCB7IHVybDogbWFza0F1dGhVcmwodGhpcy5vcHRpb25zLnVybCkgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1vbmdvb3NlLmNvbm5lY3QodGhpcy5vcHRpb25zLnVybCwge1xuICAgICAgdXNlTW9uZ29DbGllbnQ6IHRydWUsXG4gICAgICBwcm9taXNlTGlicmFyeTogZ2xvYmFsLlByb21pc2UsXG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy5sb2dnZXIpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuc2lsbHkoYFN1Y2Nlc3NmdWxseSBjb25uZWN0ZWQgdG8gbW9uZ29kYiBkYXRhYmFzZWAsIHsgdXJsOiBtYXNrQXV0aFVybCh0aGlzLm9wdGlvbnMudXJsKSB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgdGhlIGRhdGFiYXNlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIHB1YmxpYyBhc3luYyBkaXNjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLm1vbmdvb3NlLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGRhdGFiYXNlIGlzIGNvbm5lY3RlZCBhbmQgcmVhZHkgZm9yIHRyYW5zYWN0aW9ucy5cbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBwdWJsaWMgaXNSZWFkeSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLm1vbmdvb3NlLmNvbm5lY3Rpb24ucmVhZHlTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGRhdGFiYXNlIGVycm9ycywgY2FuIGJlIGV4dGVuZGVkIHRvIGluY2x1ZGUgcHJvY2VzcyBncmFjZWZ1bCBzaHV0ZG93bi5cbiAgICogQHBhcmFtIGVycm9yXG4gICAqL1xuICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgIGlmICh0aGlzLmxvZ2dlcikge1xuICAgICAgLy8gTGV0IGl0IGJlIGV4dGVuZGVkIGJ5IG91dHNpZGUgY2xhc3NlcywgYnkgZGVmYXVsdCBqdXN0IGxvZyB0byB0aGUgY29uc29sZVxuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoYFVuaGFuZGxlZCBkYXRhYmFzZSBlcnJvcjogJHtlcnJvci5tZXNzYWdlfWAsIGVycm9yKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==