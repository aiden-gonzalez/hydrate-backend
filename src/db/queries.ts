import { db } from './database';
import {Fob, FobUpdate, NewFob} from './types';
import {IFob, IFobQueryParams} from "../fobs/types";

// FOUNTAIN OR BATHROOM (FOB)
export function createFob(fob: NewFob) : Promise<Fob> {
  return db.insertInto('fob').values(fob).returningAll().executeTakeFirstOrThrow();
}

export function getFob(id: string) : Promise<Fob> {
  return db.selectFrom('fob').where('id', '=', id).selectAll().executeTakeFirst();
}

/** @description Filter fountains by bottle_filler property */
bottle_filler?: boolean;
/** @description Radius to fetch fountains within (in meters) */
radius?: number;
/** @description ID of user that created the fountain(s) */
user_id?: string;
/** @description Filter fountains to those created on or after this date.  Unix epoch milliseconds timestamp. */
from_date?: number;
/** @description Filter fountains to those created before or on this date.  Unix epoch milliseconds timestamp. */
to_date?: number;

export function findFobs(params : IFobQueryParams) : Promise<Fob[]> {
  let query = db.selectFrom('fob');

  if (params.latitude && params.longitude) {
    query = query.where('location', '@@', '$.latitude '); // Kysely is immutable, must re-assign
  }

  if (criteria.user_id) {
    query = query.where('user_id', '=', criteria.user_id);
  }

  if (criteria.info)
}

export async function findPeople(criteria: Partial<Person>) {
  let query = db.selectFrom('person')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id) // Kysely is immutable, you must re-assign!
  }

  if (criteria.first_name) {
    query = query.where('first_name', '=', criteria.first_name)
  }

  if (criteria.last_name !== undefined) {
    query = query.where(
      'last_name',
      criteria.last_name === null ? 'is' : '=',
      criteria.last_name
    )
  }

  if (criteria.gender) {
    query = query.where('gender', '=', criteria.gender)
  }

  if (criteria.created_at) {
    query = query.where('created_at', '=', criteria.created_at)
  }

  return await query.selectAll().execute()
}

export function updateFob(id: string, updateWith: FobUpdate) : Promise<Fob> {
  return db.updateTable('fob').set(updateWith).where('id', '=', id).returningAll().executeTakeFirst();
}

export function deleteFob(id: string) : Promise<Fob> {
  return db.deleteFrom('fob').where('id', '=', id).returningAll().executeTakeFirst();
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
// TODO if you can think of a way to make things more generic without ruining it, try to bring these back.
// TODO Otherwise, leave them where they came from. Probably for the best.
// function createEntity<Type>(entityModel : Model<Type>, entityDetails : Type) : Promise<Type> {
//   return new Promise((resolve, reject) => {
//     const entityDoc = new entityModel(entityDetails);
//     entityDoc.save().then((createdEntity) => {
//       resolve(getCleanObjectWithTimestamps(createdEntity));
//     }).catch((error) => {
//       reject(error);
//     });
//   });
// }
//
// function fetchEntity<Type>(table : string, query : any) : Promise<Type> {
//   return new Promise((resolve, reject) => {
//     entityModel.findOne(query).lean().exec().then((dbEntity) => {
//       if (dbEntity !== null) {
//         resolve(cleanEntityIdWithTimestamps(dbEntity));
//       } else {
//         resolve(null);
//       }
//     }).catch((error) => {
//       reject(error);
//     });
//   });
// }
//
// function queryEntities<Type>(entityModel : Model<Type>, query : any) : Promise<Type[]> {
//   return new Promise((resolve, reject) => {
//     entityModel.find(query).lean().exec().then((dbEntities) => {
//       resolve(dbEntities.map((entity) => cleanEntityIdWithTimestamps(entity)));
//     }).catch((error) => {
//       reject(error);
//     })
//   });
// }
//
// function updateEntity<Type>(entityModel: Model<Type>, filter : any, update : any) : Promise<Type> {
//   return new Promise((resolve, reject) => {
//     entityModel.findOneAndUpdate(
//       filter,
//       update,
//       { new: true }
//     ).lean().exec().then((updatedEntity) => {
//       if (updatedEntity !== null) {
//         resolve(cleanEntityIdWithTimestamps(updatedEntity));
//       } else {
//         resolve(null);
//       }
//     }).catch((error) => {
//       reject(error);
//     });
//   });
// }
//
// function deleteEntity<Type>(entityModel: Model<Type>, query : any) : Promise<void> {
//   return new Promise((resolve, reject) => {
//     entityModel.deleteOne(query).lean().exec().then(() => {
//       resolve();
//     }).catch((error) => {
//       reject(error);
//     })
//   })
// }
