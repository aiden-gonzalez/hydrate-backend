import {paths, components} from "../../schema";

export type IFountainInfo = components["schemas"]["FountainInfo"];
export type IFountain = components["schemas"]["Fountain"];
export type IFountainRatingDetails = components["schemas"]["FountainRatingDetails"];
export type IFountainRating = components["schemas"]["FountainRating"];

export type IFountainQueryParams = paths["/api/fountains"]["get"]["parameters"]["query"];
