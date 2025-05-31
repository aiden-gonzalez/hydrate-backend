import {IUserContributionQueryParams} from "./types";
import {IUser} from "../utils/types";
import * as db from "../db/queries";
import {
  HTTP_FORBIDDEN,
  HTTP_FORBIDDEN_MESSAGE,
  HTTP_INTERNAL_ERROR,
  HTTP_INTERNAL_ERROR_MESSAGE,
  HTTP_NOT_FOUND,
  HTTP_NOT_FOUND_MESSAGE,
  HTTP_OK
} from "../utils/constants";

export async function getUserByUsernameMiddleware(req, res, next) {
  const username = req.params.username;
  const user : IUser = await db.getUserByUsername(username);
  if (user == null) {
    return res.status(HTTP_NOT_FOUND).send(HTTP_NOT_FOUND_MESSAGE);
  }
  req.usernameUser = user;
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
  if (req.usernameUser && req.usernameUser.profile) {
    return res.status(HTTP_OK).json(req.usernameUser.profile);
  }
  return res.status(HTTP_INTERNAL_ERROR).send(HTTP_INTERNAL_ERROR_MESSAGE);
}

export async function updateProfile(req, res) {
  const username : string = req.params.username;
  // Workaround for kysely weirdness I can't figure out
  const profileUpdate : IUser = {
    id: undefined,
    username: undefined,
    email: undefined,
    profile: req.body
  };

  return new Promise((resolve) => {
    db.updateUserProfileByUsername(username, profileUpdate).then((updatedUser) => {
      resolve(res.status(HTTP_OK).json(updatedUser.profile));
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    });
  });
}

export async function getContributionsForUser(req, res) {
  const userId : string = req.usernameUser.id;

  return new Promise((resolve) => {
    db.getUserContributions(userId, req.query as IUserContributionQueryParams).then((contributions) => {
      resolve(res.status(HTTP_OK).json(contributions));
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  })
}
