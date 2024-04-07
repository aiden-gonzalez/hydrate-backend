import {Fountain, User, Picture, IDbFountain, IDbBathroom} from "../mongoDB";
import { IUserProfile } from "../profiles/types";
import { IPicture, IUser } from "./types";
import {Model} from "mongoose";
import {
  IFountain,
  IFountainQueryParams,
  iDbFountainToIFountain,
  IFountainInfo, iFountainInfoToIDbFountainInfo
} from "../fountains/types";
import { iDbFobToIFob, iFobToIDbFob } from "../fobs/types";
import { IBathroom } from "../bathrooms/types";

// FOUNTAIN
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

// FOUNTAIN OR BATHROOM (FOB)
export async function createFob<Type extends IFountain | IBathroom, DbType extends IDbFountain | IDbBathroom>(fobModel : Model<DbType>, fob : Type) : Promise<Type> {
  return iDbFobToIFob<DbType, Type>(await createEntity<DbType>(fobModel, iFobToIDbFob<Type, DbType>(fob)));
}

// RATINGS
export async function createRating<Type>(ratingModel : Model<Type>, rating: Type) : Promise<Type> {
  return cleanRatingDetails<Type>(await createEntity<Type>(ratingModel, rating));
}

export async function getRatings<Type>(ratingModel : Model<Type>, entityId : string) : Promise<Type[]> {
  const ratings = await queryEntities<Type>(ratingModel, { $or: [ { fountain_id: entityId }, { bathroom_id: entityId } ] });
  for (const rating in ratings) {
    cleanRatingDetails<Type>(ratings[rating]);
  }
  return ratings;
}

export async function getRating<Type>(ratingModel : Model<Type>, ratingId : string) : Promise<Type> {
  return cleanRatingDetails(await fetchEntity<Type>(ratingModel, { id: ratingId }));
}

export async function updateRatingById<Type>(ratingModel : Model<Type>, ratingId : string, ratingDetails : any) : Promise<Type> {
  return cleanRatingDetails<Type>(await updateEntity<Type>(ratingModel, { id: ratingId }, {details: ratingDetails}));
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

// Removes rating details mongo ID
function cleanRatingDetails<Type>(rating : any) : Type {
  if (rating === null) return null;
  
  if (rating.details && rating.details.hasOwnProperty('_id')) {
    delete rating.details._id
  }

  return rating;
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
