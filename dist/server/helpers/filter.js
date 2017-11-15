"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const util = require("util");
const cleanStack = require("clean-stack");
// TODO: Inject this constant from outside
const filter_path = '../../../api/filters';
const BASE_FILTERS_PATH = path.join(__dirname, filter_path);
class FiltersWrapper {
    constructor(filters, basePath) {
        this.filters = filters;
        this.basePath = basePath || BASE_FILTERS_PATH;
    }
    static apply(filtersNames, basePath) {
        return new FiltersWrapper(filtersNames, basePath).requireFilters();
    }
    requireFilters() {
        return this.filters.map((filterName) => {
            try {
                let f = filterName;
                if (f && util.isString(f)) {
                    // Try to load filter from file
                    f = require(path.join(this.basePath, `./${f}`));
                }
                return f;
            }
            catch (e) {
                // TODO: Construct a base error
                e.stack = cleanStack(e.stack);
                if (e.message.match(new RegExp(filterName))) {
                    // Throw a direct message when filter was not found
                    e.message = `Filter not found: ${path.join(filter_path, filterName)}`;
                    throw e;
                }
                else {
                    // Unknown error
                    throw e;
                }
            }
        });
    }
}
exports.default = FiltersWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3NlcnZlci9oZWxwZXJzL2ZpbHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFDN0IsMENBQTBDO0FBRTFDLDBDQUEwQztBQUMxQyxNQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQztBQUMzQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBRTVEO0lBSUUsWUFBWSxPQUFjLEVBQUUsUUFBaUI7UUFDM0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLElBQUksaUJBQWlCLENBQUM7SUFDaEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBc0IsRUFBRSxRQUFRO1FBQzNDLE1BQU0sQ0FBQyxJQUFJLGNBQWMsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDckUsQ0FBQztJQUVELGNBQWM7UUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFlLEVBQUUsRUFBRTtZQUMxQyxJQUFJLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDO2dCQUNuQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLCtCQUErQjtvQkFDL0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xELENBQUM7Z0JBQ0QsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNYLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLCtCQUErQjtnQkFDL0IsQ0FBQyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUMsbURBQW1EO29CQUNuRCxDQUFDLENBQUMsT0FBTyxHQUFHLHFCQUFxQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDO29CQUN0RSxNQUFNLENBQUMsQ0FBQztnQkFDVixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLGdCQUFnQjtvQkFDaEIsTUFBTSxDQUFDLENBQUM7Z0JBQ1YsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FFRjtBQXJDRCxpQ0FxQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCAqIGFzIGNsZWFuU3RhY2sgZnJvbSAnY2xlYW4tc3RhY2snO1xuXG4vLyBUT0RPOiBJbmplY3QgdGhpcyBjb25zdGFudCBmcm9tIG91dHNpZGVcbmNvbnN0IGZpbHRlcl9wYXRoID0gJy4uLy4uLy4uL2FwaS9maWx0ZXJzJztcbmNvbnN0IEJBU0VfRklMVEVSU19QQVRIID0gcGF0aC5qb2luKF9fZGlybmFtZSwgZmlsdGVyX3BhdGgpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaWx0ZXJzV3JhcHBlciB7XG4gIGZpbHRlcnM6IGFueTtcbiAgYmFzZVBhdGg6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihmaWx0ZXJzOiBhbnlbXSwgYmFzZVBhdGg/OiBzdHJpbmcpIHtcbiAgICB0aGlzLmZpbHRlcnMgPSBmaWx0ZXJzO1xuICAgIHRoaXMuYmFzZVBhdGggPSBiYXNlUGF0aCB8fCBCQVNFX0ZJTFRFUlNfUEFUSDtcbiAgfVxuXG4gIHN0YXRpYyBhcHBseShmaWx0ZXJzTmFtZXM6IHN0cmluZ1tdLCBiYXNlUGF0aCkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyc1dyYXBwZXIoZmlsdGVyc05hbWVzLCBiYXNlUGF0aCkucmVxdWlyZUZpbHRlcnMoKTtcbiAgfVxuXG4gIHJlcXVpcmVGaWx0ZXJzKCkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlcnMubWFwKChmaWx0ZXJOYW1lOiBhbnkpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBmID0gZmlsdGVyTmFtZTtcbiAgICAgICAgaWYgKGYgJiYgdXRpbC5pc1N0cmluZyhmKSkge1xuICAgICAgICAgIC8vIFRyeSB0byBsb2FkIGZpbHRlciBmcm9tIGZpbGVcbiAgICAgICAgICBmID0gcmVxdWlyZShwYXRoLmpvaW4odGhpcy5iYXNlUGF0aCwgYC4vJHtmfWApKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZjtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gVE9ETzogQ29uc3RydWN0IGEgYmFzZSBlcnJvclxuICAgICAgICBlLnN0YWNrID0gY2xlYW5TdGFjayhlLnN0YWNrKTtcbiAgICAgICAgaWYgKGUubWVzc2FnZS5tYXRjaChuZXcgUmVnRXhwKGZpbHRlck5hbWUpKSkge1xuICAgICAgICAgIC8vIFRocm93IGEgZGlyZWN0IG1lc3NhZ2Ugd2hlbiBmaWx0ZXIgd2FzIG5vdCBmb3VuZFxuICAgICAgICAgIGUubWVzc2FnZSA9IGBGaWx0ZXIgbm90IGZvdW5kOiAke3BhdGguam9pbihmaWx0ZXJfcGF0aCwgZmlsdGVyTmFtZSl9YDtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFVua25vd24gZXJyb3JcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxufVxuIl19