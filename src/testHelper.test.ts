import 'dotenv/config';
import mongoose from "mongoose";
import assert from "assert";
import {IPicture, IUser} from "./utils/types";
import {generateFountainId, generatePictureId, generateUserId} from "./utils/generate";
import {hashPass} from "./utils/auth";
import * as constants from "./utils/constants";

// Tell mongoose to use es6 Promise implementation
mongoose.Promise = global.Promise;

describe("Connect to database and run tests", function () {
  it("Should connect to database", async () => {
    await mongoose.connect("mongodb://root:password@127.0.0.1:27017/hydrate?authSource=admin");
    console.log("Connected to local MongoDB");
    mongoose.connection.on("error", (error) => {
      console.warn("Error: ", error);
    });
    assert(mongoose.connection.db);

    // Comment out to see the documents after testing
    beforeEach((done) => {
      dropAllCollections(mongoose.connection.db).then(() => {
        done();
      });
    });

    afterEach((done) => {
      dropAllCollections(mongoose.connection.db).then(() => {
        done();
      });
    });
  });
});

async function dropAllCollections(db) {
  try {
    const collections = await db.collections()
    for (const collection of collections) {
      await collection.drop();
    }
  } catch (error) {
    console.log(error);
  }
}

// TESTING HELPER FUNCTIONS

export async function getUser () : Promise<IUser> {
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

export function getPicture () : IPicture {
  return {
    id: generatePictureId(),
    entity_id: generateFountainId(),
    picture_link: "https://www.google.com"
  }
}

export function getReqMock (token : string = null, json : any = null) {
  return {
    "get": function (key : string) {
      if (key == constants.HTTP_AUTHORIZATION_HEADER) {
        return token;
      }
      return null;
    },
    "user": null,
    "json": function () {
      return json;
    }
  };
}
export function getResMock () {
  return {
    "sentStatus": null,
    "status": function (code : number) {
      this["sentStatus"] = code;
      return this;
    },
    "message": null,
    "send": function (message : any) {
      this["message"] = message;
      return this;
    }
  };
}

export function getNextMock () {
  const next = function () {return null;};
  next["called"] = false;
  return next;
}
