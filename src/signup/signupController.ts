import {ISignupRequest} from "./types";
import {IProfile} from "../profiles/types";
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
import { Auth } from "../db/types";

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

  try {
    // Create user in database
    const newUser : IUser = {
      id: generateUserId(),
      username: signupRequest.username,
      email: signupRequest.user_credentials.email,
      profile: {
        full_name: "",
        picture_link: URL_DEFAULT_PROFILE_PICTURE
      } as IProfile
    };
    const dbUser = await db.createUser(newUser);
    if (dbUser === undefined || dbUser === null) {
      throw new Error("Failed to create user");
    }

    // Create password in database
    const hash = await hashPass(signupRequest.user_credentials.password);
    const auth : Auth = {
      user_id: dbUser.id,
      hash_pass: hash.hash_pass,
      hash_salt: hash.hash_salt
    };
    const dbAuth = await db.createAuth(auth);
    if (dbAuth === undefined || dbAuth === null) {
      throw new Error("Failed to create auth");
    }

    return res.sendStatus(HTTP_OK);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}
