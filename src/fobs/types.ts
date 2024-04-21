import {IDbFountain, IDbBathroom, IDbFountainInfo, IDbBathroomInfo} from "../mongoDB";
import {IFountain, IFountainInfo, IFountainRating, IFountainRatingDetails} from "../fountains/types";
import {IBathroom, IBathroomInfo, IBathroomRating, IBathroomRatingDetails} from "../bathrooms/types";
import { iDbLocationToILocation, iLocationToIDbLocation } from "../utils/types";

export type IFob = IFountain | IBathroom;
export type IFobInfo = IFountainInfo | IBathroomInfo;
export type IDbFob = IDbFountain | IDbBathroom;
export type IDbFobInfo = IDbFountainInfo | IDbBathroomInfo;
export type IFobRating = IFountainRating | IBathroomRating;
export type IFobRatingDetails = IFountainRatingDetails | IBathroomRatingDetails;

export function isFountain(fob: IFob | IDbFob) : fob is IFountain | IDbFountain {
  return (fob as IFountain | IDbFountain).info.bottle_filler !== undefined;
}

export function isBathroom(fob: IFob | IDbFob) : fob is IBathroom | IDbBathroom {
  return (fob as IBathroom | IDbBathroom).info.sanitary_products !== undefined;
}

export function isFountainRating(fobRating: IFobRating) : fobRating is IFountainRating {
  return (fobRating as IFountainRating).details.taste !== undefined;
}

export function isBathroomRating(fobRating : IFobRating) : fobRating is IBathroomRating {
  return (fobRating as IBathroomRating).details.washing !== undefined;
}

export function iFobInfoToIDbFobInfo(fobInfo : IFobInfo) : IDbFobInfo {
  return {...fobInfo as unknown as IDbFobInfo, location: iLocationToIDbLocation(fobInfo.location)};
}

export function iDbFobInfoToIFobInfo(dbFobInfo : IDbFobInfo) : IFobInfo {
  return {...dbFobInfo as unknown as IFobInfo, location: iDbLocationToILocation(dbFobInfo.location)};
}

export function iFobToIDbFob(fob: IFob) : IDbFob {
  return {
    id: fob.id,
    info: iFobInfoToIDbFobInfo(fob.info)
  } as IDbFob;
}

export function iDbFobToIFob(dbFob : IDbFob) : IFob {
  return {
    id: dbFob.id,
    info: {...dbFob.info, location: iDbLocationToILocation(dbFob.info.location)}
  } as IFob;
}
