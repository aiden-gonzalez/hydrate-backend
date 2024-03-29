import {IDbFountain, IDbBathroom} from "../mongoDB";
import {iDbFountainInfoToIFountainInfo, IFountain, iFountainInfoToIDbFountainInfo} from "../fountains/types";
import {iDbBathroomInfoToIBathroomInfo, IBathroom, iBathroomInfoToIDbBathroomInfo} from "../bathrooms/types";



export function iFobToIDbFob(fob: IFountain | IBathroom) : IDbFountain | IDbBathroom {
  if (typeof(fob) === IFountain) {
    return {
      id: fob.id,
      info: iFountainInfoToIDbFountainInfo(fob.info)
    } as IDbFountain;
  }
  return {
    id: fob.id,
    info: iBathroomInfoToIDbBathroomInfo(fob.info)
  } as IDbBathroom;
}
export function iDbFountainToIFountain(dbFountain : IDbFountain) : IFountain {
  return {
    id: dbFountain.id,
    info: iDbFountainInfoToIFountainInfo(dbFountain.info)
  } as IFountain;
}