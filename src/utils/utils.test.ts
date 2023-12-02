import {Picture, User} from '../mongoDB';
import {authenticateRequest, generateToken, hashPass, isValidPass} from "./auth";
import {
  generateBathroomId,
  generateBathroomRatingId,
  generateFountainId, generateFountainRatingId,
  generatePictureId,
  generateUserId
} from "./generate";
import {jwtValidator, regexValidator, sha512Validator, uuidValidator} from "./validation";
import * as constants from "./constants";
import assert from "assert";
import {
  bathroomIdRegex,
  bathroomRatingIdRegex,
  fountainIdRegex,
  fountainRatingIdRegex,
  pictureIdRegex,
  userIdRegex
} from "./regex";
import {getNextMock, getPicture, getReqMock, getResMock, getUser} from "../testHelper.test";

describe("UTIL: generation and validation tests", () => {
  function testId(id: string, prefix: string, regex: RegExp) {
    assert(id.slice(0, prefix.length) == prefix);
    assert(id.slice(prefix.length, prefix.length + 1) == "_");
    assert(uuidValidator(id.slice(prefix.length + 1)));
    assert(regexValidator(id, regex));
  }

  it("generates a valid user id", () => {
    testId(generateUserId(), constants.USER_ID_PREFIX, userIdRegex);
  });

  it("generates a valid bathroom id", () => {
    testId(generateBathroomId(), constants.BATHROOM_ID_PREFIX, bathroomIdRegex);
  });

  it("generates a valid bathroom rating id", () => {
    testId(generateBathroomRatingId(), constants.BATHROOM_RATING_ID_PREFIX, bathroomRatingIdRegex);
  });

  it("generates a valid fountain id", () => {
    testId(generateFountainId(), constants.FOUNTAIN_ID_PREFIX, fountainIdRegex);
  });

  it("generates a valid fountain rating id", () => {
    testId(generateFountainRatingId(), constants.FOUNTAIN_RATING_ID_PREFIX, fountainRatingIdRegex);
  });

  it("generates a valid picture id", () => {
    testId(generatePictureId(), constants.PICTURE_ID_PREFIX, pictureIdRegex);
  });
});

describe("UTIL: auth tests", () => {
  it("generates a token", async () => {
    const user = await getUser();
    const token = generateToken(user, constants.JWT_ACCESS_EXPIRATION);
    assert(jwtValidator(token));
  });

  it ("authenticates a token", async () => {
    const user = await getUser();
    const token = generateToken(user, constants.JWT_ACCESS_EXPIRATION);
    const req = getReqMock(token);
    const res = getResMock();
    const next = getNextMock();
    authenticateRequest(req, res, next);
    assert(req.user != null && req.user.email == user.email);
  });

  it ("hashes a password", async () => {
    const password = "password";
    const hashedPassword = await hashPass(password);
    assert(sha512Validator(hashedPassword.hash_pass));
  });

  it("validates a password", async () => {
    const password = "password";
    const hashedPassword = await hashPass(password);
    assert(isValidPass(password, hashedPassword));
  })
});

describe("UTIL: creating MongoDB documents", () => {
  it("creates a new User", async () => {
    const newUser = new User(await getUser());
    try {
      await newUser.save();
    } catch (error) {
      console.log(error.message);
      throw(error.message);
    }
  });

  it("creates a new Picture", async () => {
    const newPicture = new Picture(getPicture());
    try {
      await newPicture.save();
    } catch (error) {
      console.log(error.message);
      throw(error.message);
    }
  });
});
