export declare enum HttpSuccess {
    OK = 200,
}
export declare enum HttpRedirect {
    MOVED_PERMANENTLY = 301,
    TEMPORARY_REDIRECT = 302,
    NOT_MODIFIED = 403,
}
export declare enum HttpClientErrors {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    PRECONDITION_FAILED = 412,
    UNSUPPORTED_MEDIA_TYPE = 415,
    TOO_MANY_REQUESTS = 429,
}
export declare enum HttpServerErrors {
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
}
export declare type HttpCode = HttpSuccess | HttpRedirect | HttpClientErrors | HttpServerErrors;
declare const _default: {
    Success: typeof HttpSuccess;
    Redirect: typeof HttpRedirect;
    Client: typeof HttpClientErrors;
    Server: typeof HttpServerErrors;
};
export default _default;
