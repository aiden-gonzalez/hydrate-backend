import {components} from "../../schema";
import { IDbBathroom, IDbBathroomInfo } from "../mongoDB";
import { iDbLocationToILocation, iLocationToIDbLocation } from "../utils/types";

export type IBathroomInfo = components["schemas"]["BathroomInfo"];
export type IBathroom = components["schemas"]["Bathroom"];
export type IBathroomRatingDetails = components["schemas"]["BathroomRatingDetails"];
export type IBathroomRating = components["schemas"]["BathroomRating"];

export function iBathroomInfoToIDbBathroomInfo(bathroomInfo: IBathroomInfo) : IDbBathroomInfo {
  return {
    name: bathroomInfo.name,
    gender: bathroomInfo.gender,
    sanitary_products: bathroomInfo.sanitary_products,
    baby_changer: bathroomInfo.baby_changer,
    location: iLocationToIDbLocation(bathroomInfo.location)
  } as IDbBathroomInfo;
}
export function iDbBathroomInfoToIBathroomInfo(dbBathroomInfo: IDbBathroomInfo) : IBathroomInfo {
  return {
    name: dbBathroomInfo.name,
    gender: dbBathroomInfo.gender,
    sanitary_products: dbBathroomInfo.sanitary_products,
    baby_changer: dbBathroomInfo.baby_changer,
    location: iDbLocationToILocation(dbBathroomInfo.location)
  } as IBathroomInfo;
}
export function iBathroomToIDbBathroom(bathroom: IBathroom) : IDbBathroom {
  return {
    id: bathroom.id,
    info: iBathroomInfoToIDbBathroomInfo(bathroom.info)
  } as IDbBathroom;
}
export function iDbBathroomToIBathroom(dbBathroom : IDbBathroom) : IBathroom {
  return {
    id: dbBathroom.id,
    info: iDbBathroomInfoToIBathroomInfo(dbBathroom.info)
  } as IBathroom;
}
  
export type IBathroomQueryParams = {
  baby_changer?: boolean;
  sanitary_products?: boolean;
  gender?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
};
