import {ILocation} from "./types";

const R = 6371e3; // radius of earth in meters

export function calculateDistance(pointA : ILocation, pointB: ILocation) : number {
  const phiA = pointA.latitude * (Math.PI / 180); // in radians
  const phiB = pointB.latitude * (Math.PI / 180); // in radians
  const deltaPhi = (pointB.latitude - pointA.latitude) * Math.PI/180; // in radians
  const deltaLambda = (pointB.longitude - pointA.longitude) * Math.PI/180; // in radians

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
    Math.cos(phiA) * Math.cos(phiB) *
    Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // distance in meters
}
