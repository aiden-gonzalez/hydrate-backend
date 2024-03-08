// HTTP status codes
export const HTTP_OK  = 200;
export const HTTP_CREATED = 201;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHORIZED  = 401;
export const HTTP_FORBIDDEN  = 403;
export const HTTP_NOT_FOUND  = 404;
export const HTTP_INTERNAL_ERROR = 500;

// HTTP status messages
export const HTTP_UNAUTHORIZED_MESSAGE  = "Invalid credentials";
export const HTTP_FORBIDDEN_MESSAGE = "Not permitted to perform that action";
export const HTTP_NOT_FOUND_MESSAGE = "Resource not found";
export const HTTP_INTERNAL_ERROR_MESSAGE = "Internal error";

// Other error messages
export const ERROR_USER_ALREADY_EXISTS = "User with that username already exists";

// HTTP headers
export const HTTP_AUTHORIZATION_HEADER  = "Authorization";

// JWT parameters
export const JWT_TYPE  = "Bearer";
export const JWT_ACCESS_EXPIRATION  = 5400; // 90 minutes
export const JWT_REFRESH_EXPIRATION  = 604800; // 1 week

// Hashing parameters
export const HASH_LEN  = 64;
export const HASH_ENCODING : BufferEncoding = "hex";
export const HASH_ITERATIONS  = 100;
export const HASH_DIGEST  = "sha512";

// ID prefixes
export const BATHROOM_ID_PREFIX  = "bath";
export const BATHROOM_RATING_ID_PREFIX  = "bath_rate";
export const FOUNTAIN_ID_PREFIX  = "fount";
export const FOUNTAIN_RATING_ID_PREFIX  = "fount_rate";
export const USER_ID_PREFIX  = "user";
export const PICTURE_ID_PREFIX  = "pic";

// Image URLs
export const URL_DEFAULT_PROFILE_PICTURE = "https://i.imgur.com/JGmoHaP.jpeg";
