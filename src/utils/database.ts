import {Fountain, FountainRating, User, Picture, IDbFountain} from "../mongoDB";
import { IUserProfile } from "../profiles/types";
import { IPicture, IUser } from "./types";
import {Model} from "mongoose";
import {
  IFountain,
  IFountainQueryParams,
  IFountainRating,
  iDbFountainToIFountain,
  iFountainToIDbFountain,
  IFountainInfo, IFountainRatingDetails, iFountainInfoToIDbFountainInfo
} from "../fountains/types";

// FOUNTAIN
export async function createFountain(fountain : IFountain) : Promise<IFountain> {
  return iDbFountainToIFountain(await createEntity<IDbFountain>(Fountain, iFountainToIDbFountain(fountain)));
}


export async function queryFountains(queryParams : IFountainQueryParams) : Promise<Array<IFountain>> {
  const mongoQuery = {};
  if (queryParams.bottle_filler) {
    mongoQuery["info.bottle_filler"] = queryParams.bottle_filler;
  }
  if (queryParams.latitude && queryParams.longitude) {
    mongoQuery["info.location"] = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [queryParams.longitude, queryParams.latitude]
        }
      }
    };
    if (queryParams.radius) {
      mongoQuery["info.location"]["$near"]["$maxDistance"] = queryParams.radius;
    }
  }

  return (await queryEntities<IDbFountain>(Fountain, mongoQuery)).map((dbFountain : IDbFountain) => iDbFountainToIFountain(dbFountain));
}

export async function getFountain(fountainId : string) : Promise<IFountain> {
  return iDbFountainToIFountain(await fetchEntity<IDbFountain>(Fountain, { id: fountainId }));
}

export async function updateFountainById(fountainId : string, fountainInfo : IFountainInfo) : Promise<IFountain> {
  return iDbFountainToIFountain(await updateEntity<IDbFountain>(Fountain, { id: fountainId }, { info: iFountainInfoToIDbFountainInfo(fountainInfo) }))
}

// FOUNTAIN RATING
export async function getFountainRatings(fountainId : string) : Promise<IFountainRating[]> {
  const fountainRatings = await queryEntities<IFountainRating>(FountainRating, { fountain_id: fountainId });
  for (const rating in fountainRatings) {
    cleanFountainRatingDetails(fountainRatings[rating]);
  }
  return fountainRatings;
}

export async function getFountainRating(ratingId : string) : Promise<IFountainRating> {
  return cleanFountainRatingDetails(await fetchEntity<IFountainRating>(FountainRating, { id: ratingId }));
}

export async function createFountainRating(fountainRating: IFountainRating) : Promise<IFountainRating> {
  return cleanFountainRatingDetails(await createEntity<IFountainRating>(FountainRating, fountainRating))
}

export async function updateFountainRatingById(ratingId : string, ratingDetails : IFountainRatingDetails) : Promise<IFountainRating> {
  return cleanFountainRatingDetails(await updateEntity<IFountainRating>(FountainRating, { id: ratingId }, {details: ratingDetails}));
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

export function getPictureById(pictureId: string) : Promise<IPicture> {
  return fetchEntity<IPicture>(Picture, { id: pictureId });
}

export function getPictures(entityId : string) : Promise<IPicture[]> {
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
function queryEntities<Type>(entityModel : Model<Type>, query : any) : Promise<Type[]> {
  return new Promise((resolve, reject) => {
    entityModel.find(query).exec().then((dbEntities) => {
      resolve(dbEntities.map((entity) => getCleanObject(entity)));
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

  if (user.profile && user.profile.hasOwnProperty('_id')) {
    delete user.profile._id;
  }
  return user;
}

// Removes fountain rating details mongo ID
function cleanFountainRatingDetails(fountainRating : any) : IFountainRating {
  if (fountainRating === null) return null;

  if (fountainRating.details && fountainRating.details.hasOwnProperty('_id')) {
    delete fountainRating.details._id;
  }
  return fountainRating;
}

// Returns an object with the top-level mongo ID removed
function getCleanObject(mongoObject : any) : any {
  if (mongoObject === null) return null;

  const entityObject = mongoObject.toObject();
  if (entityObject && entityObject.hasOwnProperty('_id')) {
    delete entityObject._id;
  }
  if (entityObject && entityObject.hasOwnProperty('__v')) {
    delete entityObject.__v;
  }
  return entityObject;
}
