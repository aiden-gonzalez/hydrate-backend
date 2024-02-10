import {ISignupRequest} from "./types";
import {IUserProfile} from "../profiles/types";
import {
  ERROR_USER_ALREADY_EXISTS,
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_ERROR,
  HTTP_OK,
  URL_DEFAULT_PROFILE_PICTURE
} from "../utils/constants";
import {User} from "../mongoDB";
import {hashPass} from "../utils/auth";
import {generateUserId} from "../utils/generate";

export async function createAccount(req, res) {
  // Get signup info
  const signupRequest : ISignupRequest = req.json();

  // Check if user already exists (based on username)
  const dbUser = await User.findOne({username: signupRequest.username}).exec();
  if (dbUser !== null) {
    return res.status(HTTP_FORBIDDEN).send(ERROR_USER_ALREADY_EXISTS);
  }

  // Create user in database
  const newUserProfile : IUserProfile = {
    full_name: "",
    picture_link: URL_DEFAULT_PROFILE_PICTURE
  }
  const newUser = new User({
    id: generateUserId(),
    username: signupRequest.username,
    email: signupRequest.user_credentials.email,
    profile: newUserProfile,
    hashed_password: await hashPass(signupRequest.user_credentials.password)
  });

  try {
    await newUser.save();
    return res.status(HTTP_OK).send(newUser);
  } catch (error) {
    return res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}
