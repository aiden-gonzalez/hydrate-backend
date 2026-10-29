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
export const ERROR_USER_WITH_EMAIL_ALREADY_EXISTS = "User with that email address already exists";
export const ERROR_USER_WITH_USERNAME_ALREADY_EXISTS = "User with that username already exists";

// HTTP headers
export const HTTP_AUTHORIZATION_HEADER  = "Authorization";

// JWT parameters
export const JWT_TYPE  = "Bearer";
export const JWT_ACCESS_EXPIRATION  = 5400; // 90 minutes
export const JWT_REFRESH_EXPIRATION  = 604800; // 1 week

// Hashing parameters
export const HASH_LEN  = 64;
export const HASH_ENCODING : BufferEncoding = "hex";
export const HASH_ITERATIONS  = 210000; // OWASP recommendation for PBKDF2-HMAC-SHA512
export const HASH_ITERATIONS_LEGACY = 100; // Used for accounts created before hash_iterations was stored
export const HASH_DIGEST  = "sha512";

// ID prefixes
export const BATHROOM_ID_PREFIX  = "bath";
export const BATHROOM_RATING_ID_PREFIX  = "bathrate";
export const FOUNTAIN_ID_PREFIX  = "fount";
export const FOUNTAIN_RATING_ID_PREFIX  = "fountrate";
export const USER_ID_PREFIX  = "user";
export const PICTURE_ID_PREFIX  = "pic";

// Image URLs
export const URL_DEFAULT_PROFILE_PICTURE = "https://i.imgur.com/JGmoHaP.jpeg";

// S3 bucket
export const S3_FOB_PICTURES_FOLDER = "fob_pictures";
export const S3_DOWNLOAD_URL_EXPIRATION = 60 * 60; // 1 hour
export const S3_UPLOAD_URL_EXPIRATION = 60 * 10; // 10 minutes

// Password reset
export const PASSWORD_RESET_CODE_LENGTH = 8;
export const PASSWORD_RESET_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No 0/O or 1/I to avoid typos
export const PASSWORD_RESET_EXPIRATION = 15 * 60 * 1000; // 15 minutes
export const PASSWORD_RESET_REQUEST_MESSAGE = "If an account exists with that email, a password reset code has been sent.";

// Rate limits (per IP address)
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_LOGIN = 20; // login attempts per window
export const RATE_LIMIT_SIGNUP = 10; // signups per window
export const RATE_LIMIT_PASSWORD_RESET_REQUEST = 5; // reset code emails per window
export const RATE_LIMIT_PASSWORD_RESET = 10; // attempts to use a reset code per window
export const RATE_LIMIT_GENERAL = 600; // all other requests per window

// Moderation
// Pictures are automatically hidden once this many different users have reported them
export const REPORT_HIDE_PICTURE_THRESHOLD = 3;
