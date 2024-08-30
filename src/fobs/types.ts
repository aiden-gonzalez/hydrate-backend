import {
  IFountain,
  IFountainInfo,
  IFountainQueryParams,
  IFountainRating,
  IFountainRatingDetails
} from "../fountains/types";
import {
  IBathroom,
  IBathroomInfo,
  IBathroomQueryParams,
  IBathroomRating,
  IBathroomRatingDetails
} from "../bathrooms/types";
import {IPicture} from "../utils/types";
import { IUser } from "../utils/types";

export type IFob = IFountain | IBathroom;
export type IFobInfo = IFountainInfo | IBathroomInfo;
export type IFobRating = IFountainRating | IBathroomRating;
export type IFobRatingDetails = IFountainRatingDetails | IBathroomRatingDetails;
export type IFobQueryParams = IFountainQueryParams | IBathroomQueryParams;

// Aggregate Types
export type IFobUser = {
  user: IUser
}
export type IFobRatings = {
  ratings: IFountainRating[] | IBathroomRating[]
}
export type IFobPictures = {
  pictures: IPicture[]
}
export type IAggregatedFountain = IFountain & IFobUser & IFobRatings & IFobPictures;
export type IAggregatedBathroom = IBathroom & IFobUser & IFobRatings & IFobPictures;
export type IAggregatedFob = IFob & IFobUser & IFobRatings & IFobPictures;

export function isFountain(fob: IFob) : fob is IFountain | IAggregatedFountain {
  return (fob as IFountain | IAggregatedFountain).info.bottle_filler !== undefined;
}

export function isBathroom(fob: IFob | IDbFob) : fob is IBathroom | IDbBathroom | IAggregatedBathroom | IAggregatedDbBathroom {
  return (fob as IBathroom | IDbBathroom | IAggregatedBathroom | IAggregatedDbBathroom).info.sanitary_products !== undefined;
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
    user_id: fob.user_id,
    info: iFobInfoToIDbFobInfo(fob.info),
    created_at: fob.created_at,
    updated_at: fob.updated_at
  } as IDbFob;
}

export function iDbFobToIFob(dbFob : IDbFob) : IFob {
  return {
    id: dbFob.id,
    user_id: dbFob.user_id,
    info: iDbFobInfoToIFobInfo(dbFob.info),
    created_at: dbFob.created_at,
    updated_at: dbFob.updated_at
  } as IFob;
}

export function iAggregatedFobToIAggregatedDbFob(aggregatedFob : IAggregatedFob) : IAggregatedDbFob {
  return {
    id: aggregatedFob.id,
    user_id: aggregatedFob.user_id,
    user: aggregatedFob.user,
    ratings: aggregatedFob.ratings,
    pictures: aggregatedFob.pictures,
    info: iFobInfoToIDbFobInfo(aggregatedFob.info),
    created_at: aggregatedFob.created_at,
    updated_at: aggregatedFob.updated_at
  } as IAggregatedDbFob;
}

export function iAggregatedDbFobToIAggregatedFob(aggregatedDbFob : IAggregatedDbFob) : IAggregatedFob {
  return {
    id: aggregatedDbFob.id,
    user_id: aggregatedDbFob.user_id,
    user: aggregatedDbFob.user,
    ratings: aggregatedDbFob.ratings,
    pictures: aggregatedDbFob.pictures,
    info: iDbFobInfoToIFobInfo(aggregatedDbFob.info),
    created_at: aggregatedDbFob.created_at,
    updated_at: aggregatedDbFob.updated_at
  } as IAggregatedFob;
}
