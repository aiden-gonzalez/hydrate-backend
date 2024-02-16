import { User } from "../mongoDB";
import { IUser, dbUserToIUser } from "./types";

async function fetchUser(query) : Promise<IUser> {
  const dbUser = await User.findOne(query).exec();
  if (dbUser == null) {
    return null;
  }
  return dbUserToIUser(dbUser);
}

export function fetchUserById (userId: string) : Promise<IUser> {
  return fetchUser({ id: userId });
}

export function fetchUserByUsername (username: string) : Promise<IUser> {
  return fetchUser({ username: username });
}

export function fetchUserByEmail (email: string) : Promise<IUser> {
  return fetchUser({ email: email });
}
