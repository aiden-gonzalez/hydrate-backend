import nodeCrypto from "crypto";
import jwt from "jsonwebtoken";
import {IHashedPassword, IUser} from "./types";
import * as constants from "./constants";
import * as db from "../db/queries";

// expiresIn is an integer representing number of seconds until expiration
export function generateToken (user : IUser, expiration : number) {
  return jwt.sign({user}, process.env.JWT_SECRET, {expiresIn: expiration});
}

export function validateToken(token: string) : Promise<IUser> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, tokenUser) => {
      if (err) {
        reject(err);
      }
      resolve(tokenUser.user);
    });
  });
}

export async function authenticateRequest (req, res, next) {
  const token = req.get("Authorization");
  if (token == null)
    return res.sendStatus(constants.HTTP_UNAUTHORIZED);

  try {
    const tokenUser = await validateToken(token);

    // TODO avoiding premature optimization for now, but ideally this db call wouldn't be necessary in the future
    const dbUser = await db.getUserById(tokenUser.id)

    // If user doesn't exist in the database, return 401. User account may have been deleted or banned.
    if (dbUser == null) {
      return res.sendStatus(constants.HTTP_UNAUTHORIZED);
    }

    req.user = tokenUser;
    req.dbUser = dbUser;
    next();
  } catch (error) {
    res.sendStatus(constants.HTTP_UNAUTHORIZED);
  }
}

export function hashPass (password : string) : Promise<IHashedPassword> {
  return new Promise((resolve, reject) => {
    const salt = nodeCrypto.randomBytes(constants.HASH_LEN).toString(constants.HASH_ENCODING);
    hashPassWithSalt(password, salt).then((hash) => {
      resolve({
        hash_pass: hash,
        hash_salt: salt
      });
    }).catch((error) => {
      reject(error);
    });
  });
}

export function hashPassWithSalt (password : string, salt : string): Promise<string> {
  return new Promise((resolve, reject) => {
    nodeCrypto.pbkdf2(
      password,
      salt,
      constants.HASH_ITERATIONS,
      constants.HASH_LEN,
      constants.HASH_DIGEST,
      (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash.toString(constants.HASH_ENCODING));
      });
  });
}

export function isValidPass (password : string, actualPassword : IHashedPassword) {
  return new Promise((resolve, reject) => {
    hashPassWithSalt(password, actualPassword.hash_salt)
      .then((passwordHash) => resolve(actualPassword.hash_pass === passwordHash))
      .catch((err) => reject(err));
  });
}
