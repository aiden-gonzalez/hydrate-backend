import { validationResult } from "express-validator";
import validator from "validator";
import { fountainIdRegex, bathroomIdRegex } from "./regex";

// Check for validation error and deny request if present
export function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ validation_errors: errors.array() });
  } else {
    return next();
  }
}

// URL Validator
export function urlValidator(url: string) {
  return validator.isURL(url);
}

// sha512Validator
export function sha512Validator(hex: string) {
  return validator.isHash(hex, "sha512");
}

// Email Validator
export function emailValidator(email: string) {
  return validator.isEmail(email);
}

export function jwtValidator(jwt: string) {
  return validator.isJWT(jwt);
}

export function uuidValidator(uuid: string) {
  return validator.isUUID(uuid);
}

export function regexValidator(testString: string, regex: RegExp) {
  return validator.matches(testString, regex);
}

// Entity ID Validator
export function entityIdValidator(entityId: string) {
  return validator.matches(entityId, fountainIdRegex) || validator.matches(entityId, bathroomIdRegex);
}
