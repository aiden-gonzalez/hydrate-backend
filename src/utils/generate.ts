import { v4 } from "uuid";
import * as constants from "./constants";
import { createHash, randomInt } from "crypto";

// generate ID
function generateId (prefix: string) : string {
  return prefix + "_" + v4();
}
export function generateUserId() {
  return generateId(constants.USER_ID_PREFIX);
}
export function generateBathroomId() {
  return generateId(constants.BATHROOM_ID_PREFIX);
}
export function generateBathroomRatingId() {
  return generateId(constants.BATHROOM_RATING_ID_PREFIX);
}
export function generateFountainId() {
  return generateId(constants.FOUNTAIN_ID_PREFIX);
}
export function generateFountainRatingId() {
  return generateId(constants.FOUNTAIN_RATING_ID_PREFIX);
}
export function generatePictureId() {
  return generateId(constants.PICTURE_ID_PREFIX);
}

// Short code the user types into the app, e.g. "K7QM4XRP"
export function generatePasswordResetCode(): string {
  const alphabet = constants.PASSWORD_RESET_CODE_ALPHABET;
  let code = "";
  for (let i = 0; i < constants.PASSWORD_RESET_CODE_LENGTH; i++) {
    code += alphabet[randomInt(alphabet.length)];
  }
  return code;
}

// Users may type codes in lower case or with spaces / dashes
export function normalizePasswordResetCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// Reset codes are stored hashed so a database leak doesn't expose usable codes
export function hashPasswordResetCode(code: string): string {
  return createHash("sha256").update(normalizePasswordResetCode(code)).digest("hex");
}
