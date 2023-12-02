// HTTP status codes
export const HTTP_OK : number = 200;
export const HTTP_UNAUTHORIZED : number = 401;
export const HTTP_FORBIDDEN : number = 403;
export const HTTP_NOT_FOUND : number = 404;

// HTTP status messages
export const HTTP_UNAUTHORIZED_MESSAGE : string = "Invalid credentials";

// HTTP headers
export const HTTP_AUTHORIZATION_HEADER : string = "Authorization";

// JWT parameters
export const JWT_TYPE : string = "Bearer";
export const JWT_ACCESS_EXPIRATION : number = 5400; // 90 minutes
export const JWT_REFRESH_EXPIRATION : number = 604800; // 1 week

// Hashing parameters
export const HASH_LEN : number = 64;
export const HASH_ENCODING : BufferEncoding = "hex";
export const HASH_ITERATIONS : number = 100;
export const HASH_DIGEST : string = "sha512";

// ID prefixes
export const BATHROOM_ID_PREFIX : string = "bath";
export const BATHROOM_RATING_ID_PREFIX : string = "bath_rate";
export const FOUNTAIN_ID_PREFIX : string = "fount";
export const FOUNTAIN_RATING_ID_PREFIX : string = "fount_rate";
export const USER_ID_PREFIX : string = "user";
export const PICTURE_ID_PREFIX : string = "pic";
