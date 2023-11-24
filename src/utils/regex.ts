import * as constants from "./constants";

function getIdRegex(prefix : string) {
  return new RegExp(`^${prefix}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`);
}
export const bathroomIdRegex = getIdRegex(constants.BATHROOM_ID_PREFIX);
export const bathroomRatingIdRegex = getIdRegex(constants.BATHROOM_RATING_ID_PREFIX);
export const fountainIdRegex = getIdRegex(constants.FOUNTAIN_ID_PREFIX);
export const fountainRatingIdRegex = getIdRegex(constants.FOUNTAIN_RATING_ID_PREFIX);
export const userIdRegex = getIdRegex(constants.USER_ID_PREFIX);
export const pictureIdRegex = getIdRegex(constants.PICTURE_ID_PREFIX);
