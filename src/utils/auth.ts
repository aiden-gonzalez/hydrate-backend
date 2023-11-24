import nodeCrypto from "crypto";
import jwt from "jsonwebtoken";
import {IHashedPassword, IUser} from "./types";
const keyLen = 64;
const iterations = 100;
const digest = "sha512";

// expiresIn is an integer representing number of seconds until expiration
export function generateToken (user : IUser, expiration : number) {
  return jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: expiration });
}

export function authenticateToken (req, res, next) {
  const token = req.get("Authorization");
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, tokenUser) => {
    if (err) return res.sendStatus(403);
    req.tokenUser = tokenUser;
    next();
  });
}

export function hashPass (password : string) : Promise<IHashedPassword> {
  return new Promise((resolve, reject) => {
    const salt = nodeCrypto.randomBytes(keyLen).toString('hex');
    hashPassWithSalt(password, salt).then((result) => {
      resolve({
        hash_pass: result,
        hash_salt: salt
      });
    }).catch((error) => {
      reject(error);
    });
  });
}

export function hashPassWithSalt (password : string, salt : string): Promise<string> {
  return new Promise((resolve, reject) => {
    nodeCrypto.pbkdf2(password, salt, iterations, keyLen, digest, (err, key) => {
      if (err) {
        reject(err);
      }
      resolve(key.toString("hex"));
    });
  })
}

export function isValidPass (password : string, actualPassword : IHashedPassword) {
  return new Promise((resolve, reject) => {
    hashPassWithSalt(password, actualPassword.hash_salt)
      .then((passwordHash) => resolve(actualPassword.hash_pass === passwordHash))
      .catch((err) => reject(err));
  });
}
