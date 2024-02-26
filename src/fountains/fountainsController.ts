import {IFountainInfo, IFountainQueryParams} from "./types";
import * as database from "../utils/database";
import {HTTP_INTERNAL_ERROR, HTTP_OK} from "../utils/constants";

export function getFountains(req, res) {
  // Get filter query params
  const queryParams = {
    bottle_filler: req.query.bottle_filler,
    latitude: req.query.latitude,
    longitude: req.query.longitude,
    radius: req.query.radius
  } as IFountainQueryParams;

  // Execute query
  return new Promise((resolve) => {
    database.queryFountains(queryParams).then((fountains) => {
      resolve(res.status(HTTP_OK).json(fountains))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  })
}

export function createFountain(req, res) {
  // Get fountain info from request
  const fountainInfo : IFountainInfo = req.body;

  // Create fountain
  return new Promise((resolve) => {
    database.createFountain(fountainInfo).then((createdFountain) => {
      resolve(res.status(HTTP_OK).json(createdFountain));
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    });
  });
}

export function getFountain(req, res) {
  return "get fountains";
}

export function updateFountain(req, res) {
  return "get fountains";
}

export function getFountainPhotos(req, res) {
  return "get fountains";
}

export function addFountainPhoto(req, res) {
  return "get fountains";
}

export function getFountainPhoto(req, res) {
  return "get fountain photo";
}

export function deleteFountainPhoto(req, res) {
  return "get fountains";
}

export function getFountainRatings(req, res) {
  return "get fountains";
}

export function addFountainRating(req, res) {
  return "get fountains";
}

export function getFountainRating(req, res) {
  return "get fountains";
}

export function updateFountainRating(req, res) {
  return "get fountains";
}
