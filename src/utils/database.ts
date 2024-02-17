import { User } from "../mongoDB";
import { IUserProfile } from "../profiles/types";
import { IUser, dbUserToIUser } from "./types";

// USER
export function createUser(user : IUser) : Promise<IUser> {
  return new Promise((resolve, reject) => {
    const userDoc = new User(user);
    userDoc.save().then((createdUser) => {
      resolve(dbUserToIUser(createdUser))
    }).catch((error) => {
      reject(error)
    });
  });
}

function fetchUser(query) : Promise<IUser> {
  return new Promise((resolve, reject) => {
    User.findOne(query).exec().then((dbUser) => {
      resolve(dbUserToIUser(dbUser));
    }).catch((error) => {
      reject(error);
    });
  });
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

export function updateUserProfileByUsername (username: string, profile: IUserProfile) : Promise<IUserProfile> {
  return new Promise((resolve, reject) => {
    User.findOneAndUpdate(
      { username: username },
      { profile: profile },
      { new: true }
    ).then((updatedUser) => {
      resolve(dbUserToIUser(updatedUser).profile);
    }).catch((error) => {
      reject(error);
    });
  });
}
