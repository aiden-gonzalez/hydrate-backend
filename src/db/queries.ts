import { db } from './database';
import {
  Fob,
  FobUpdate,
  NewFob, NewPicture,
  NewRating,
  NewUser, Picture,
  Rating,
  RatingUpdate, RatingWithDetails,
  User,
  UserUpdate
} from './types';
import {
  FobType,
  IFobInfo,
  IFobQueryParams, IRating,
  IRatingDetails, IRatingWithDetails
} from "../fobs/types";
import {sql} from "kysely";
import {calculateLocationAtDistance} from "../utils/calculation";
import {ILocation, IUser} from "../utils/types";
import {IUserContributionQueryParams, IUserContributions} from "../profiles/types";
import * as constants from "../utils/constants";

// FOUNTAIN OR BATHROOM (FOB)
export function createFob(fob: NewFob) : Promise<Fob> {
  // TODO also add entry to fobchange table to record this
  return parseTimestampsPromise(db.insertInto('fob').values(fob as NewFob).returningAll().executeTakeFirstOrThrow());
}

export function getFob(id: string) : Promise<Fob> {
  return parseTimestampsPromise(db.selectFrom('fob').where('id', '=', id).selectAll().executeTakeFirst());
}

export function findFobs(params : IFobQueryParams) : Promise<Fob[]> {
  let query = db.selectFrom('fob_with_rating')

  if(params.type !== undefined) {
    query = query.where('id', 'like', (params.type == FobType.Fountain ? constants.FOUNTAIN_ID_PREFIX : constants.BATHROOM_ID_PREFIX) + '%');
  }

  if (params.latitude !== undefined && params.longitude !== undefined) {
    if (params.radius === undefined) {
      // 1 kilometer default square radius
      params.radius = 1000;
    }
    const start : ILocation = {
      latitude: params.latitude,
      longitude: params.longitude
    };
    const top = calculateLocationAtDistance(start, params.radius, 0);
    const right = calculateLocationAtDistance(start, params.radius, 90);
    const bottom = calculateLocationAtDistance(start, params.radius, 180);
    const left = calculateLocationAtDistance(start, params.radius, 270);
    query = query.where(sql<boolean>`location->'latitude' between ${bottom.latitude} and ${top.latitude}`);
    query = query.where(sql<boolean>`location->'longitude' between ${left.longitude} and ${right.longitude}`);
  }

  if (params.user_id !== undefined) {
    query = query.where('user_id', '=', params.user_id);  // Kysely is immutable, must re-assign
  }

  if (params.from_date !== undefined) {
    query = query.where('created_at', '>=', params.from_date);
  }

  if (params.to_date !== undefined) {
    query = query.where('created_at', '<=', params.to_date);
  }

  // These were removed when the api spec refactor happened. If I find a way to include them again,
  // that'd be pretty nice.
  // if (params.bottle_filler !== undefined) {
  //   query = query.where(sql<boolean>`info->'bottle_filler' = ${params.bottle_filler}`)
  // }
  //
  // if (params.baby_changer !== undefined) {
  //   query = query.where(sql<boolean>`info->'baby_changer' = ${params.baby_changer}`)
  // }
  //
  // if (params.gender !== undefined) {
  //   query = query.where(sql<boolean>`info->'gender' = ${params.gender}`)
  // }
  //
  // if (params.sanitary_products !== undefined) {
  //   query = query.where(sql<boolean>`info->'sanitary_products' = ${params.sanitary_products}`)
  // }

  return parseArrayTimestampsPromise(query.selectAll().execute());
}

export function updateFob(id: string, updateWith: IFobInfo) : Promise<Fob> {
  // TODO also add entry to fob change table to record this
  const update : FobUpdate = {
    info: updateWith
  };
  return parseTimestampsPromise(db.updateTable('fob').set(update).where('id', '=', id).returningAll().executeTakeFirst());
}

export function deleteFob(id: string) : Promise<Fob> {
  return db.deleteFrom('fob').where('id', '=', id).returningAll().executeTakeFirst();
}

// RATINGS
export function createRating(rating: NewRating) : Promise<Rating> {
  return parseTimestampsPromise(db.insertInto('rating').values(rating).returningAll().executeTakeFirstOrThrow());
}

export function getRating(id: string) : Promise<Rating> {
  return parseTimestampsPromise(db.selectFrom('rating').where('id', '=', id).selectAll().executeTakeFirst());
}

export function getRatingsForFob(fobId: string) : Promise<Rating[]> {
  return parseArrayTimestampsPromise(db.selectFrom('rating').where('fob_id', '=', fobId).selectAll().execute());
}

export async function getRatingsWithDetailsForFob(fobId: string) : Promise<IRatingWithDetails[]> {
  const queryResult : RatingWithDetails[] = await db.selectFrom('rating_with_details')
    .where('fob_id', '=', fobId).selectAll().execute();

  let results : IRatingWithDetails[] = [];
  queryResult.forEach(ratingWithDetails => {
    results.push({
      rating: parseTimestamps({
        id: ratingWithDetails.rating_id,
        fob_id: ratingWithDetails.fob_id,
        user_id: ratingWithDetails.user_id,
        details:  ratingWithDetails.details,
        created_at: ratingWithDetails.rating_created_at,
        updated_at: ratingWithDetails.rating_updated_at
      }) as IRating,
      user: parseTimestamps({
        id:  ratingWithDetails.user_id,
        username: ratingWithDetails.username,
        email: ratingWithDetails.email,
        hashed_password: ratingWithDetails.hashed_password,
        profile: ratingWithDetails.profile,
        created_at: ratingWithDetails.user_created_at,
        updated_at: ratingWithDetails.user_updated_at
      }) as IUser
    });
  });

  return results;
}

export function getRatingsByUser(userId: string) : Promise<Rating[]> {
  return parseArrayTimestampsPromise(db.selectFrom('rating').where('user_id', '=', userId).selectAll().execute());
}

export function updateRating(id: string, updateWith: IRatingDetails) : Promise<Rating> {
  const update : RatingUpdate = {
    details: updateWith
  };
  return parseTimestampsPromise(db.updateTable('rating').set(update).where('id', '=', id).returningAll().executeTakeFirst());
}

// USER
export function createUser(user: NewUser) : Promise<User> {
  return parseTimestampsPromise(db.insertInto('user').values(user).returningAll().executeTakeFirstOrThrow());
}

export function getUserById(id: string) : Promise<User> {
  return parseTimestampsPromise(db.selectFrom('user').where('id', '=', id).selectAll().executeTakeFirst());
}

export function getUserByUsername(username: string) : Promise<User> {
  return parseTimestampsPromise(db.selectFrom('user').where('username', '=', username).selectAll().executeTakeFirst());
}

export function getUserByEmail(email: string) : Promise<User> {
  return parseTimestampsPromise(db.selectFrom('user').where('email', '=', email).selectAll().executeTakeFirst());
}

export function updateUserProfileByUsername(username: string, updateWith : UserUpdate) : Promise<User> {
  return db.updateTable('user').set({profile: updateWith.profile}).where('username', '=', username).returningAll().executeTakeFirst();
}

export function getUserContributions(userId: string, params: IUserContributionQueryParams) : Promise<IUserContributions> {
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
      } as IUserContributions;
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  });
}

// PICTURE
export function createPicture(picture: NewPicture) : Promise<Picture> {
  return parseTimestampsPromise(db.insertInto('picture').values(picture).returningAll().executeTakeFirstOrThrow());
}

export function getPictureById(id: string) : Promise<Picture> {
  return parseTimestampsPromise(db.selectFrom('picture').where('id', '=', id).selectAll().executeTakeFirst());
}

export function getPicturesForFob(fobId: string) : Promise<Picture[]> {
  return parseArrayTimestampsPromise(db.selectFrom('picture').where('fob_id', '=', fobId).selectAll().execute());
}

export function getPicturesByUser(userId: string) : Promise<Picture[]> {
  return parseArrayTimestampsPromise(db.selectFrom('picture').where('user_id', '=', userId).selectAll().execute());
}

export function deletePicture(id: string) : Promise<Picture> {
  return db.deleteFrom('picture').where('id', '=', id).returningAll().executeTakeFirst();
}

function parseTimestampsPromise(item : Promise<any>) : Promise<any> {
  return new Promise((resolve, reject) => {
    item.then((result) => {
      resolve(parseTimestamps(result));
    }).catch((error) => reject(error));
  });
}

function parseArrayTimestampsPromise(itemArray: Promise<any[]>) : Promise<any[]> {
  return new Promise((resolve, reject) => {
    itemArray.then((result) => {
      resolve(result.map(parseTimestamps));
    }).catch((error) => reject(error));
  });
}

function parseTimestamps(item: any) : any {
  if (item !== undefined
    && item !== null
    && item.hasOwnProperty('created_at')
    && item.hasOwnProperty('updated_at')) {
    item.created_at = parseInt(item.created_at);
    item.updated_at = parseInt(item.updated_at);
  }
  return item;
}
