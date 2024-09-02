import {ILocation} from "./types";

const R = 6371e3; // radius of earth in meters

export function degToRad(degrees : number) : number {
  return degrees * (Math.PI / 180);
}

export function radToDeg(radians : number) : number {
  return radians * (180 / Math.PI);
}

export function calculateDistance(pointA : ILocation, pointB: ILocation) : number {
  const phiA = degToRad(pointA.latitude);
  const phiB = degToRad(pointB.latitude);
  const deltaPhi = degToRad(pointB.latitude - pointA.latitude);
  const deltaLambda = degToRad(pointB.longitude - pointA.longitude);

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
    Math.cos(phiA) * Math.cos(phiB) *
    Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // distance in meters
}

/*
 * start: ILocation
 * distance: in meters
 * bearing: true heading in degrees
 */
export function calculateLocationAtDistance(start : ILocation, distance : number, bearing : number) {
  const latStart = degToRad(start.latitude);
  const lonStart = degToRad(start.longitude);
  const a = degToRad(bearing);
  const latDest = Math.asin(Math.sin(latStart) * Math.cos(distance/R) + Math.cos(latStart) * Math.sin(distance/R) * Math.cos(a));
  const lonDest = lonStart + Math.atan2(
    Math.sin(a) * Math.sin(distance/R) * Math.cos(latStart),
    Math.cos(distance/R) - Math.sin(latStart) * Math.sin(latDest)
  );
  return {
    latitude: radToDeg(latDest),
    longitude: radToDeg(lonDest)
  } as ILocation;
}
