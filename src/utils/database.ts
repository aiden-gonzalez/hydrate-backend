import {User, Picture, Fountain, Bathroom, FountainRating, BathroomRating, IDbFountain} from "../mongoDB";
import {IUserContributionQueryParams, IUserContributions, IUserProfile} from "../profiles/types";
import {IAggregation, IPicture, IUser} from "./types";
import {Model} from "mongoose";
import {IFountainQueryParams} from "../fountains/types";
import {
  IAggregatedFob,
  IAggregatedDbFob,
  IDbFob,
  IFob,
  IFobInfo,
  IFobRating,
  IFobRatingDetails,
  iFobInfoToIDbFobInfo,
  iFobToIDbFob,
  iDbFobToIFob,
  iAggregatedDbFobToIAggregatedFob, isFountain
} from "../fobs/types";
import {IBathroomQueryParams} from "../bathrooms/types";
import {fountainIdValidator} from "./validation";

const propsToClean = ['_id', '__v'];

// FOUNTAIN OR BATHROOM (FOB)
export async function createFob(fobModel : Model<IDbFob>, fob : IFob) : Promise<IFob> {
  return cleanEntityIdWithTimestamps<IFob>(iDbFobToIFob(await createEntity<IDbFob>(fobModel, iFobToIDbFob(fob))), "info");
}

export async function getFob(fobModel : Model<IDbFob>, fobId : string) : Promise<IFob> {
  return cleanEntityIdWithTimestamps<IFob>(iDbFobToIFob(await fetchEntity<IDbFob>(fobModel, { id: fobId })), "info");
}

export async function getAggregatedFob(fobModel : Model<IDbFob>, fobId : string) : Promise<IAggregatedFob> {
  const lookups : IAggregation[] = [
    {
      from: "User",
      local: "user_id",
      foreign: "id",
      as: "user"
    } as IAggregation,
    {
      from: fountainIdValidator(fobId) ? "FountainRating" : "BathroomRating",
      local: "id",
      foreign: fountainIdValidator(fobId) ? "fountain_id" : "bathroom_id",
      as: "ratings"
    } as IAggregation,
    {
      from: "Picture",
      local: "id",
      foreign: "entity_id",
      as: "pictures"
    } as IAggregation
  ]
  return cleanEntityIdWithTimestamps<IAggregatedFob>(iAggregatedDbFobToIAggregatedFob(await fetchAggregatedEntity<IAggregatedDbFob>(fobModel, { id: fobId })), "info");
}

export async function updateFobById(fobModel : Model<IDbFob>, fobId : string, fobInfo : IFobInfo) : Promise<IFob> {
  return cleanEntityIdWithTimestamps<IFob>(iDbFobToIFob(await updateEntity<IDbFob>(fobModel, { id: fobId }, { info: iFobInfoToIDbFobInfo(fobInfo) })), "info");
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
  if (queryParams.user_id) {
    mongoQuery["user_id"] = queryParams.user_id;
  }
  for (const key in queryParams) {
    if (key != "latitude" && key != "longitude" && key != "radius" && key != "user_id" && queryParams[key] != undefined) {
      mongoQuery["info." + key] = queryParams[key];
    }
  }

  return cleanArrayEntityIdWithTimestamps<IFob>((await queryEntities<IDbFob>(fobModel, mongoQuery)).map((dbFob : IDbFob) => iDbFobToIFob(dbFob)), "info");
}

// RATINGS
export async function createRating(ratingModel : Model<IFobRating>, rating: IFobRating) : Promise<IFobRating> {
  return cleanEntityIdWithTimestamps<IFobRating>(await createEntity<IFobRating>(ratingModel, rating), "details");
}

export async function getRatings(ratingModel : Model<IFobRating>, entityId : string) : Promise<IFobRating[]> {
  return cleanArrayEntityIdWithTimestamps<IFobRating>(await queryEntities<IFobRating>(ratingModel, { $or: [ { fountain_id: entityId }, { bathroom_id: entityId } ] }), "details");
}

export async function getRatingsByUser(ratingModel : Model<IFobRating>, userId : string) : Promise<IFobRating[]> {
  return cleanArrayEntityIdWithTimestamps<IFobRating>(await queryEntities<IFobRating>(ratingModel, { user_id: userId }), "details");
}

export async function getRating(ratingModel : Model<IFobRating>, ratingId : string) : Promise<IFobRating> {
  return cleanEntityIdWithTimestamps<IFobRating>(await fetchEntity<IFobRating>(ratingModel, { id: ratingId }), "details");
}

export async function updateRatingById(ratingModel : Model<IFobRating>, ratingId : string, ratingDetails : IFobRatingDetails) : Promise<IFobRating> {
  return cleanEntityIdWithTimestamps<IFobRating>(await updateEntity<IFobRating>(ratingModel, { id: ratingId }, {details: ratingDetails}), "details");
}

// USER
export async function createUser(user : IUser) : Promise<IUser> {
  return cleanEntityIdWithTimestamps<IUser>(await createEntity<IUser>(User, user), "profile");
}

export async function fetchUserById (userId: string) : Promise<IUser> {
  return cleanEntityIdWithTimestamps<IUser>(await fetchEntity<IUser>(User, { id: userId }), "profile");
}

export async function fetchUserByUsername (username: string) : Promise<IUser> {
  return cleanEntityIdWithTimestamps<IUser>(await fetchEntity<IUser>(User, { username: username }), "profile");
}

export async function fetchUserByEmail (email: string) : Promise<IUser> {
  return cleanEntityIdWithTimestamps<IUser>(await fetchEntity<IUser>(User, { email: email }), "profile");
}

export async function updateUserProfileByUsername (username: string, profile: IUserProfile) : Promise<IUserProfile> {
  return cleanEntityIdWithTimestamps<IUser>(await updateEntity<IUser>(User, {username: username}, {profile: profile}), "profile").profile;
}

export async function getUserContributionsById (userId: string, params: IUserContributionQueryParams) : Promise<IUserContributions> {
  return new Promise((resolve, reject) => {
    const promises = [
      queryFob(Fountain, {...{user_id: userId}, ...params} as IFountainQueryParams),
      queryFob(Bathroom, {...{user_id: userId}, ...params} as IBathroomQueryParams),
      getRatingsByUser(FountainRating, userId),
      getRatingsByUser(BathroomRating, userId),
      getPicturesByUser(userId)
    ];

    Promise.all(promises).then((results) => {
      // results[0] will have docs of first query
      // results[1] will have docs of second query
      // and so on...
      const response = {
        fountains: results[0],
        bathrooms: results[1],
        fountain_ratings: results[2],
        bathroom_ratings: results[3],
        pictures: results[4]
      } as IUserContributions;
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  });
}

// PICTURE
export async function createPicture(picture: IPicture) : Promise<IPicture> {
  return cleanEntityIdWithTimestamps<IPicture>(await createEntity<IPicture>(Picture, picture), "info");
}

export async function getPictureById(pictureId: string) : Promise<IPicture> {
  return cleanEntityIdWithTimestamps<IPicture>(await fetchEntity<IPicture>(Picture, { id: pictureId }), "info");
}

export async function getPictures(entityId : string) : Promise<IPicture[]> {
  return cleanArrayEntityIdWithTimestamps<IPicture>(await queryEntities<IPicture>(Picture, { entity_id: entityId }), "info");
}

export async function getPicturesByUser(userId : string) : Promise<IPicture[]> {
  return cleanArrayEntityIdWithTimestamps<IPicture>(await queryEntities<IPicture>(Picture, { user_id: userId }), "info");
}

export function deletePicture(pictureId: string) : Promise<void> {
  return deleteEntity<IPicture>(Picture, { id: pictureId });
}

// GENERIC
function createEntity<Type>(entityModel : Model<Type>, entityDetails : Type) : Promise<Type> {
  return new Promise((resolve, reject) => {
    const entityDoc = new entityModel(entityDetails);
    entityDoc.save().then((createdEntity) => {
      resolve(getCleanObjectWithTimestamps(createdEntity));
    }).catch((error) => {
      reject(error);
    });
  });
}

function fetchEntity<Type>(entityModel : Model<Type>, query : any) : Promise<Type> {
  return new Promise((resolve, reject) => {
    entityModel.findOne(query).lean().exec().then((dbEntity) => {
      if (dbEntity !== null) {
        resolve(cleanEntityIdWithTimestamps(dbEntity));
      } else {
        resolve(null);
      }
    }).catch((error) => {
      reject(error);
    });
  });
}

function fetchAggregatedEntity<Type>(entityModel : Model<Type>, query : any, aggregates : any[]) : Promise<Type> {
  return new Promise((resolve, reject) => {
    entityModel.aggregate([...aggregates.map(function (ag) {
      return {
        $lookup: {
          from: ag.from,
          localField: ag.local,
          foreignField: ag.foreign,
          as: ag.as
        },
      };
    }), ...[{ $match: query }]]).exec().then((aggregatedDbEntities) => {
      if (aggregatedDbEntities.length == 0) {
        resolve(null);
      } else {
        resolve(cleanEntityIdWithTimestamps(aggregatedDbEntities[0]));
      }
    }).catch((error) => {
      reject(error);
    })
  });
}

function queryEntities<Type>(entityModel : Model<Type>, query : any) : Promise<Type[]> {
  return new Promise((resolve, reject) => {
    entityModel.find(query).lean().exec().then((dbEntities) => {
      resolve(dbEntities.map((entity) => cleanEntityIdWithTimestamps(entity)));
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
    ).lean().exec().then((updatedEntity) => {
      if (updatedEntity !== null) {
        resolve(cleanEntityIdWithTimestamps(updatedEntity));
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
    entityModel.deleteOne(query).lean().exec().then(() => {
      resolve();
    }).catch((error) => {
      reject(error);
    })
  })
}

// Array version of cleanEntityIdWithTimestamps
function cleanArrayEntityIdWithTimestamps<Type>(entities : Type[], propertyName? : string) : Type[] {
  if (entities === null) return null;

  for (let i = 0; i < entities.length; i++) {
    cleanEntityIdWithTimestamps<Type>(entities[i], propertyName);
  }
  return entities;
}

// Removes mongo ID from specified property of entity
function cleanEntityIdWithTimestamps<Type>(entity : any, propertyName? : string) : Type {
  if (entity === null) return null;

  for (const prop of propsToClean) {
    if ((propertyName === null || propertyName === undefined) && entity.hasOwnProperty(prop)) {
      delete entity[prop];
    } else if (entity[propertyName] && entity[propertyName].hasOwnProperty(prop)) {
      delete entity[propertyName][prop];
    }
  }

  return processTimestamps(entity);
}

// Returns an object with the top-level mongo ID removed
function getCleanObjectWithTimestamps(mongoObject : any) : any {
  if (mongoObject === null || mongoObject === undefined) return mongoObject;

  const entityObject = mongoObject.toObject();
  for (const prop of propsToClean) {
    if (entityObject && entityObject.hasOwnProperty(prop)) {
      delete entityObject[prop];
    }
  }

  return processTimestamps(entityObject);
}

function processTimestamps(entity : any) : any {
  if (entity === null || entity === undefined) return entity;

  if (entity && entity.hasOwnProperty("createdAt")) {
    entity.created_at = (entity.createdAt as Date).getTime();
    delete entity.createdAt;
  }
  if (entity && entity.hasOwnProperty("updatedAt")) {
    entity.updated_at = (entity.updatedAt as Date).getTime();
    delete entity.updatedAt;
  }

  return entity;
}
