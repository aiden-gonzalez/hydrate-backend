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
import {
  bathroomIdRegex,
  bathroomRatingIdRegex,
  fountainIdRegex,
  fountainRatingIdRegex,
  pictureIdRegex,
  userIdRegex
} from "./regex";
import {getPicture, getReqMock, getResMock, getUser} from "../testHelper.test";
import {IUser} from "./types";
import {expect} from "chai";

describe("UTIL: generation and validation tests", () => {
  function testId(id: string, prefix: string, regex: RegExp) {
    expect(id.slice(0, prefix.length)).to.equal(prefix);
    expect(id.slice(prefix.length, prefix.length + 1)).to.equal("_");
    expect(uuidValidator(id.slice(prefix.length + 1)));
    expect(regexValidator(id, regex));
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
    expect(jwtValidator(token));
  });

  it ("authenticates a token", async () => {
    const user : IUser = await getUser();
    const token = generateToken(user, constants.JWT_ACCESS_EXPIRATION);
    const req = getReqMock(token);
    const res = getResMock();

    // Try to authenticate token
    await authenticateRequest(req, res, () => {});

    // Should have worked
    expect(req.user).to.not.equal(null);
    expect(req.user.id).to.equal(user.id);
    expect(req.user.email).to.equal(user.email);
  });

  it ("hashes a password", async () => {
    const password = "password";
    const hashedPassword = await hashPass(password);
    expect(sha512Validator(hashedPassword.hash_pass));
  });

  it("validates a password", async () => {
    const password = "password";
    const hashedPassword = await hashPass(password);
    expect(isValidPass(password, hashedPassword));
  })
});

describe("UTIL: creating MongoDB documents", () => {
  it("creates a new User", async () => {
    const newUser = new User(await getUser());
    try {
      await newUser.save();
    } catch (error) {
      throw(error.message);
    }
  });

  it("creates a new Picture", async () => {
    const newPicture = new Picture(getPicture());
    try {
      await newPicture.save();
    } catch (error) {
      throw(error.message);
    }
  });
});
