import 'dotenv/config';
import {ILocation, IPicture, IUser} from "./utils/types";
import {
  generateBathroomId, generateBathroomRatingId,
  generateFountainId,
  generateFountainRatingId,
  generatePictureId,
  generateUserId
} from "./utils/generate";
import {generateToken, hashPass} from "./utils/auth";
import * as constants from "./utils/constants";
import {findFobs} from "./db/queries";
import {migrateToLatest} from "./db/migrate";
import {expect} from "chai";
import {
  IFountainInfo,
  IFountainRatingDetails,
  IBathroomInfo,
  IBathroomRatingDetails,
  IFob,
  IRating
} from "./fobs/types";
import {getDb} from "./db/database";

describe("Connect to database and run tests", function () {
  it("Should connect to database", async () => {
    await migrateToLatest();
    console.log("Connected to local postgres");
    expect(await findFobs({}));
    // Comment out to see the rows after testing
    beforeEach((done) => {
      deleteAllRows().then(() => {
        done();
      });
    });

    afterEach((done) => {
      deleteAllRows().then(() => {
        done();
      });
    });
  });
});

// TESTING HELPER FUNCTIONS

// Using this pool here for deleting all rows
const db = getDb();

async function deleteAllRows() {
  await db.deleteFrom('user').execute();
  await db.deleteFrom('fob').execute();
  await db.deleteFrom('rating').execute();
  await db.deleteFrom('picture').execute();
}

export function getToken (user: IUser) : string {
  return generateToken(user, constants.JWT_ACCESS_EXPIRATION);
}

export async function getUser (username = "username", email = "email@gmail.com") : Promise<IUser> {
  return {
    id: generateUserId(),
    username: username,
    email: email,
    hashed_password: await hashPass("password"),
    profile: {
      full_name: "Aiden Gonzalez",
      picture_link: "https://www.google.com"
    }
  } as IUser;
}

export function getLocation (latitude = 40.4237, longitude  = -86.9212) : ILocation {
  return {
    latitude: latitude,
    longitude: longitude
  } as ILocation;
}

export function getFountain (user_id = generateUserId(), name = "fountain name", bottle_filler = false, location : ILocation = getLocation()) : IFob {
  return {
    id: generateFountainId(),
    user_id: user_id,
    name: name,
    location: location,
    info: {
      bottle_filler: bottle_filler
    } as IFountainInfo
  } as IFob;
}

export function getBathroom (user_id = generateUserId(), name = "bathroom name", gender = "male", baby_changer = false, sanitary_products = false, location : ILocation = getLocation()) : IFob {
  return {
    id: generateBathroomId(),
    user_id: user_id,
    name: name,
    location: location,
    info: {
      gender: gender,
      baby_changer: baby_changer,
      sanitary_products: sanitary_products
    } as IBathroomInfo
  } as IFob;
}

export function getFountainRating (fobId = generateFountainId(), userId = generateUserId(), details = getFountainRatingDetails()) : IRating {
  return {
    id: generateFountainRatingId(),
    fob_id: fobId,
    user_id: userId,
    details: details
  } as IRating;
}

export function getFountainRatingDetails (pressure = 3, taste = 3, temperature = 3) : IFountainRatingDetails {
  return {
    pressure: pressure,
    taste: taste,
    temperature: temperature
  } as IFountainRatingDetails;
}

export function getBathroomRating (fobId = generateBathroomId(), userId = generateUserId(), details = getBathroomRatingDetails()) : IRating {
  return {
    id: generateBathroomRatingId(),
    fob_id: fobId,
    user_id: userId,
    details: details
  } as IRating;
}

export function getBathroomRatingDetails (cleanliness = 3, decor = 3, drying = 3, privacy = 3, washing = 3) : IBathroomRatingDetails {
  return {
    cleanliness: cleanliness,
    decor: decor,
    drying: drying,
    privacy: privacy,
    washing: washing
  } as IBathroomRatingDetails;
}

export function getPicture (fobId = generateFountainId(), userId = generateUserId(), url = "https://www.google.com") : IPicture {
  return {
    id: generatePictureId(),
    fob_id: fobId,
    user_id: userId,
    url: url
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
