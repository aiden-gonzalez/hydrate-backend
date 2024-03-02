import {components} from "../../schema";
import { IDbFountain, IDbFountainInfo } from "../mongoDB";
import { iLocationToIDbLocation, iDbLocationToILocation } from "../utils/types";

export type IFountainInfo = components["schemas"]["FountainInfo"];
export function iFountainInfoToIDbFountainInfo(fountainInfo: IFountainInfo) : IDbFountainInfo {
  return {
    name: fountainInfo.name,
    bottle_filler: fountainInfo.bottle_filler,
    location: iLocationToIDbLocation(fountainInfo.location)
  } as IDbFountainInfo;
}
export function iDbFountainInfoToIFountainInfo(dbFountainInfo: IDbFountainInfo) : IFountainInfo {
  return {
    name: dbFountainInfo.name,
    bottle_filler: dbFountainInfo.bottle_filler,
    location: iDbLocationToILocation(dbFountainInfo.location)
  }
}
export type IFountain = components["schemas"]["Fountain"];
export function iFountainToIDbFountain(fountain: IFountain) : IDbFountain {
  return {
    id: fountain.id,
    info: iFountainInfoToIDbFountainInfo(fountain.info)
  } as IDbFountain;
}
export function iDbFountainToIFountain(dbFountain : IDbFountain) : IFountain {
  return {
    id: dbFountain.id,
    info: iDbFountainInfoToIFountainInfo(dbFountain.info)
  } as IFountain;
}
export type IFountainRatingDetails = components["schemas"]["FountainRatingDetails"];
export type IFountainRating = components["schemas"]["FountainRating"];

export type IFountainQueryParams = {
  bottle_filler?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
};
