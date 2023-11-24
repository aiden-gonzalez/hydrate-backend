import { IHashedPassword } from "./types";
import { User } from '../mongoDB';
import { hashPass } from "./auth";
import { IUserProfile } from "../profiles/types";
import {generateUserId} from "./generate";

describe('Creating a document in MongoDB', () => {
  it("Creates a new User", async () => {
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
});
