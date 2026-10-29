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
        return reject(err);
      }
      resolve(tokenUser.user);
    });
  });
}

export async function authenticateRequest (req, res, next) {
  const token = req.get(constants.HTTP_AUTHORIZATION_HEADER);
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
  const salt = nodeCrypto.randomBytes(constants.HASH_LEN).toString(constants.HASH_ENCODING);
  return hashPassWithSalt(password, salt, constants.HASH_ITERATIONS).then((hash) => ({
    hash_pass: hash,
    hash_salt: salt,
    hash_iterations: constants.HASH_ITERATIONS
  }));
}

export function hashPassWithSalt (password : string, salt : string, iterations : number): Promise<string> {
  return new Promise((resolve, reject) => {
    nodeCrypto.pbkdf2(
      password,
      salt,
      iterations,
      constants.HASH_LEN,
      constants.HASH_DIGEST,
      (err, hash) => {
        if (err) {
          return reject(err);
        }
        resolve(hash.toString(constants.HASH_ENCODING));
      });
  });
}

export async function isValidPass (password : string, actualPassword : IHashedPassword) : Promise<boolean> {
  const iterations = actualPassword.hash_iterations ?? constants.HASH_ITERATIONS_LEGACY;
  const passwordHash = await hashPassWithSalt(password, actualPassword.hash_salt, iterations);
  // Constant time comparison so response timing doesn't leak how much of the hash matched
  const expected = Buffer.from(actualPassword.hash_pass, constants.HASH_ENCODING);
  const actual = Buffer.from(passwordHash, constants.HASH_ENCODING);
  return expected.length === actual.length && nodeCrypto.timingSafeEqual(expected, actual);
}

// Whether a stored hash should be re-hashed with the current parameters
export function needsRehash (hashedPassword : IHashedPassword) : boolean {
  return (hashedPassword.hash_iterations ?? constants.HASH_ITERATIONS_LEGACY) < constants.HASH_ITERATIONS;
}
