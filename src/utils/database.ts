import {User, Picture} from "../mongoDB";
import { IUserProfile } from "../profiles/types";
import { IPicture, IUser } from "./types";
import {Model} from "mongoose";
import {IFountainQueryParams} from "../fountains/types";
import {
  IDbFob,
  iDbFobToIFob,
  IFob,
  IFobInfo,
  iFobInfoToIDbFobInfo,
  IFobRating,
  IFobRatingDetails,
  iFobToIDbFob
} from "../fobs/types";
import {IBathroomQueryParams} from "../bathrooms/types";

// FOUNTAIN OR BATHROOM (FOB)
export async function createFob(fobModel : Model<IDbFob>, fob : IFob) : Promise<IFob> {
  return cleanEntityId<IFob>(iDbFobToIFob(await createEntity<IDbFob>(fobModel, iFobToIDbFob(fob))), "info");
}

export async function getFob(fobModel : Model<IDbFob>, fobId : string) : Promise<IFob> {
  return cleanEntityId<IFob>(iDbFobToIFob(await fetchEntity<IDbFob>(fobModel, { id: fobId })), "info");
}

export async function updateFobById(fobModel : Model<IDbFob>, fobId : string, fobInfo : IFobInfo) : Promise<IFob> {
  return cleanEntityId<IFob>(iDbFobToIFob(await updateEntity<IDbFob>(fobModel, { id: fobId }, { info: iFobInfoToIDbFobInfo(fobInfo) })), "info");
}

export async function queryFob(fobModel : Model<IDbFob>, queryParams : IFountainQueryParams | IBathroomQueryParams) : Promise<Array<IFob>> {
  const mongoQuery = {};
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
  for (const key in queryParams) {
    if (key != "latitude" && key != "longitude" && key != "radius" && queryParams[key] != undefined) {
      mongoQuery["info." + key] = queryParams[key];
    }
  }

  return cleanArrayEntityId<IFob>((await queryEntities<IDbFob>(fobModel, mongoQuery)).map((dbFob : IDbFob) => iDbFobToIFob(dbFob)), "info");
}

// RATINGS
export async function createRating(ratingModel : Model<IFobRating>, rating: IFobRating) : Promise<IFobRating> {
  return cleanEntityId<IFobRating>(await createEntity<IFobRating>(ratingModel, rating), "details");
}

export async function getRatings(ratingModel : Model<IFobRating>, entityId : string) : Promise<IFobRating[]> {
  const ratings = await queryEntities<IFobRating>(ratingModel, { $or: [ { fountain_id: entityId }, { bathroom_id: entityId } ] });
  for (const rating in ratings) {
    cleanEntityId<IFobRating>(ratings[rating], "details");
  }
  return ratings;
}

export async function getRating(ratingModel : Model<IFobRating>, ratingId : string) : Promise<IFobRating> {
  return cleanEntityId<IFobRating>(await fetchEntity<IFobRating>(ratingModel, { id: ratingId }), "details");
}

export async function updateRatingById(ratingModel : Model<IFobRating>, ratingId : string, ratingDetails : IFobRatingDetails) : Promise<IFobRating> {
  return cleanEntityId<IFobRating>(await updateEntity<IFobRating>(ratingModel, { id: ratingId }, {details: ratingDetails}), "details");
}

// USER
export async function createUser(user : IUser) : Promise<IUser> {
  return cleanEntityId<IUser>(await createEntity<IUser>(User, user), "profile");
}

export async function fetchUserById (userId: string) : Promise<IUser> {
  return cleanEntityId<IUser>(await fetchEntity<IUser>(User, { id: userId }), "profile");
}

export async function fetchUserByUsername (username: string) : Promise<IUser> {
  return cleanEntityId<IUser>(await fetchEntity<IUser>(User, { username: username }), "profile");
}

export async function fetchUserByEmail (email: string) : Promise<IUser> {
  return cleanEntityId<IUser>(await fetchEntity<IUser>(User, { email: email }), "profile");
}

export async function updateUserProfileByUsername (username: string, profile: IUserProfile) : Promise<IUserProfile> {
  return cleanEntityId<IUser>(await updateEntity<IUser>(User, {username: username}, {profile: profile}), "profile").profile;
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

// Array version of cleanEntityId
function cleanArrayEntityId<Type>(entities : Type[], propertyName? : string) : Type[] {
  if (entities === null) return null;

  for (let i = 0; i < entities.length; i++) {
    cleanEntityId<Type>(entities[i], propertyName);
  }
  return entities;
}

// Removes mongo ID from specified property of entity
function cleanEntityId<Type>(entity : any, propertyName? : string) : Type {
  if (entity === null) return null;

  if (propertyName === null && entity.hasOwnProperty('_id')) {
    delete entity._id;
  } else if (entity[propertyName] && entity[propertyName].hasOwnProperty('_id')) {
    delete entity[propertyName]._id;
  }
  return entity;
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
