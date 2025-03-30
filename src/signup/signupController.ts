import {ISignupRequest} from "./types";
import {IUserProfile} from "../profiles/types";
import { IUser } from "../utils/types";
import {
  ERROR_USER_WITH_EMAIL_ALREADY_EXISTS,
  ERROR_USER_WITH_USERNAME_ALREADY_EXISTS,
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_ERROR,
  HTTP_OK,
  URL_DEFAULT_PROFILE_PICTURE
} from "../utils/constants";
import {hashPass} from "../utils/auth";
import {generateUserId} from "../utils/generate";
import * as db from "../db/queries";

export async function createAccount(req, res) {
  // Get signup info
  const signupRequest : ISignupRequest = req.body;

  // Check if user already exists by username
  const dbUserByUsername = await db.getUserByUsername(signupRequest.username);
  if (dbUserByUsername !== undefined) {
    return res.status(HTTP_FORBIDDEN).send(ERROR_USER_WITH_USERNAME_ALREADY_EXISTS);
  }

  // Check if user already exists by email
  const dbUserByEmail = await db.getUserByEmail(signupRequest.user_credentials.email);
  if (dbUserByEmail !== undefined) {
    return res.status(HTTP_FORBIDDEN).send(ERROR_USER_WITH_EMAIL_ALREADY_EXISTS);
  }

  // Create user in database
  const newUser = {
    id: generateUserId(),
    username: signupRequest.username,
    email: signupRequest.user_credentials.email,
    profile: {
      full_name: "",
      picture_link: URL_DEFAULT_PROFILE_PICTURE
    } as IUserProfile,
    hashed_password: await hashPass(signupRequest.user_credentials.password)
  } as IUser;

  return new Promise((resolve) => {
    db.createUser(newUser).then((createdUser) => {
      resolve(res.status(HTTP_OK).send(createdUser));
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    });
  });
}
