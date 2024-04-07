import {authenticateRequest} from "../utils/auth";
import {
  getAuthedReqMockForUser,
  getFountain, getFountainRatingDetails, getPicture,
  getReqMock,
  getResMock,
  getUser,
  simulateRouter
} from "../testHelper.test";
import {expect} from "chai";
import * as constants from "../utils/constants";
import {
  ratingPermissionCheck,
  getFountains,
  createFountain,
  getFountainById,
  updateFountain,
  getFountainPictures,
  addFountainPicture,
  getFountainPicture,
  deleteFountainPicture,
  getFountainRatings,
  addFountainRating,
  getFountainRating,
  updateFountainRating
} from "./fountainsController";
import { IFountain, IFountainRating, IFountainRatingDetails } from "./types";
import * as database from "../utils/database";
import {generateFountainId, generateFountainRatingId, generatePictureId, generateUserId} from "../utils/generate";
import {ILocation, IPicture, IUser} from "../utils/types";
import {Fountain, FountainRating, IDbFountain} from "../mongoDB";
import {calculateDistance} from "../utils/calculation";

describe("FOUNTAINS: CRUD of all kinds", () => {
  const getFountainsFuncs = [authenticateRequest, getFountains];
  const createFountainFuncs = [authenticateRequest, createFountain];
  const getFountainFuncs = [authenticateRequest, getFountainById];
  const updateFountainFuncs = [authenticateRequest, updateFountain];
  const getFountainPicturesFuncs = [authenticateRequest, getFountainPictures];
  const addFountainPictureFuncs = [authenticateRequest, addFountainPicture];
  const getFountainPictureFuncs = [authenticateRequest, getFountainPicture];
  const deleteFountainPictureFuncs = [authenticateRequest, deleteFountainPicture];
  const getFountainRatingsFuncs = [authenticateRequest, getFountainRatings];
  const addFountainRatingFuncs = [authenticateRequest, addFountainRating];
  const getFountainRatingFuncs = [authenticateRequest, getFountainRating];
  const updateFountainRatingFuncs = [authenticateRequest, ratingPermissionCheck, updateFountainRating];

  // TODO add more unhappy paths? Malformed data, bad responses?

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

    const createdFountainOne = await database.createFob<IFountain, IDbFountain>(Fountain, fountainOne);
    const createdFountainTwo = await database.createFob<IFountain, IDbFountain>(Fountain, fountainTwo);
    const createdFountainThree = await database.createFob<IFountain, IDbFountain>(Fountain, fountainThree);

    return [createdFountainOne, createdFountainTwo, createdFountainThree];
  }

  async function createFountainRatings (fountainId : string, userId : string) {
    // Create fountain ratings
    const fountainRatingOne : IFountainRating = {
      id: generateFountainRatingId(),
      fountain_id: fountainId,
      user_id: userId,
      details: {
        pressure: 1,
        taste: 1,
        temperature: 1
      } as IFountainRatingDetails
    }
    const fountainRatingTwo : IFountainRating = {
      id: generateFountainRatingId(),
      fountain_id: fountainId,
      user_id: userId,
      details: {
        pressure: 2,
        taste: 2,
        temperature: 2
      } as IFountainRatingDetails
    }
    const fountainRatingThree : IFountainRating = {
      id: generateFountainRatingId(),
      fountain_id: fountainId,
      user_id: userId,
      details: {
        pressure: 3,
        taste: 3,
        temperature: 3
      } as IFountainRatingDetails
    }

    const createdFountainRatingOne = await database.createRating<IFountainRating>(FountainRating, fountainRatingOne);
    const createdFountainRatingTwo = await database.createRating<IFountainRating>(FountainRating, fountainRatingTwo);
    const createdFountainRatingThree = await database.createRating<IFountainRating>(FountainRating, fountainRatingThree);

    return [createdFountainRatingOne, createdFountainRatingTwo, createdFountainRatingThree];
  }

  async function createPictures(entityId : string) {
    // Create pictures
    const pictureOne : IPicture = {
      id: generatePictureId(),
      picture_link: "https://www.google.com",
      entity_id: entityId
    };
    const pictureTwo : IPicture = {
      id: generatePictureId(),
      picture_link: "https://www.facebook.com",
      entity_id: entityId
    };
    const pictureThree : IPicture = {
      id: generatePictureId(),
      picture_link: "https://www.mail.google.com",
      entity_id: entityId
    };

    const createdPictureOne = await database.createPicture(pictureOne);
    const createdPictureTwo = await database.createPicture(pictureTwo);
    const createdPictureThree = await database.createPicture(pictureThree);

    return [createdPictureOne, createdPictureTwo, createdPictureThree];
  }

  function expectEntitiesEqual(entitiesA, entitiesB) {
    expect(entitiesA).to.deep.equal(entitiesB);
    expect(entitiesA.length).to.equal(entitiesB.length);
    for (let i = 0; i < entitiesA.length; i++) {
      expect(entitiesA[i]).to.deep.equal(entitiesB.find((fountain) => fountain.id === entitiesA[i].id));
    }
  }

  it("can't create a fountain without authentication", async () => {
    const req = getReqMock(null, getFountain().info);
    const res = getResMock();

    // Try to create fountain
    await simulateRouter(req, res, createFountainFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("Creates a fountain with authentication", async () => {
    const fountainToCreate = getFountain();
    const req = getAuthedReqMockForUser(await getUser(), fountainToCreate.info);
    const res = getResMock();

    // Try to create fountain
    await simulateRouter(req, res, createFountainFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_CREATED);
    expect(fountainToCreate.info).to.deep.equal(res.message.info);
  });

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
    expectEntitiesEqual(res.message, createdFountains);
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
    expectEntitiesEqual(res.message, createdFountains.filter((fountain) => fountain.info.bottle_filler));
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
    expectEntitiesEqual(res.message, createdFountains.filter((fountain) => calculateDistance(fountain.info.location, {latitude: 40.42492454100864, longitude: -86.91155253041734} as ILocation) < 40));
  });

  it ("can't get a particular fountain without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Specify an ID in request
    req.params = {
      id: createdFountains[0].id
    };

    // Try to get fountain
    await simulateRouter(req, res, getFountainFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it ("gets a particular fountain", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Specify an ID in request
    req.params = {
      id: createdFountains[0].id
    };

    // Try to get fountain
    await simulateRouter(req, res, getFountainFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expect(createdFountains[0]).to.deep.equal(res.message);
  });

  it ("can't update a fountain without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Specify fountain updates in request
    createdFountains[0].info = createdFountains[1].info;
    req.params = {
      id: createdFountains[0].id
    };
    req.body = createdFountains[0].info;

    // Try to update fountain
    await simulateRouter(req, res, updateFountainFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it ("updates a fountain", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Specify fountain updates in request
    createdFountains[0].info = createdFountains[1].info;
    req.params = {
      id: createdFountains[0].id
    };
    req.body = createdFountains[0].info;

    // Try to update fountain
    await simulateRouter(req, res, updateFountainFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expect(createdFountains[0]).to.deep.equal(res.message);
  });

  it("Can't create a fountain picture without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Set up picture to create
    req.params = {
      id: createdFountains[0].id
    };
    req.body = "https://www.google.com"; // picture link

    // Try to create fountain picture
    await simulateRouter(req, res, addFountainPictureFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("Can't create a fountain picture with invalid URL", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Set up picture to create
    req.params = {
      id: createdFountains[0].id
    };
    req.body = "not a url"; // invalid picture link

    // Try to create fountain picture
    await simulateRouter(req, res, addFountainPictureFuncs);

    // Should have failed with 400
    expect(res.sentStatus).to.equal(constants.HTTP_BAD_REQUEST);
    expect(res.message).to.satisfy((message) => message.startsWith("Picture validation failed"));
  });

  it("Creates a fountain picture", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Set up picture to create
    req.params = {
      id: createdFountains[0].id
    };
    const pictureToCreate = getPicture();
    pictureToCreate.entity_id = createdFountains[0].id;
    req.body = pictureToCreate.picture_link; // valid picture link

    // Try to create fountain picture
    await simulateRouter(req, res, addFountainPictureFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    pictureToCreate.id = res.message.id;
    expect(pictureToCreate).to.deep.equal(res.message);
  });

  it("Can't get fountain pictures without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add pictures
    await createPictures(createdFountains[0].id);

    // Set up request
    req.params = {
      id: createdFountains[0].id
    };

    // Try to get pictures
    await simulateRouter(req, res, getFountainPicturesFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("Gets fountain pictures", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add pictures
    const createdPictures = await createPictures(createdFountains[0].id);

    // Set up request
    req.params = {
      id: createdFountains[0].id
    };

    // Try to get pictures
    await simulateRouter(req, res, getFountainPicturesFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdPictures);
  });

  it("Can't get a particular picture without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add pictures
    const createdPictures = await createPictures(createdFountains[0].id);

    // Set up request
    req.params = {
      pictureId: createdPictures[0].id
    };

    // Try to get picture
    await simulateRouter(req, res, getFountainPictureFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("Successfully gets a particular picture", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add pictures
    const createdPictures = await createPictures(createdFountains[0].id);

    // Set up request
    req.params = {
      pictureId: createdPictures[0].id
    };

    // Try to get picture
    await simulateRouter(req, res, getFountainPictureFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdPictures[0]);
  });

  it("Successfully deletes a picture while authenticated", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add pictures
    const createdPictures = await createPictures(createdFountains[0].id);

    // Set up request
    req.params = {
      pictureId: createdPictures[0].id
    };

    // Try to delete picture
    await simulateRouter(req, res, deleteFountainPictureFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);

    // Picture should not exist
    const picture = await database.getPictureById(createdPictures[0].id);
    expect(picture).to.be.null;
  });

  it("Can't create fountain rating without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Set up request
    req.params = {
      id: createdFountains[0].id
    };
    req.body = getFountainRatingDetails();

    // Try to add rating
    await simulateRouter(req, res, addFountainRatingFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("Can't create a fountain rating with invalid scores", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Set up request
    req.params = {
      id: createdFountains[0].id
    };
    req.body = getFountainRatingDetails(10, -5, 0);

    // Try to add rating
    await simulateRouter(req, res, addFountainRatingFuncs);

    // Should have failed with bad request
    expect(res.sentStatus).to.equal(constants.HTTP_BAD_REQUEST);
    expect(res.message).to.satisfy((message) => message.startsWith("FountainRating validation failed"));
  });

  it("Successfully creates a fountain rating", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Set up request
    req.params = {
      id: createdFountains[0].id
    };
    req.body = getFountainRatingDetails();

    // Try to add rating
    await simulateRouter(req, res, addFountainRatingFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message.details, req.body);
  });

  it("Successfully gets all ratings for a particular fountain", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Create a few ratings for a particular fountain
    const createdFountainRatings = await createFountainRatings(createdFountains[0].id, user.id);

    // Set up request
    req.params = {
      id: createdFountains[0].id
    };

    // Try to get ratings
    await simulateRouter(req, res, getFountainRatingsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdFountainRatings);
  });

  it("Can't get a particular fountain rating without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add ratings
    const createdFountainRatings = await createFountainRatings(createdFountains[0].id, generateUserId());

    // Set up request
    req.params = {
      ratingId: createdFountainRatings[0].id
    };

    // Try to get fountain rating
    await simulateRouter(req, res, getFountainRatingFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("Successfully gets a particular fountain rating", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add ratings
    const createdFountainRatings = await createFountainRatings(createdFountains[0].id, user.id);

    // Set up request
    req.params = {
      ratingId: createdFountainRatings[0].id
    };

    // Try to get fountain rating
    await simulateRouter(req, res, getFountainRatingFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdFountainRatings[0]);
  });

  it ("can't update a fountain rating without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Create ratings
    const createdFountainRatings = await createFountainRatings(createdFountains[0].id, generateUserId());

    // Specify fountain rating updates in request
    createdFountainRatings[0].details = createdFountainRatings[1].details;
    req.params = {
      ratingId: createdFountainRatings[0].id
    };
    req.body = createdFountainRatings[0].details;

    // Try to update fountain rating
    await simulateRouter(req, res, updateFountainRatingFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it ("updates a fountain rating", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Create ratings
    const createdFountainRatings = await createFountainRatings(createdFountains[0].id, user.id);

    // Specify fountain rating updates in request
    createdFountainRatings[0].details = createdFountainRatings[1].details;
    req.params = {
      ratingId: createdFountainRatings[0].id
    };
    req.body = createdFountainRatings[0].details;

    // Try to update fountain rating
    await simulateRouter(req, res, updateFountainRatingFuncs);

    // Ignore updatedAt
    delete createdFountainRatings[0]["updatedAt"];
    delete res.message.updatedAt;

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expect(createdFountainRatings[0]).to.deep.equal(res.message);
  });
});
