import {IUserProfile} from "./types";
import {IUser} from "../utils/types";
import * as database from "../utils/database";
import {
  HTTP_FORBIDDEN,
  HTTP_FORBIDDEN_MESSAGE,
  HTTP_INTERNAL_ERROR,
  HTTP_INTERNAL_ERROR_MESSAGE,
  HTTP_NOT_FOUND,
  HTTP_NOT_FOUND_MESSAGE,
  HTTP_OK
} from "../utils/constants";

export async function getUserMiddleware(req, res, next) {
  const username = req.params.username;
  const user : IUser = await database.fetchUserByUsername(username);
  if (user == null) {
    return res.status(HTTP_NOT_FOUND).send(HTTP_NOT_FOUND_MESSAGE);
  }
  req.dbUser = user;
  return next();
}

export function profilePermissionCheck(req, res, next) {
  const authedUser : IUser = req.user;
  const requestedUsername : string = req.params.username;

  if (!authedUser || authedUser.username != requestedUsername) {
    return res.status(HTTP_FORBIDDEN).send(HTTP_FORBIDDEN_MESSAGE);
  }
  return next();
}

export function getProfileForUser(req, res) {
  if (req.dbUser && req.dbUser.profile) {
    return res.status(HTTP_OK).json(req.dbUser.profile);
  }
  return res.status(HTTP_INTERNAL_ERROR).send(HTTP_INTERNAL_ERROR_MESSAGE);
}

export async function updateProfile(req, res) {
  const username : string = req.params.username;
  const newProfile : IUserProfile = req.body;

  return new Promise((resolve) => {
    database.updateUserProfileByUsername(username, newProfile).then((updatedUserProfile) => {
      resolve(res.status(HTTP_OK).json(updatedUserProfile));
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    });
  });
}

export async function getContributionsForUser(req, res) {
  // const username : string = req.dbUser.username;

  return;

  // return new Promise((resolve) => {
  //   database.getContributionsByUsername(username).then((contributions) => {
  //     resolve(res.status(HTTP_OK).json(contributions));
  //   }).catch((error) => {
  //     resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
  //   })
  // })
}
