import * as path from 'path';
import * as util from 'util';
import * as cleanStack from 'clean-stack';

// TODO: Inject this constant from outside
const filter_path = '../../../api/filters';
const BASE_FILTERS_PATH = path.join(__dirname, filter_path);

export default class FiltersWrapper {
  filters: any;
  basePath: string;

  constructor(filters: any[], basePath?: string) {
    this.filters = filters;
    this.basePath = basePath || BASE_FILTERS_PATH;
  }

  static apply(filtersNames: string[], basePath) {
    return new FiltersWrapper(filtersNames, basePath).requireFilters();
  }

  requireFilters() {
    return this.filters.map((filterName: any) => {
      try {
        let f = filterName;
        if (f && util.isString(f)) {
          // Try to load filter from file
          f = require(path.join(this.basePath, `./${f}`));
          // Fix for moth modules systems (import / require)
          f = f.default || f;
        }
        return f;
      } catch (e) {
        // TODO: Construct a base error
        e.stack = cleanStack(e.stack);
        if (e.message.match(new RegExp(filterName))) {
          // Throw a direct message when filter was not found
          e.message = `Filter not found: ${path.join(filter_path, filterName)}`;
          throw e;
        } else {
          // Unknown error
          throw e;
        }
      }
    });
  }

}
