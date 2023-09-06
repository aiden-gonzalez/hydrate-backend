export function getIdRegex(prefix : string) {
  return new RegExp(`^${prefix}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`);
}
export const bathroomIdRegex = getIdRegex("bath");
export const bathroomRatingIdRegex = getIdRegex("bath_rate");
export const fountainIdRegex = getIdRegex("fount");
export const fountainRatingIdRegex = getIdRegex("fount_rate");
export const userIdRegex = getIdRegex("user");
export const pictureIdRegex = getIdRegex("pic");
