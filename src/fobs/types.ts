import {IDbFountain, IDbBathroom} from "../mongoDB";
import {IFountain} from "../fountains/types";
import {IBathroom} from "../bathrooms/types";
import { iDbLocationToILocation, iLocationToIDbLocation } from "../utils/types";

export function isFountain(fob: IFountain | IBathroom | IDbFountain | IDbBathroom) : fob is IFountain | IDbFountain {
  return (fob as IFountain | IDbFountain).info.bottle_filler !== undefined;
}

export function isBathroom(fob: IFountain | IBathroom | IDbFountain | IDbBathroom) : fob is IBathroom | IDbBathroom {
  return (fob as IBathroom | IDbBathroom).info.sanitary_products !== undefined;
}


export function iFobToIDbFob<Type extends IFountain | IBathroom, DbType extends IDbFountain | IDbBathroom>(fob: Type) : DbType {
  return {
    id: fob.id,
    info: {...fob.info, location: iLocationToIDbLocation(fob.info.location)}
  } as DbType;
}

export function iDbFobToIFob<DbType extends IDbFountain | IDbBathroom, Type extends IFountain | IBathroom>(dbFob : DbType) : Type {
  return {
    id: dbFob.id,
    info: {...dbFob.info, location: iDbLocationToILocation(dbFob.info.location)}
  } as Type;
}
