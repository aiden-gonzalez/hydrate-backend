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
import { IUser, iLocationToIDbLocation } from "../utils/types";

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

  async function createFountains(user: IUser) {
    // Create fountains
    const fountainOne : IFountain = {
      id: generateFountainId(),
      info: {
        name: "Fountain One",
        bottle_filler: true,
        location: {
          latitude: 0,
          longitude: 0
        }
      }
    };
    const fountainTwo : IFountain = {
      id: generateFountainId(),
      info: {
        name: "Fountain Two",
        bottle_filler: false,
        location: {
          latitude: 5,
          longitude: 5
        }
      }
    };
    const fountainThree : IFountain = {
      id: generateFountainId(),
      info: {
        name: "Fountain Three",
        bottle_filler: true,
        location: {
          latitude: 20,
          longitude: 20
        }
      }
    };

    const createdFountainOne = await database.createFountain(fountainOne);
    const createdFountainTwo = await database.createFountain(fountainTwo);
    const createdFountainThree = await database.createFountain(fountainThree);

    return [createdFountainOne, createdFountainTwo, createdFountainThree];
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
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains(user);

    // Try to get all fountains
    await simulateRouter(req, res, getFountainsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expect(res.json).to.deep.equal(createdFountains);
  })
});
