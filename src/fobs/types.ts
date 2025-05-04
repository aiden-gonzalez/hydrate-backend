import {paths, components} from "../../schema";
import * as constants from "../utils/constants";

export enum FobType {
  Fountain = "fountain",
  Bathroom = "bathroom"
}

// Fountains
export type IFountainInfo = components["schemas"]["FountainInfo"];
export type IFountainRatingDetails = components["schemas"]["FountainRatingDetails"];

// Bathrooms
export type IBathroomInfo = components["schemas"]["BathroomInfo"];
export type IBathroomRatingDetails = components["schemas"]["BathroomRatingDetails"];

// Fobs
export type IFob = components["schemas"]["Fob"];
export type IFobInfo = IFountainInfo | IBathroomInfo;
export type IRating = components["schemas"]["Rating"];
export type IRatingDetails = IFountainRatingDetails | IBathroomRatingDetails;
export type IRatingWithDetails = components["schemas"]["RatingWithDetails"];
export type IFobCreationDetails = components["schemas"]["FobCreationDetails"];
export type IFobWithDetails = components["schemas"]["FobWithDetails"];
export type IFobQueryParams =  paths["/api/fobs"]["get"]["parameters"]["query"];

export function isFountain(fob: IFob) {
  return fob.id.startsWith(constants.FOUNTAIN_ID_PREFIX);
}

export function isBathroom(fob: IFob) {
  return fob.id.startsWith(constants.BATHROOM_ID_PREFIX);
}

export function isFountainRating(fobRating: IRating) {
  return fobRating.id.startsWith(constants.FOUNTAIN_RATING_ID_PREFIX);
}

export function isBathroomRating(fobRating : IRating) {
  return fobRating.id.startsWith(constants.BATHROOM_RATING_ID_PREFIX);
}
