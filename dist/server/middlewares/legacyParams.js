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
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVnYWN5UGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3NlcnZlci9taWRkbGV3YXJlcy9sZWdhY3lQYXJhbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQkFBcUMsR0FBb0IsRUFBRSxHQUFxQixFQUFFLElBQWM7SUFDOUY7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBQ0YsR0FBVyxDQUFDLEtBQUssR0FBRyxlQUFlLElBQVksRUFBRSxZQUFpQjtRQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztRQUNqQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUUvQixJQUFJLEtBQUssR0FBRyxZQUFZLENBQUM7UUFFekIsaURBQWlEO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEQsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdkIsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDeEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QixDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNmLENBQUMsQ0FBQztJQUVGLElBQUksRUFBRSxDQUFDO0FBQ1QsQ0FBQztBQXpDRCwrQkF5Q0M7QUFBQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbGVnYWN5UGFyYW1zKHJlcTogRXhwcmVzcy5SZXF1ZXN0LCByZXM6IEV4cHJlc3MuUmVzcG9uc2UsIG5leHQ6IEZ1bmN0aW9uKSB7XG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHZhbHVlIG9mIHBhcmFtIGBuYW1lYCB3aGVuIHByZXNlbnQgb3IgYGRlZmF1bHRWYWx1ZWAuXG4gICAqXG4gICAqICAtIENoZWNrcyByb3V0ZSBwbGFjZWhvbGRlcnMsIGV4OiBfL3VzZXIvOmlkX1xuICAgKiAgLSBDaGVja3MgYm9keSBwYXJhbXMsIGV4OiBpZD0xMiwge1wiaWRcIjoxMn1cbiAgICogIC0gQ2hlY2tzIHF1ZXJ5IHN0cmluZyBwYXJhbXMsIGV4OiA/aWQ9MTJcbiAgICpcbiAgICogVG8gdXRpbGl6ZSByZXF1ZXN0IGJvZGllcywgYHJlcS5ib2R5YFxuICAgKiBzaG91bGQgYmUgYW4gb2JqZWN0LiBUaGlzIGNhbiBiZSBkb25lIGJ5IHVzaW5nXG4gICAqIHRoZSBgYm9keVBhcnNlcigpYCBtaWRkbGV3YXJlLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0geyp9IFtkZWZhdWx0VmFsdWVdXG4gICAqXG4gICAqIEByZXR1cm4geyp9XG4gICAqL1xuICAocmVxIGFzIGFueSkucGFyYW0gPSBmdW5jdGlvbiBwYXJhbShuYW1lOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogYW55KSB7XG4gICAgY29uc3QgcGFyYW1zID0gdGhpcy5wYXJhbXMgfHwge307XG4gICAgY29uc3QgYm9keSA9IHRoaXMuYm9keSB8fCB7fTtcbiAgICBjb25zdCBxdWVyeSA9IHRoaXMucXVlcnkgfHwge307XG5cbiAgICBsZXQgdmFsdWUgPSBkZWZhdWx0VmFsdWU7XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gICAgaWYgKHBhcmFtc1tuYW1lXSAhPSBudWxsICYmIHBhcmFtcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgdmFsdWUgPSBwYXJhbXNbbmFtZV07XG4gICAgfVxuXG4gICAgaWYgKGJvZHlbbmFtZV0gIT0gbnVsbCkge1xuICAgICAgdmFsdWUgPSBib2R5W25hbWVdO1xuICAgIH1cblxuICAgIGlmIChxdWVyeVtuYW1lXSAhPSBudWxsKSB7XG4gICAgICB2YWx1ZSA9IHF1ZXJ5W25hbWVdO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICBuZXh0KCk7XG59OyJdfQ==