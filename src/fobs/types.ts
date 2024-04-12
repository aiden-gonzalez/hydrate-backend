import {IDbFountain, IDbBathroom, IDbFountainInfo, IDbBathroomInfo} from "../mongoDB";
import {IFountain, IFountainInfo} from "../fountains/types";
import {IBathroom, IBathroomInfo} from "../bathrooms/types";
import { iDbLocationToILocation, iLocationToIDbLocation } from "../utils/types";

export function isFountain(fob: IFountain | IBathroom | IDbFountain | IDbBathroom) : fob is IFountain | IDbFountain {
  return (fob as IFountain | IDbFountain).info.bottle_filler !== undefined;
}

export function isBathroom(fob: IFountain | IBathroom | IDbFountain | IDbBathroom) : fob is IBathroom | IDbBathroom {
  return (fob as IBathroom | IDbBathroom).info.sanitary_products !== undefined;
}

export function iFobInfoToIDbFobInfo<Type extends IFountainInfo | IBathroomInfo, DbType extends IDbFountainInfo | IDbBathroomInfo>(fobInfo : Type) : DbType {
  return {...fobInfo as unknown as DbType, location: iLocationToIDbLocation(fobInfo.location)};
}

export function iDbFobInfoToIFobInfo<DbType extends IDbFountainInfo | IDbBathroomInfo, Type extends IFountainInfo | IBathroomInfo>(dbFobInfo : DbType) : Type {
  return {...dbFobInfo as unknown as Type, location: iDbLocationToILocation(dbFobInfo.location)};
}

export function iFobToIDbFob<Type extends IFountain | IBathroom, DbType extends IDbFountain | IDbBathroom>(fob: Type) : DbType {
  return {
    id: fob.id,
    info: iFobInfoToIDbFobInfo<IFountainInfo | IBathroomInfo, IDbFountainInfo | IDbBathroomInfo>(fob.info)
  } as DbType;
}

export function iDbFobToIFob<DbType extends IDbFountain | IDbBathroom, Type extends IFountain | IBathroom>(dbFob : DbType) : Type {
  return {
    id: dbFob.id,
    info: {...dbFob.info, location: iDbLocationToILocation(dbFob.info.location)}
  } as Type;
}
