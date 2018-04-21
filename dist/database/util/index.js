"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const URI = require("urijs");
/**
 * Utility function to mask authentication from URLs.
 *
 * @param url The url to be masked
 *
 * @returns {string}
 */
function maskAuthUrl(url) {
    const uri = new URI(url);
    if (uri.password()) {
        uri.password(uri.password().split('').map(() => 'x').join(''));
    }
    return uri.toString();
}
exports.maskAuthUrl = maskAuthUrl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvZGF0YWJhc2UvdXRpbC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUE2QjtBQUU3Qjs7Ozs7O0dBTUc7QUFDSCxxQkFBNEIsR0FBRztJQUM3QixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25CLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDeEIsQ0FBQztBQU5ELGtDQU1DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgVVJJIGZyb20gJ3VyaWpzJztcblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIG1hc2sgYXV0aGVudGljYXRpb24gZnJvbSBVUkxzLlxuICpcbiAqIEBwYXJhbSB1cmwgVGhlIHVybCB0byBiZSBtYXNrZWRcbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFza0F1dGhVcmwodXJsKTogc3RyaW5nIHtcbiAgY29uc3QgdXJpID0gbmV3IFVSSSh1cmwpO1xuICBpZiAodXJpLnBhc3N3b3JkKCkpIHtcbiAgICB1cmkucGFzc3dvcmQodXJpLnBhc3N3b3JkKCkuc3BsaXQoJycpLm1hcCgoKSA9PiAneCcpLmpvaW4oJycpKTtcbiAgfVxuICByZXR1cm4gdXJpLnRvU3RyaW5nKCk7XG59XG4iXX0=