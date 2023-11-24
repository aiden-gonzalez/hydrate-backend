import {IHashedPassword, IUser} from "./types";
import {Picture, User} from '../mongoDB';
import {generateToken, hashPass} from "./auth";
import { IUserProfile } from "../profiles/types";
import {generateFountainId, generatePictureId, generateUserId} from "./generate";
import {jwtValidator} from "./validation";
import assert from "assert";

describe("UTIL: auth tests", () => {
  it("generates a token", async () => {
    const user : IUser = {
      id: generateUserId(),
      username: "username",
      email: "email@gmail.com",
      hashed_password: await hashPass("password"),
      profile: {
        full_name: "Aiden Gonzalez",
        picture_link: "https://www.google.com"
      }
    }
    try {
      const token = generateToken(user, 1000);
      assert(jwtValidator(token));
    } catch (error) {
      console.log(error);
    }
  });
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


