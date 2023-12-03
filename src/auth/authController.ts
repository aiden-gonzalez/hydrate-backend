import {generateToken, isValidPass, validateToken} from "../utils/auth";
import { User } from "../mongoDB";
import {IAuthRefreshRequest, IAuthRequest, IAuthSuccessResponse} from "./types";
import {dbUserToIUser, IUser} from "../utils/types";
import * as constants from "../utils/constants";

export async function findUser (req, res, next) {
  // Get auth info
  const authRequest : IAuthRequest = req.json();

  // Find user in database
  const dbUser = await User.findOne({ email: authRequest.user_credentials.email }).exec();
  if (dbUser === null) {
    res.status(constants.HTTP_UNAUTHORIZED).send(constants.HTTP_UNAUTHORIZED_MESSAGE);
  } else {
    req.user = dbUserToIUser(dbUser);
    next();
  }
}

export async function validatePassword (req, res) {
  // Get auth info and user from request
  const authRequest : IAuthRequest = req.json();
  const user : IUser = req.user;

  // Check password
  const passwordValid = await isValidPass(authRequest.user_credentials.password, user.hashed_password);
  if (!passwordValid) {
    res.status(constants.HTTP_UNAUTHORIZED).send(constants.HTTP_UNAUTHORIZED_MESSAGE);
  } else {
    // Send tokens
    res.status(constants.HTTP_OK).send(getAuthSuccessResponse(user));
  }
}

export function validateRefresh(req, res) {
  // Get refresh token from request
  const refreshRequest : IAuthRefreshRequest = req.json();

  // Validate token
  validateToken(refreshRequest.refresh_token).then((user: IUser) => {
    // Send new tokens
    res.status(constants.HTTP_OK).send(getAuthSuccessResponse(user));
  }).catch((error) => {
    res.status(constants.HTTP_UNAUTHORIZED).send(error);
  });
}

function getAuthSuccessResponse(user : IUser) : IAuthSuccessResponse {
  return {
    access_token: generateToken(user, constants.JWT_ACCESS_EXPIRATION),
    refresh_token: generateToken(user, constants.JWT_REFRESH_EXPIRATION),
    token_type: constants.JWT_TYPE,
    expires: constants.JWT_ACCESS_EXPIRATION
  };
}
