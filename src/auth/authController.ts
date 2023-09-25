import {generateToken, isValidPass} from "../utils/auth";
import { User } from "../mongoDB";
import { IAuthRequest, IAuthSuccessResponse } from "./types";
import { IUser } from "../utils/types";

export async function validateUser(req, res, next) {
  // Get auth info
  let authRequest : IAuthRequest = req.json();

  // Find user in database
  const knownUser = await User.findOne({ email: authRequest.user_credentials.email }).exec();
  if (knownUser === null) {
    res.status("401").send("Invalid credentials");
  } else {
    req.user = knownUser;
    next();
  }
}

export function validatePassword(req, res, next) {
  // Get auth info and validated user from request
  let authRequest : IAuthRequest = req.json();
  let user : IUser = req.user;

  // Check password
  if (!isValidPass(authRequest.user_credentials.password, user.hashed_password)) {
    res.status("401").send("Invalid credentials");
  }
  next();
}

export function createTokens(req, res) {
  // Get validated user from request
  let user : IUser = req.user;

  // Create tokens
  let access_expiration = 5400;
  let refresh_expiration = 604800;
  let response : IAuthSuccessResponse = {
    access_token: generateToken(user, access_expiration), // expires in 90 minutes
    refresh_token: generateToken(user, refresh_expiration), // expires in 1 week
    token_type: "Bearer",
    expires: access_expiration
  }

  res.status("200").send(response);
}

export function refreshTokens(req, res) {
  return "refreshed token";
}
