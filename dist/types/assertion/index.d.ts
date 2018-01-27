export interface IAssertionHelper {
    (fn: (req, res) => void): void;
    toBoolean(fn: Function): any;
}
declare const _default: IAssertionHelper;
export default _default;
