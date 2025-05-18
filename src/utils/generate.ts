import { v4 } from "uuid";
import * as constants from "./constants";

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
