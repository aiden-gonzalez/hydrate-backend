import {paths, components} from "../../schema";

export type IBathroomInfo = components["schemas"]["BathroomInfo"];
export type IBathroom = components["schemas"]["Bathroom"];
export type IBathroomRatingDetails = components["schemas"]["BathroomRatingDetails"];
export type IBathroomRating = components["schemas"]["BathroomRating"];
export type IBathroomCreationDetails = components["schemas"]["BathroomCreationDetails"];

export type IBathroomQueryParams = paths["/api/bathrooms"]["get"]["parameters"]["query"];
