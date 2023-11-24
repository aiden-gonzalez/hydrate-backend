import {IHashedPassword, IUser} from "./types";
import {Picture, User} from '../mongoDB';
import {authenticateToken, generateToken, hashPass} from "./auth";
import { IUserProfile } from "../profiles/types";
import {generateFountainId, generatePictureId, generateUserId} from "./generate";
import {jwtValidator} from "./validation";
import assert from "assert";

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
    return function () {console.log("next() called")};
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
      authenticateToken(req, res, next);
      assert(req.tokenUser.user.email == user.email);
    } catch (error) {
      console.log(error);
    }
  });

  it ("hashes a password", async () => {
    const password = "password";
    try {
      const hashedPassword = await hashPass(password);
      assert(true == true);
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


