import {components} from "../../schema";

export type IHashedPassword = components["schemas"]["HashedPassword"];
export type ILocation = components["schemas"]["Location"];
export type IUser = components["schemas"]["User"];
export function dbUserToIUser (dbUser) : IUser {
  if (dbUser === null) {
    return null;
  }
  return {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    hashed_password: {
      hash_pass: dbUser.hashed_password.hash_pass,
      hash_salt: dbUser.hashed_password.hash_salt
    },
    profile: {
      full_name: dbUser.profile.full_name,
      picture_link: dbUser.profile.picture_link
    }
  };
}
export type IPicture = components["schemas"]["Picture"];
