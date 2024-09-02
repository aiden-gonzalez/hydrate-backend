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
import {expect} from "chai";
import {IFountain, IFountainInfo, IFountainRating, IFountainRatingDetails} from "./fountains/types";
import {IBathroom, IBathroomInfo, IBathroomRating, IBathroomRatingDetails} from "./bathrooms/types";

describe("Connect to database and run tests", function () {
  it("Should connect to database", async () => {
    // await mongoose.connect(process.env.MONGO_TEST_URI);
    // TODO connect to postgres
    console.log("Connected to local postgres");
    // mongoose.connection.on("error", (error) => {
    //   console.warn("Error: ", error);
    // });
    // expect(mongoose.connection.db);
    // TODO set up postgres error handling and expect connection

    // Comment out to see the documents after testing
    beforeEach((done) => {
      // dropAllCollections(mongoose.connection.db).then(() => {
      //   done();
      // });
      // TODO implement "dropAllTables"
    });

    afterEach((done) => {
      // dropAllCollections(mongoose.connection.db).then(() => {
      //   done();
      // });
      // TODO implement "dropAllTables"
    });
  });
});

// async function dropAllCollections(db) {
//   try {
//     const collections = await db.collections()
//     for (const collection of collections) {
//       await collection.drop();
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }
// TODO implement "dropAllTables"

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
  } as IUser;
}

export function getLocation (latitude  = 40.4237, longitude  = -86.9212) : ILocation {
  return {
    latitude: latitude,
    longitude: longitude
  } as ILocation;
}

export function getFountain (user_id = generateUserId(), name  = "fountain name", bottle_filler  = false, location : ILocation = getLocation()) : IFountain {
  return {
    id: generateFountainId(),
    user_id: user_id,
    info: {
      name: name,
      bottle_filler: bottle_filler,
      location: location
    } as IFountainInfo
  } as IFountain;
}

export function getBathroom (user_id = generateUserId(), name = "bathroom name", gender = "male", baby_changer = false, sanitary_products = false, location : ILocation = getLocation()) : IBathroom {
  return {
    id: generateBathroomId(),
    user_id: user_id,
    info: {
      name: name,
      gender: gender,
      baby_changer: baby_changer,
      sanitary_products: sanitary_products,
      location: location
    } as IBathroomInfo
  } as IBathroom;
}

export function getFountainRating (fountain_id = generateFountainId(), user_id = generateUserId(), details = getFountainRatingDetails()) : IFountainRating {
  return {
    id: generateFountainRatingId(),
    fountain_id: fountain_id,
    user_id: user_id,
    details: details
  } as IFountainRating;
}

export function getFountainRatingDetails (pressure = 3, taste = 3, temperature = 3) : IFountainRatingDetails {
  return {
    pressure: pressure,
    taste: taste,
    temperature: temperature
  } as IFountainRatingDetails;
}

export function getBathroomRating (bathroom_id = generateBathroomId(), user_id = generateUserId(), details = getBathroomRatingDetails()) : IBathroomRating {
  return {
    id: generateBathroomRatingId(),
    bathroom_id: bathroom_id,
    user_id: user_id,
    details: details
  } as IBathroomRating;
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

export function getPicture (entity_id = generateFountainId(), user_id = generateUserId(), url = "https://www.google.com") : IPicture {
  return {
    id: generatePictureId(),
    entity_id: entity_id,
    user_id: user_id,
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
