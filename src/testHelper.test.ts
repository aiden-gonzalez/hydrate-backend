import 'dotenv/config';
import mongoose from "mongoose";
import {IPicture, IUser} from "./utils/types";
import {generateFountainId, generatePictureId, generateUserId} from "./utils/generate";
import {generateToken, hashPass} from "./utils/auth";
import * as constants from "./utils/constants";
import {expect} from "chai";

// Tell mongoose to use es6 Promise implementation
mongoose.Promise = global.Promise;

describe("Connect to database and run tests", function () {
  it("Should connect to database", async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI);
    console.log("Connected to local MongoDB");
    mongoose.connection.on("error", (error) => {
      console.warn("Error: ", error);
    });
    expect(mongoose.connection.db);

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

export function getToken (user: IUser) : string {
  return generateToken(user, constants.JWT_ACCESS_EXPIRATION);
}

export async function getUser (username  = "username") : Promise<IUser> {
  return {
    id: generateUserId(),
    username: username,
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

export function getReqMock (token : string = null, body : any = null) {
  return {
    "get": function (key : string) {
      if (key == constants.HTTP_AUTHORIZATION_HEADER) {
        return token;
      }
      return null;
    },
    "params": null,
    "query": null,
    "user": null,
    "dbUser": null,
    "body": body
  };
}

export function getAuthedReqMockForUser (user : IUser, body : any = null) {
  return getReqMock(getToken(user), body);
}

export async function getAuthedReqMock (body : any = null) {
  return getAuthedReqMockForUser(await getUser(), body);
}

export function getResMock () {
  return {
    "json": function (message : any) {
      this["message"] = message;
      return this;
    },
    "message": null,
    "send": function (message : any) {
      this["message"] = message;
      return this;
    },
    "sentStatus": null,
    "status": function (code : number) {
      this["sentStatus"] = code;
      return this;
    }
  };
}

export function getNextMock () {
  return () => {};
}

export async function simulateRouter(req, res, funcs : { (req : any, res : any, next? : any): void; } [] = [() => {}]) {
  let returnVal = undefined;
  for (let i = 0; i < funcs.length; i++) {
    // if this is the last func
    if (i == funcs.length - 1) {
      returnVal = await funcs[i](req, res);
    } else {
      returnVal = await funcs[i](req, res, () => {})
    }
    if (returnVal != undefined) {
      return;
    }
  }
}
