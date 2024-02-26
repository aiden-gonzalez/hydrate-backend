import {Fountain, User} from "../mongoDB";
import { IUserProfile } from "../profiles/types";
import { IUser } from "./types";
import {Model} from "mongoose";
import {IFountain, IFountainInfo} from "../fountains/types";
import {generateFountainId} from "./generate";

// FOUNTAIN
export function createFountain(fountainInfo : IFountainInfo) : Promise<IFountain> {
  const fountain : IFountain = {
    id: generateFountainId(),
    info: fountainInfo
  }
  return createEntity<IFountain>(Fountain, fountain);
}

// USER
export async function createUser(user : IUser) : Promise<IUser> {
  return cleanUserProfile(await createEntity<IUser>(User, user));
}

export async function fetchUserById (userId: string) : Promise<IUser> {
  return cleanUserProfile(await fetchEntity<IUser>(User, { id: userId }));
}

export async function fetchUserByUsername (username: string) : Promise<IUser> {
  return cleanUserProfile(await fetchEntity<IUser>(User, { username: username }));
}

export async function fetchUserByEmail (email: string) : Promise<IUser> {
  return cleanUserProfile(await fetchEntity<IUser>(User, { email: email }));
}

export async function updateUserProfileByUsername (username: string, profile: IUserProfile) : Promise<IUserProfile> {
  return cleanUserProfile(await updateEntity<IUser>(User, {username: username}, {profile: profile})).profile;
}

// GENERIC
function createEntity<Type>(entityModel : Model<Type>, entityDetails : Type) : Promise<Type> {
  return new Promise((resolve, reject) => {
    const entityDoc = new entityModel(entityDetails);
    entityDoc.save().then((createdEntity) => {
      resolve(getCleanObject(createdEntity));
    }).catch((error) => {
      reject(error);
    });
  });
}

function fetchEntity<Type>(entityModel : Model<Type>, query : any) : Promise<Type> {
  return new Promise((resolve, reject) => {
    entityModel.findOne(query).exec().then((dbEntity) => {
      if (dbEntity !== null) {
        resolve(getCleanObject(dbEntity));
      } else {
        resolve(null);
      }
    }).catch((error) => {
      reject(error);
    });
  });
}

function updateEntity<Type>(entityModel: Model<Type>, filter : any, update : any) : Promise<Type> {
  return new Promise((resolve, reject) => {
    entityModel.findOneAndUpdate(
      filter,
      update,
      { new: true }
    ).exec().then((updatedEntity) => {
      if (updatedEntity !== null) {
        resolve(getCleanObject(updatedEntity));
      } else {
        resolve(null);
      }
    }).catch((error) => {
      reject(error);
    });
  });
}

// Removes user profile mongo ID
function cleanUserProfile(user : any) : IUser {
  if (user === null) return null;

  if (user.profile && user.profile._id) {
    delete user.profile._id;
  }
  return user;
}

// Returns an object with the top-level mongo ID removed
function getCleanObject(mongoObject : any) : any {
  if (mongoObject === null) return null;

  const entityObject = mongoObject.toObject();
  if (entityObject && entityObject._id) {
    delete entityObject._id;
  }
  return entityObject;
}
