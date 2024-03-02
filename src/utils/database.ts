import {Fountain, FountainRating, User, Picture} from "../mongoDB";
import { IUserProfile } from "../profiles/types";
import { IPicture, IUser } from "./types";
import {Model} from "mongoose";
import {IFountain, IFountainInfo, IFountainQueryParams, IFountainRating} from "../fountains/types";
import {generateFountainId, generatePictureId} from "./generate";

// FOUNTAIN
export function createFountain(fountain : IFountain) : Promise<IFountain> {
  return createEntity<IFountain>(Fountain, fountain);
}

// TODO make function return Promise<Array<IFountain>>
export function queryFountains(queryParams : IFountainQueryParams) : any {
  const mongoQuery = {};
  if (queryParams.bottle_filler) mongoQuery["info"]["bottle_filler"] = queryParams.bottle_filler;
  if (queryParams.latitude && queryParams.longitude) {
    mongoQuery["info"]["location"] = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [queryParams.longitude, queryParams.latitude]
        }
      }
    };
    if (queryParams.radius) {
      mongoQuery["info"]["location"]["$near"]["$maxDistance"] = queryParams.radius;
    }
  }

  return queryEntities<IFountain>(Fountain, mongoQuery);
}

export function getFountain(fountainId : string) : Promise<IFountain> {
  return fetchEntity<IFountain>(Fountain, { id: fountainId });
}

// FOUNTAIN RATING
// TODO make return type Promise<IFountainRating[]>
export function getFountainRatings(fountainId : string) : any {
  return queryEntities<IFountainRating>(FountainRating, { fountain_id: fountainId });
}

export function getFountainRating(ratingId : string) : Promise<IFountainRating> {
  return fetchEntity<IFountainRating>(FountainRating, { id: ratingId });
}

export function createFountainRating(fountainRating: IFountainRating) : Promise<IFountainRating> {
  return createEntity<IFountainRating>(FountainRating, fountainRating);
}

export function updateFountainRatingById(ratingId, ratingDetails) : Promise<IFountainRating> {
  return updateEntity<IFountainRating>(FountainRating, { id: ratingId }, {details: ratingDetails});
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

// PICTURE
export function createPicture(picture: IPicture) : Promise<IPicture> {
  return createEntity<IPicture>(Picture, picture);
}

export function getPicture(pictureId: string) : Promise<IPicture> {
  return fetchEntity<IPicture>(Picture, { id: pictureId });
}

// TODO make function return Promise<IPicture[]>
export function getPictures(entityId : string) : any {
  return queryEntities<IPicture>(Picture, { entity_id: entityId });
}

export function deletePicture(pictureId: string) : Promise<void> {
  return deleteEntity<IPicture>(Picture, { id: pictureId });
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

// TODO finish this function
function queryEntities<Type>(entityModel : Model<Type>, query : any) : Promise<Type> {
  return new Promise((resolve, reject) => {
    entityModel.find(query).exec().then((dbEntities) => {
      console.log(dbEntities);
      resolve(null);
    }).catch((error) => {
      reject(error);
    })
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

function deleteEntity<Type>(entityModel: Model<Type>, query : any) : Promise<void> {
  return new Promise((resolve, reject) => {
    entityModel.deleteOne(query).exec().then(() => {
      resolve();
    }).catch((error) => {
      reject(error);
    })
  })
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
