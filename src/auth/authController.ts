import {generateToken, isValidPass, validateToken} from "../utils/auth";
import { User } from "../mongoDB";
import {IAuthRefreshRequest, IAuthRequest, IAuthSuccessResponse} from "./types";
import { IUser } from "../utils/types";
import * as constants from "../utils/constants";

export async function validateUser(req, res, next) {
  // Get auth info
  const authRequest : IAuthRequest = req.json();

  // Find user in database
  const knownUser = await User.findOne({ email: authRequest.user_credentials.email }).exec();
  if (knownUser === null) {
    res.status(constants.HTTP_UNAUTHORIZED).send(constants.HTTP_UNAUTHORIZED_MESSAGE);
  } else {
    req.user = knownUser;
    next();
  }
}

export function validatePassword(req, res, next) {
  // Get auth info and validated user from request
  const authRequest : IAuthRequest = req.json();
  const user : IUser = req.user;

  // Check password
  if (!isValidPass(authRequest.user_credentials.password, user.hashed_password)) {
    res.status(constants.HTTP_UNAUTHORIZED).send(constants.HTTP_UNAUTHORIZED_MESSAGE);
  }
  next();
}

export function generateTokens(req, res) {
  // Get validated user from request
  const user : IUser = req.user;

  // Create tokens
  const response : IAuthSuccessResponse = {
    access_token: generateToken(user, constants.JWT_ACCESS_EXPIRATION),
    refresh_token: generateToken(user, constants.JWT_REFRESH_EXPIRATION),
    token_type: constants.JWT_TYPE,
    expires: constants.JWT_ACCESS_EXPIRATION
  }

  res.status(constants.HTTP_OK).send(response);
}

export function validateRefresh(req, res, next) {
  // Get refresh token from request
  const refreshRequest : IAuthRefreshRequest = req.json();

  // Validate token
  validateToken(refreshRequest.refresh_token).then((user: IUser) => {
    req.user = user;
    next();
  }).catch((error) => {
    console.log(error);
    res.status(constants.HTTP_UNAUTHORIZED).send(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });
}
