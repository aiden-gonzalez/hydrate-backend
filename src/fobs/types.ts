import {
  IFountain, IFountainCreationDetails,
  IFountainInfo,
  IFountainQueryParams,
  IFountainRating,
  IFountainRatingDetails
} from "../fountains/types";
import {
  IBathroom, IBathroomCreationDetails,
  IBathroomInfo,
  IBathroomQueryParams,
  IBathroomRating,
  IBathroomRatingDetails
} from "../bathrooms/types";

export type IFob = (IFountain & IBathroom) | {info: IFobInfo};
export type IFobInfo = IFountainInfo | IBathroomInfo;
export type IFobRating = (IFountainRating & IBathroomRating) | {details: IFobRatingDetails};
export type IFobRatingDetails = IFountainRatingDetails | IBathroomRatingDetails;
export type IFobCreationDetails = IFountainCreationDetails | IBathroomCreationDetails;
export type IFobQueryParams = IFountainQueryParams | IBathroomQueryParams;

export function isFountain(fob: IFob) : fob is IFountain {
  return (fob as IFountain).info.bottle_filler !== undefined;
}

export function isBathroom(fob: IFob) : fob is IBathroom {
  return (fob as IBathroom).info.sanitary_products !== undefined;
}

export function isFountainRating(fobRating: IFobRating) : fobRating is IFountainRating {
  return (fobRating as IFountainRating).details.taste !== undefined;
}

export function isBathroomRating(fobRating : IFobRating) : fobRating is IBathroomRating {
  return (fobRating as IBathroomRating).details.washing !== undefined;
}
