import { rateLimit } from "express-rate-limit";
import * as constants from "./constants";

// Per-IP rate limiting (in memory, which is fine for a single server instance).
// Behind a reverse proxy, set TRUST_PROXY so the client IP is taken from X-Forwarded-For.
// Limits can be disabled with RATE_LIMIT_DISABLED=true (the test suite does this).
function limiter(limit: number) {
  return rateLimit({
    windowMs: constants.RATE_LIMIT_WINDOW,
    limit: limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: () => process.env.RATE_LIMIT_DISABLED === "true",
    message: { message: "Too many requests, please try again later." }
  });
}

export const loginRateLimit = limiter(constants.RATE_LIMIT_LOGIN);
export const signupRateLimit = limiter(constants.RATE_LIMIT_SIGNUP);
export const passwordResetRequestRateLimit = limiter(constants.RATE_LIMIT_PASSWORD_RESET_REQUEST);
export const passwordResetRateLimit = limiter(constants.RATE_LIMIT_PASSWORD_RESET);
export const generalRateLimit = limiter(constants.RATE_LIMIT_GENERAL);
