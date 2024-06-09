import {components} from "../../schema";
import { IDbLocation } from "../mongoDB";

export type IHashedPassword = components["schemas"]["HashedPassword"];

export type ILocation = components["schemas"]["Location"];
export function iDbLocationToILocation (dbLocation : IDbLocation) : ILocation {
  if (dbLocation === null) {
    return null;
  }
  return {
    latitude: dbLocation.coordinates[1],
    longitude: dbLocation.coordinates[0]
  };
}
export function iLocationToIDbLocation (iLocation : ILocation) : IDbLocation {
  if (iLocation === null) {
    return null;
  }
  return {
    type: "Point",
    coordinates: [iLocation.longitude, iLocation.latitude]
  };
}

export type IUser = components["schemas"]["User"];

export type IPictureInfo = components["schemas"]["PictureInfo"];
export type IPicture = components["schemas"]["Picture"];
