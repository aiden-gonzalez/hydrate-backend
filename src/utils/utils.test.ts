import {IHashedPassword, IUser} from "./types";
import {Picture, User} from '../mongoDB';
import {authenticateRequest, generateToken, hashPass, isValidPass} from "./auth";
import { IUserProfile } from "../profiles/types";
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
  async function getUser () : Promise<IUser> {
    return {
      id: generateUserId(),
      username: "username",
      email: "email@gmail.com",
      hashed_password: await hashPass("password"),
      profile: {
        full_name: "Aiden Gonzalez",
        picture_link: "https://www.google.com"
      }
    }
  }
  function getReq (token: string) {
    return {"get": function (key: string) {return token}, "tokenUser": null};
  }
  function getRes () {
    return {sendStatus: function (code: number) {console.log("Response sent:", code)}};
  }

  function getNext () {
    return function () {return null;};
  }

  it("generates a token", async () => {
    const user = await getUser();
    try {
      const token = generateToken(user, 1000);
      assert(jwtValidator(token));
    } catch (error) {
      console.log(error);
    }
  });

  it ("authenticates a token", async () => {
    const user = await getUser();
    try {
      const token = generateToken(user, 1000);
      const req = getReq(token);
      const res = getRes();
      const next = getNext();
      authenticateRequest(req, res, next);
      assert(req.tokenUser.user.email == user.email);
    } catch (error) {
      console.log(error);
    }
  });

  it ("hashes a password", async () => {
    const password = "password";
    try {
      const hashedPassword = await hashPass(password);
      assert(sha512Validator(hashedPassword.hash_pass));
    } catch (error) {
      console.log(error);
    }
  });

  it("validates a password", async () => {
    const password = "password";
    try {
      const hashedPassword = await hashPass(password);
      assert(isValidPass(password, hashedPassword));
    } catch (error) {
      console.log(error);
    }
  })
});

describe("UTIL: creating MongoDB documents", () => {
  it("creates a new User", async () => {
    const hashedPassword : IHashedPassword = await hashPass("password");
    const profile : IUserProfile = {
      full_name: "Aiden Gonzalez",
      picture_link: "https://www.google.com"
    }
    const newUser = new User({
      id: generateUserId(),
      username: "aidengonzalez",
      email: "aidenlgonzalez2@gmail.com",
      hashed_password: hashedPassword,
      profile: profile
    });
    try {
      await newUser.save();
    } catch (error) {
      console.log(error.message);
    }
  });

  it("creates a new Picture", async () => {
    const newPicture = new Picture({
      id: generatePictureId(),
      entity_id: generateFountainId(),
      picture_link: "https://www.google.com"
    });
    try {
      await newPicture.save();
    } catch (error) {
      console.log(error.message);
    }
  })
});


