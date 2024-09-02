import { db } from './database';
import {
  Fob,
  FobUpdate,
  NewFob, NewPicture,
  NewRating,
  NewUser, Picture,
  Rating,
  RatingUpdate,
  User,
  UserContributions,
  UserProfileUpdate
} from './types';
import {IFobQueryParams} from "../fobs/types";
import {sql} from "kysely";
import {calculateLocationAtDistance} from "../utils/calculation";
import {ILocation} from "../utils/types";
import {IUserContributionQueryParams} from "../profiles/types";

// FOUNTAIN OR BATHROOM (FOB)
export function createFob(fob: NewFob) : Promise<Fob> {
  return db.insertInto('fob').values(fob).returningAll().executeTakeFirstOrThrow();
}

export function getFob(id: string) : Promise<Fob> {
  return db.selectFrom('fob').where('id', '=', id).selectAll().executeTakeFirst();
}

export function findFobs(params : IFobQueryParams) : Promise<Fob[]> {
  let query = db.selectFrom('fob');

  if (params.latitude && params.longitude) {
    if (!params.radius) {
      // 1 kilometer default radius
      params.radius = 1000;
    }
    const start : ILocation = {
      latitude: params.latitude,
      longitude: params.longitude
    };
    const botLeft = calculateLocationAtDistance(start, params.radius, 225);
    const topRight = calculateLocationAtDistance(start, params.radius, 45);
    query = query.where(sql<boolean>`location->'latitude' between ${botLeft.latitude} and ${topRight.latitude}`);
    query = query.where(sql<boolean>`location->'longitude' between ${botLeft.longitude} and ${topRight.longitude}`);
  }

  if (params.user_id) {
    query = query.where('user_id', '=', params.user_id);  // Kysely is immutable, must re-assign
  }

  if (params.from_date) {
    query = query.where('created_at', '>=', new Date(params.from_date));
  }

  if (params.to_date) {
    query = query.where('created_at', '<=', new Date(params.to_date));
  }

  return query.selectAll().execute();
}

export function updateFob(id: string, updateWith: FobUpdate) : Promise<Fob> {
  return db.updateTable('fob').set(updateWith).where('id', '=', id).returningAll().executeTakeFirst();
}

export function deleteFob(id: string) : Promise<Fob> {
  return db.deleteFrom('fob').where('id', '=', id).returningAll().executeTakeFirst();
}

// RATINGS
export function createRating(rating: NewRating) : Promise<Rating> {
  return db.insertInto('rating').values(rating).returningAll().executeTakeFirstOrThrow();
}

export function getRating(id: string) : Promise<Rating> {
  return db.selectFrom('rating').where('id', '=', id).selectAll().executeTakeFirst();
}

export function getRatingsForFob(fobId: string) : Promise<Rating[]> {
  return db.selectFrom('rating').where('fob_id', '=', fobId).selectAll().execute();
}

export function getRatingsByUser(userId: string) : Promise<Rating[]> {
  return db.selectFrom('rating').where('user_id', '=', userId).selectAll().execute();
}

export function updateRating(id: string, updateWith: RatingUpdate) : Promise<Rating> {
  return db.updateTable('rating').set(updateWith).where('id', '=', id).returningAll().executeTakeFirst();
}

// USER
export function createUser(user: NewUser) : Promise<User> {
  return db.insertInto('user').values(user).returningAll().executeTakeFirstOrThrow();
}

export function getUserById(id: string) : Promise<User> {
  return db.selectFrom('user').where('id', '=', id).selectAll().executeTakeFirst();
}

export function getUserByUsername(username: string) : Promise<User> {
  return db.selectFrom('user').where('username', '=', username).selectAll().executeTakeFirst();
}

export function getUserByEmail(email: string) : Promise<User> {
  return db.selectFrom('user').where('email', '=', email).selectAll().executeTakeFirst();
}

export function updateUserProfileByUsername(username: string, profile : UserProfileUpdate) : Promise<User> {
  return db.updateTable('user').set({profile: profile}).where('username', '=', username).returningAll().executeTakeFirst();
}

export function getUserContributions(userId: string, params: IUserContributionQueryParams) : Promise<UserContributions> {
  return new Promise((resolve, reject) => {
    const promises = [
      findFobs({...{user_id: userId}, ...params} as IFobQueryParams),
      getRatingsByUser(userId),
      getPicturesByUser(userId)
    ];

    Promise.all(promises).then((results) => {
      // results[0] will have the results of the first query
      // results[1] will have the results of the second query
      // and so on...
      const response = {
        fobs: results[0],
        ratings: results[1],
        pictures: results[2]
      } as UserContributions;
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  });
}

// PICTURE
export function createPicture(picture: NewPicture) : Promise<Picture> {
  return db.insertInto('picture').values(picture).returningAll().executeTakeFirstOrThrow();
}

export function getPictureById(id: string) : Promise<Picture> {
  return db.selectFrom('picture').where('id', '=', id).selectAll().executeTakeFirst();
}

export function getPicturesForEntity(entityId: string) : Promise<Picture[]> {
  return db.selectFrom('picture').where('entity_id', '=', entityId).selectAll().execute();
}

export function getPicturesByUser(userId: string) : Promise<Picture[]> {
  return db.selectFrom('picture').where('user_id', '=', userId).selectAll().execute();
}

export function deletePicture(id: string) : Promise<Picture> {
  return db.deleteFrom('picture').where('id', '=', id).returningAll().executeTakeFirst();
}
