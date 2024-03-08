import {authenticateRequest} from "../utils/auth";
import {getAuthedReqMockForUser, getReqMock, getResMock, getUser, simulateRouter} from "../testHelper.test";
import {expect} from "chai";
import * as constants from "../utils/constants";
import {
  //ratingPermissionCheck,
  getFountains,
  // createFountain,
  // getFountain,
  // updateFountain,
  // getFountainPictures,
  // addFountainPicture,
  // getFountainPicture,
  // deleteFountainPicture,
  // getFountainRatings,
  // addFountainRating,
  // getFountainRating,
  // updateFountainRating
} from "./fountainsController";
import { IFountain } from "./types";
import * as database from "../utils/database";
import { generateFountainId } from "../utils/generate";
import { ILocation, IUser } from "../utils/types";
import {Fountain} from "../mongoDB";
import {calculateDistance} from "../utils/calculation";

describe("FOUNTAINS: CRUD of all kinds", () => {
  const getFountainsFuncs = [authenticateRequest, getFountains];
  // const createFountainFuncs = [authenticateRequest, createFountain];
  // const getFountainFuncs = [authenticateRequest, getFountain];
  // const updateFountainFuncs = [authenticateRequest, updateFountain];
  // const getFountainPicturesFuncs = [authenticateRequest, getFountainPictures];
  // const addFountainPictureFuncs = [authenticateRequest, addFountainPicture];
  // const getFountainPictureFuncs = [authenticateRequest, getFountainPicture];
  // const deleteFountainPictureFuncs = [authenticateRequest, deleteFountainPicture];
  // const getFountainRatingsFuncs = [authenticateRequest, getFountainRatings];
  // const addFountainRatingFuncs = [authenticateRequest, addFountainRating];
  // const getFountainRatingFuncs = [authenticateRequest, getFountainRating];
  // const updateFountainRatingFuncs = [authenticateRequest, ratingPermissionCheck, updateFountainRating];

  async function createFountains() {
    // Create fountains
    const fountainOne : IFountain = {
      id: generateFountainId(),
      info: {
        name: "Fountain One",
        bottle_filler: true,
        location: {
          latitude: 40.42476607308126,
          longitude: -86.9114030295504
        }
      }
    };
    const fountainTwo : IFountain = {
      id: generateFountainId(),
      info: {
        name: "Fountain Two",
        bottle_filler: false,
        location: {
          latitude: 40.42486535509428,
          longitude: -86.91207343967577
        }
      }
    };
    const fountainThree : IFountain = {
      id: generateFountainId(),
      info: {
        name: "Fountain Three",
        bottle_filler: true,
        location: {
          latitude: 40.425193836261464,
          longitude: -86.9112570893454
        }
      }
    };

    const createdFountainOne = await database.createFountain(fountainOne);
    const createdFountainTwo = await database.createFountain(fountainTwo);
    const createdFountainThree = await database.createFountain(fountainThree);

    return [createdFountainOne, createdFountainTwo, createdFountainThree];
  }

  function expectFountainsEqual(fountainsA, fountainsB) {
    expect(fountainsA).to.deep.equal(fountainsB);
    expect(fountainsA.length).to.equal(fountainsB.length);
    for (let i = 0; i < fountainsA.length; i++) {
      expect(fountainsA[i]).to.deep.equal(fountainsB.find((fountain) => fountain.id === fountainsA[i].id));
    }
  }

  it("can't get fountains without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Try to get fountains
    await simulateRouter(req, res, getFountainsFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("gets all fountains with authentication", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Try to get all fountains
    await simulateRouter(req, res, getFountainsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectFountainsEqual(res.message, createdFountains);
  });

  it("gets all fountains with bottle fillers", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Set up query
    req.query = {
      bottle_filler: true
    };

    // Try to get all fountains with bottle fillers
    await simulateRouter(req, res, getFountainsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectFountainsEqual(res.message, createdFountains.filter((fountain) => fountain.info.bottle_filler));
  });

  it ("gets all fountains within a certain radius of a point", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Set up query
    req.query = {
      latitude: 40.42492454100864,
      longitude: -86.91155253041734,
      radius: 40 // in meters
    }

    // ensure index on fountain location (needed for testing since collections get rapidly dropped)
    await Fountain.ensureIndexes();

    // Try to get all fountains within 50 meters of (5, 5)
    await simulateRouter(req, res, getFountainsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectFountainsEqual(res.message, createdFountains.filter((fountain) => calculateDistance(fountain.info.location, {latitude: 40.42492454100864, longitude: -86.91155253041734} as ILocation) < 40))
  })
});
