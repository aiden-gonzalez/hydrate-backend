import {components} from "../../schema";

export type IBathroomInfo = components["schemas"]["BathroomInfo"];
export type IBathroom = components["schemas"]["Bathroom"];
export type IBathroomRatingDetails = components["schemas"]["BathroomRatingDetails"];
export type IBathroomRating = components["schemas"]["BathroomRating"];

export type IBathroomQueryParams = {
  baby_changer?: boolean;
  sanitary_products?: boolean;
  gender?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
};
