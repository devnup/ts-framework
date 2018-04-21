export enum HttpSuccess {
  OK = 200,
}

export enum HttpRedirect {
  MOVED_PERMANENTLY = 301,
  TEMPORARY_REDIRECT = 302,
  NOT_MODIFIED = 403,
}

export enum HttpClientErrors {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  PRECONDITION_FAILED = 412,
  UNSUPPORTED_MEDIA_TYPE = 415,
  TOO_MANY_REQUESTS = 429,
}

export enum HttpServerErrors {
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

export type HttpCode = HttpSuccess | HttpRedirect | HttpClientErrors | HttpServerErrors;

export default {
  Success: HttpSuccess,
  Redirect: HttpRedirect,
  Client: HttpClientErrors,
  Server: HttpServerErrors,
};
