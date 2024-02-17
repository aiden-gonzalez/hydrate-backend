import {ISignupRequest} from "./types";
import {IUserProfile} from "../profiles/types";
import { IUser } from "../utils/types";
import {
  ERROR_USER_ALREADY_EXISTS,
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_ERROR,
  HTTP_OK,
  URL_DEFAULT_PROFILE_PICTURE
} from "../utils/constants";
import {hashPass} from "../utils/auth";
import {generateUserId} from "../utils/generate";
import * as database from "../utils/database";

export async function createAccount(req, res) {
  // Get signup info
  const signupRequest : ISignupRequest = req.json();

  // Check if user already exists (based on username)
  const dbUser = await database.fetchUserByUsername(signupRequest.username);
  if (dbUser !== null) {
    return res.status(HTTP_FORBIDDEN).send(ERROR_USER_ALREADY_EXISTS);
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

  database.createUser(newUser).then((createdUser) => {
    return res.status(HTTP_OK).send(createdUser);
  }).catch((error) => {
    return res.status(HTTP_INTERNAL_ERROR).send(error);
  });
}
