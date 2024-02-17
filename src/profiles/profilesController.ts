import { IUserProfile } from "./types";
import { IUser } from "../utils/types";
import database = require('../utils/database');
import { HTTP_INTERNAL_ERROR, HTTP_INTERNAL_ERROR_MESSAGE, HTTP_NOT_FOUND, HTTP_NOT_FOUND_MESSAGE, HTTP_OK, HTTP_FORBIDDEN, HTTP_FORBIDDEN_MESSAGE } from "../utils/constants";

export async function getUserMiddleware(req, res, next) {
  const username = req.params.username;
  const user : IUser = await database.fetchUserByUsername(username);
  if (user == null) {
    return res.status(HTTP_NOT_FOUND).send(HTTP_NOT_FOUND_MESSAGE);
  }
  req.dbUser = user;
  next();
}

export function permissionCheck(req, res, next) {
  const authedUser : IUser = req.user;
  const requestedUsername : string = req.params.username;

  if (!authedUser || authedUser.username != requestedUsername) {
    return res.status(HTTP_FORBIDDEN).send(HTTP_FORBIDDEN_MESSAGE);
  }
  next();
}

export function getProfileForUser(req, res) {
  if (req.dbUser && req.dbUser.profile) {
    return res.status(HTTP_OK).json(req.dbUser.profile);
  }
  return res.status(HTTP_INTERNAL_ERROR).send(HTTP_INTERNAL_ERROR_MESSAGE);
}

export async function updateProfile(req, res) {
  const username : string = req.params.username;
  const newProfile : IUserProfile = req.json();
  const updatedUserProfile = await database.updateUserProfileByUsername(username, newProfile);
  if (updatedUserProfile) {
    return res.status(HTTP_OK).json(updatedUserProfile);
  }
  return res.status(HTTP_INTERNAL_ERROR).send(HTTP_INTERNAL_ERROR_MESSAGE);
}
