"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function legacyParams(req, res, next) {
    /**
     * Return the value of param `name` when present or `defaultValue`.
     *
     *  - Checks route placeholders, ex: _/user/:id_
     *  - Checks body params, ex: id=12, {"id":12}
     *  - Checks query string params, ex: ?id=12
     *
     * To utilize request bodies, `req.body`
     * should be an object. This can be done by using
     * the `bodyParser()` middleware.
     *
     * @param {String} name
     * @param {*} [defaultValue]
     *
     * @return {*}
     */
    req.param = function param(name, defaultValue) {
        const params = this.params || {};
        const body = this.body || {};
        const query = this.query || {};
        let value = defaultValue;
        // eslint-disable-next-line no-prototype-builtins
        if (params[name] != null && params.hasOwnProperty(name)) {
            value = params[name];
        }
        if (body[name] != null) {
            value = body[name];
        }
        if (query[name] != null) {
            value = query[name];
        }
        return value;
    };
    next();
}
exports.default = legacyParams;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVnYWN5UGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3NlcnZlci9taWRkbGV3YXJlcy9sZWdhY3lQYXJhbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQkFBcUMsR0FBb0IsRUFBRSxHQUFxQixFQUFFLElBQWM7SUFDOUY7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBQ0YsR0FBVyxDQUFDLEtBQUssR0FBRyxlQUFlLElBQVksRUFBRSxZQUFpQjtRQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztRQUNqQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUUvQixJQUFJLEtBQUssR0FBRyxZQUFZLENBQUM7UUFFekIsaURBQWlEO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEQsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdkIsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDeEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QixDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNmLENBQUMsQ0FBQztJQUVGLElBQUksRUFBRSxDQUFDO0FBQ1QsQ0FBQztBQXpDRCwrQkF5Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsZWdhY3lQYXJhbXMocmVxOiBFeHByZXNzLlJlcXVlc3QsIHJlczogRXhwcmVzcy5SZXNwb25zZSwgbmV4dDogRnVuY3Rpb24pIHtcbiAgLyoqXG4gICAqIFJldHVybiB0aGUgdmFsdWUgb2YgcGFyYW0gYG5hbWVgIHdoZW4gcHJlc2VudCBvciBgZGVmYXVsdFZhbHVlYC5cbiAgICpcbiAgICogIC0gQ2hlY2tzIHJvdXRlIHBsYWNlaG9sZGVycywgZXg6IF8vdXNlci86aWRfXG4gICAqICAtIENoZWNrcyBib2R5IHBhcmFtcywgZXg6IGlkPTEyLCB7XCJpZFwiOjEyfVxuICAgKiAgLSBDaGVja3MgcXVlcnkgc3RyaW5nIHBhcmFtcywgZXg6ID9pZD0xMlxuICAgKlxuICAgKiBUbyB1dGlsaXplIHJlcXVlc3QgYm9kaWVzLCBgcmVxLmJvZHlgXG4gICAqIHNob3VsZCBiZSBhbiBvYmplY3QuIFRoaXMgY2FuIGJlIGRvbmUgYnkgdXNpbmdcbiAgICogdGhlIGBib2R5UGFyc2VyKClgIG1pZGRsZXdhcmUuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7Kn0gW2RlZmF1bHRWYWx1ZV1cbiAgICpcbiAgICogQHJldHVybiB7Kn1cbiAgICovXG4gIChyZXEgYXMgYW55KS5wYXJhbSA9IGZ1bmN0aW9uIHBhcmFtKG5hbWU6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBhbnkpIHtcbiAgICBjb25zdCBwYXJhbXMgPSB0aGlzLnBhcmFtcyB8fCB7fTtcbiAgICBjb25zdCBib2R5ID0gdGhpcy5ib2R5IHx8IHt9O1xuICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5xdWVyeSB8fCB7fTtcblxuICAgIGxldCB2YWx1ZSA9IGRlZmF1bHRWYWx1ZTtcblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgICBpZiAocGFyYW1zW25hbWVdICE9IG51bGwgJiYgcGFyYW1zLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICB2YWx1ZSA9IHBhcmFtc1tuYW1lXTtcbiAgICB9XG5cbiAgICBpZiAoYm9keVtuYW1lXSAhPSBudWxsKSB7XG4gICAgICB2YWx1ZSA9IGJvZHlbbmFtZV07XG4gICAgfVxuXG4gICAgaWYgKHF1ZXJ5W25hbWVdICE9IG51bGwpIHtcbiAgICAgIHZhbHVlID0gcXVlcnlbbmFtZV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIG5leHQoKTtcbn1cbiJdfQ==