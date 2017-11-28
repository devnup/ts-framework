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
                    // Fix for moth modules systems (import / require)
                    f = f.default || f;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3NlcnZlci9oZWxwZXJzL2ZpbHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFDN0IsMENBQTBDO0FBRTFDLDBDQUEwQztBQUMxQyxNQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQztBQUMzQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBRTVEO0lBSUUsWUFBWSxPQUFjLEVBQUUsUUFBaUI7UUFDM0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLElBQUksaUJBQWlCLENBQUM7SUFDaEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBc0IsRUFBRSxRQUFRO1FBQzNDLE1BQU0sQ0FBQyxJQUFJLGNBQWMsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDckUsQ0FBQztJQUVELGNBQWM7UUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFlLEVBQUUsRUFBRTtZQUMxQyxJQUFJLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDO2dCQUNuQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLCtCQUErQjtvQkFDL0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ2hELGtEQUFrRDtvQkFDbEQsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDO2dCQUNyQixDQUFDO2dCQUNELE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWCxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCwrQkFBK0I7Z0JBQy9CLENBQUMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVDLG1EQUFtRDtvQkFDbkQsQ0FBQyxDQUFDLE9BQU8sR0FBRyxxQkFBcUIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQztvQkFDdEUsTUFBTSxDQUFDLENBQUM7Z0JBQ1YsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixnQkFBZ0I7b0JBQ2hCLE1BQU0sQ0FBQyxDQUFDO2dCQUNWLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBRUY7QUF2Q0QsaUNBdUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgKiBhcyBjbGVhblN0YWNrIGZyb20gJ2NsZWFuLXN0YWNrJztcblxuLy8gVE9ETzogSW5qZWN0IHRoaXMgY29uc3RhbnQgZnJvbSBvdXRzaWRlXG5jb25zdCBmaWx0ZXJfcGF0aCA9ICcuLi8uLi8uLi9hcGkvZmlsdGVycyc7XG5jb25zdCBCQVNFX0ZJTFRFUlNfUEFUSCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIGZpbHRlcl9wYXRoKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmlsdGVyc1dyYXBwZXIge1xuICBmaWx0ZXJzOiBhbnk7XG4gIGJhc2VQYXRoOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoZmlsdGVyczogYW55W10sIGJhc2VQYXRoPzogc3RyaW5nKSB7XG4gICAgdGhpcy5maWx0ZXJzID0gZmlsdGVycztcbiAgICB0aGlzLmJhc2VQYXRoID0gYmFzZVBhdGggfHwgQkFTRV9GSUxURVJTX1BBVEg7XG4gIH1cblxuICBzdGF0aWMgYXBwbHkoZmlsdGVyc05hbWVzOiBzdHJpbmdbXSwgYmFzZVBhdGgpIHtcbiAgICByZXR1cm4gbmV3IEZpbHRlcnNXcmFwcGVyKGZpbHRlcnNOYW1lcywgYmFzZVBhdGgpLnJlcXVpcmVGaWx0ZXJzKCk7XG4gIH1cblxuICByZXF1aXJlRmlsdGVycygpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJzLm1hcCgoZmlsdGVyTmFtZTogYW55KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBsZXQgZiA9IGZpbHRlck5hbWU7XG4gICAgICAgIGlmIChmICYmIHV0aWwuaXNTdHJpbmcoZikpIHtcbiAgICAgICAgICAvLyBUcnkgdG8gbG9hZCBmaWx0ZXIgZnJvbSBmaWxlXG4gICAgICAgICAgZiA9IHJlcXVpcmUocGF0aC5qb2luKHRoaXMuYmFzZVBhdGgsIGAuLyR7Zn1gKSk7XG4gICAgICAgICAgLy8gRml4IGZvciBtb3RoIG1vZHVsZXMgc3lzdGVtcyAoaW1wb3J0IC8gcmVxdWlyZSlcbiAgICAgICAgICBmID0gZi5kZWZhdWx0IHx8IGY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGY7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIFRPRE86IENvbnN0cnVjdCBhIGJhc2UgZXJyb3JcbiAgICAgICAgZS5zdGFjayA9IGNsZWFuU3RhY2soZS5zdGFjayk7XG4gICAgICAgIGlmIChlLm1lc3NhZ2UubWF0Y2gobmV3IFJlZ0V4cChmaWx0ZXJOYW1lKSkpIHtcbiAgICAgICAgICAvLyBUaHJvdyBhIGRpcmVjdCBtZXNzYWdlIHdoZW4gZmlsdGVyIHdhcyBub3QgZm91bmRcbiAgICAgICAgICBlLm1lc3NhZ2UgPSBgRmlsdGVyIG5vdCBmb3VuZDogJHtwYXRoLmpvaW4oZmlsdGVyX3BhdGgsIGZpbHRlck5hbWUpfWA7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBVbmtub3duIGVycm9yXG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbn1cbiJdfQ==