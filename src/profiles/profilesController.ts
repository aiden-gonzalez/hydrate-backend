import { IUserProfile } from "./types";
import { IUser } from "../utils/types";
import database = require('../utils/database');
import { ERROR_USER_NOT_FOUND, ERROR_INTERNAL, HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND, HTTP_OK } from "../utils/constants";
import { User } from "../mongoDB";

export async function getUserMiddleware(req, res, next) {
  const username = req.params.username;
  const user : IUser = await database.fetchUserByUsername(username);
  if (user == null) {
    return res.status(HTTP_NOT_FOUND).send(ERROR_USER_NOT_FOUND);
  }
  req.user = user;
  next();
}

export function getProfileFromUser(req, res) {
  if (req.user && req.user.profile) {
    return res.status(HTTP_OK).json(req.user.profile);
  }
  return res.status(HTTP_INTERNAL_ERROR).send(ERROR_INTERNAL);
}

export async function updateProfile(req, res) {
  const username : string = req.params.username;
  const newProfile : IUserProfile = req.json();
  // TODO centralize this into the database utils file?
  const updatedUser = await User.findOneAndUpdate({ username: username }, { profile: newProfile } )
  if (updatedUser) {
    return res.status(HTTP_OK).json(updatedUser.profile);
  }
  return res.status(HTTP_INTERNAL_ERROR).send(ERROR_INTERNAL);
}
