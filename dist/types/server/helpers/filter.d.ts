export default class FiltersWrapper {
    filters: any;
    basePath: string;
    constructor(filters: any[], basePath?: string);
    static apply(filtersNames: string[], basePath: any): any;
    requireFilters(): any;
}
