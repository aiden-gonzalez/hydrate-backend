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
  getFobs,
  createFob,
  getFobById,
  updateFob,
  getFobPictures,
  addFobPicture,
  getFobPicture,
  deleteFobPicture,
  getFobRatings,
  addFobRating,
  getFobRating,
  updateFobRating
} from "../fobs/fobsController";
import {setupFountainReq} from "./fountainsRouter";
import {IFountain, IFountainCreationDetails, IFountainRating, IFountainRatingDetails} from "./types";
import * as db from "../db/queries";
import {generateFountainId, generateFountainRatingId, generateUserId} from "../utils/generate";
import {ILocation, IUser} from "../utils/types";
import {calculateDistance} from "../utils/calculation";
import {Fob} from "../db/types";

describe("FOUNTAINS: CRUD of all kinds", () => {
  const getFountainsFuncs = [authenticateRequest, setupFountainReq, getFobs];
  const createFountainFuncs = [authenticateRequest, setupFountainReq, createFob];
  const getFountainFuncs = [authenticateRequest, setupFountainReq, getFobById];
  const updateFountainFuncs = [authenticateRequest, setupFountainReq, updateFob];
  const getFountainPicturesFuncs = [authenticateRequest, setupFountainReq, getFobPictures];
  const addFountainPictureFuncs = [authenticateRequest, setupFountainReq, addFobPicture];
  const getFountainPictureFuncs = [authenticateRequest, setupFountainReq, getFobPicture];
  const deleteFountainPictureFuncs = [authenticateRequest, setupFountainReq, deleteFobPicture];
  const getFountainRatingsFuncs = [authenticateRequest, setupFountainReq, getFobRatings];
  const addFountainRatingFuncs = [authenticateRequest, setupFountainReq, addFobRating];
  const getFountainRatingFuncs = [authenticateRequest, setupFountainReq, getFobRating];
  const updateFountainRatingFuncs = [authenticateRequest, setupFountainReq, ratingPermissionCheck, updateFobRating];

  // TODO add more unhappy paths? Malformed data, bad responses?

  async function createFountains(user = null) {
    // Create user if necessary
    if (user == null) {
      user = await db.createUser(await getUser());
    }

    // Create fountains
    const fountainOne : IFountain = {
      id: generateFountainId(),
      user_id: user.id,
      name: "Fountain One",
      location: {
        latitude: 40.42476607308126,
        longitude: -86.9114030295504
      },
      info: {
        bottle_filler: true,
      }
    };
    const fountainTwo : IFountain = {
      id: generateFountainId(),
      user_id: user.id,
      name: "Fountain Two",
      location: {
        latitude: 40.42486535509428,
        longitude: -86.91207343967577
      },
      info: {
        bottle_filler: false,
      }
    };
    const fountainThree : IFountain = {
      id: generateFountainId(),
      user_id: user.id,
      name: "Fountain Three",
      location: {
        latitude: 40.425193836261464,
        longitude: -86.9112570893454
      },
      info: {
        bottle_filler: true,
      }
    };

    const createdFountainOne = await db.createFob(fountainOne);
    const createdFountainTwo = await db.createFob(fountainTwo);
    const createdFountainThree = await db.createFob(fountainThree);

    return [createdFountainOne, createdFountainTwo, createdFountainThree];
  }

  async function createFountainRatings (user : IUser = null, fountain : Fob = null) {
    // First create user if necessary
    if (user == null) {
      user = await db.createUser(await getUser());
    }
    
    // Then create bathroom if necessary
    if (fountain == null) {
      fountain = await db.createFob(getFountain(user.id));
    }

    // Create fountain ratings
    const fountainRatingOne : IFountainRating = {
      id: generateFountainRatingId(),
      fob_id: fountain.id,
      user_id: user.id,
      details: {
        pressure: 1,
        taste: 1,
        temperature: 1
      } as IFountainRatingDetails
    }
    const fountainRatingTwo : IFountainRating = {
      id: generateFountainRatingId(),
      fob_id: fountain.id,
      user_id: user.id,
      details: {
        pressure: 2,
        taste: 2,
        temperature: 2
      } as IFountainRatingDetails
    }
    const fountainRatingThree : IFountainRating = {
      id: generateFountainRatingId(),
      fob_id: fountain.id,
      user_id: user.id,
      details: {
        pressure: 3,
        taste: 3,
        temperature: 3
      } as IFountainRatingDetails
    }

    const createdFountainRatingOne = await db.createRating(fountainRatingOne);
    const createdFountainRatingTwo = await db.createRating(fountainRatingTwo);
    const createdFountainRatingThree = await db.createRating(fountainRatingThree);

    return [createdFountainRatingOne, createdFountainRatingTwo, createdFountainRatingThree];
  }

  async function createPictures(entityId : string, userId : string) {
    // Create pictures
    const pictureOne = getPicture(entityId, userId, "https://www.google.com");
    const pictureTwo = getPicture(entityId, userId, "https://www.facebook.com");
    const pictureThree = getPicture(entityId, userId, "https://www.mail.google.com");

    const createdPictureOne = await db.createPicture(pictureOne);
    const createdPictureTwo = await db.createPicture(pictureTwo);
    const createdPictureThree = await db.createPicture(pictureThree);

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

  it("creates a fountain with authentication", async () => {
    const fountainToCreate = getFountain();
    const req = getAuthedReqMockForUser(await getUser(), {
      name: fountainToCreate.name,
      location: fountainToCreate.location,
      info: fountainToCreate.info
    } as IFountainCreationDetails);
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
    expectEntitiesEqual(res.message, createdFountains.filter((fountain) => (fountain as IFountain).info.bottle_filler));
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

    // Try to get all fountains within 50 meters of (5, 5)
    await simulateRouter(req, res, getFountainsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdFountains.filter((fountain) => calculateDistance(fountain.location, {latitude: 40.42492454100864, longitude: -86.91155253041734} as ILocation) < 40));
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
    // Copy new updated at
    createdFountains[0].updated_at = res.message.updated_at;
    expect(createdFountains[0]).to.deep.equal(res.message);
  });

  it("can't create a fountain picture without authentication", async () => {
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

  it("can't create a fountain picture with invalid URL", async () => {
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
    expect(res.message).to.satisfy((message) => message.startsWith("Invalid picture URL!"));
  });

  it("creates a fountain picture", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Set up picture to create
    req.params = {
      id: createdFountains[0].id
    };
    const pictureToCreate = getPicture(createdFountains[0].id, user.id);
    req.body = pictureToCreate.url; // valid picture link

    // Try to create fountain picture
    await simulateRouter(req, res, addFountainPictureFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_CREATED);
    // Copy generated properties
    pictureToCreate.id = res.message.id;
    pictureToCreate.created_at = res.message.created_at;
    pictureToCreate.updated_at = res.message.updated_at;
    expect(pictureToCreate).to.deep.equal(res.message);
  });

  it("can't get fountain pictures without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add pictures
    await createPictures(createdFountains[0].id, generateUserId());

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

  it("gets fountain pictures", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add pictures
    const createdPictures = await createPictures(createdFountains[0].id, user.id);

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

  it("can't get a particular picture without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add pictures
    const createdPictures = await createPictures(createdFountains[0].id, generateUserId());

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

  it("successfully gets a particular picture", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add pictures
    const createdPictures = await createPictures(createdFountains[0].id, user.id);

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

  it("successfully deletes a picture while authenticated", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add pictures
    const createdPictures = await createPictures(createdFountains[0].id, user.id);

    // Set up request
    req.params = {
      pictureId: createdPictures[0].id
    };

    // Try to delete picture
    await simulateRouter(req, res, deleteFountainPictureFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);

    // Picture should not exist
    const picture = await db.getPictureById(createdPictures[0].id);
    expect(picture).to.be.undefined;
  });

  it("can't create fountain rating without authentication", async () => {
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

  it("can't create a fountain rating with invalid scores", async () => {
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
    expect(res.message).to.satisfy((message) => message.startsWith("Invalid rating detail value(s)!"));
  });

  it("successfully creates a fountain rating", async () => {
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
    expect(res.sentStatus).to.equal(constants.HTTP_CREATED);
    expectEntitiesEqual(res.message.details, req.body);
  });

  it("successfully gets all ratings for a particular fountain", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Create a few ratings for a particular fountain
    const createdFountainRatings = await createFountainRatings(user, createdFountains[0]);

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

  it("can't get a particular fountain rating without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add ratings
    const createdFountainRatings = await createFountainRatings(await getUser(), createdFountains[0]);

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

  it("successfully gets a particular fountain rating", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFountains = await createFountains();

    // Add ratings
    const createdFountainRatings = await createFountainRatings(user, createdFountains[0]);

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
    const createdFountainRatings = await createFountainRatings(await getUser(), createdFountains[0]);

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
    const createdFountainRatings = await createFountainRatings(user, createdFountains[0]);

    // Specify fountain rating updates in request
    createdFountainRatings[0].details = createdFountainRatings[1].details;
    req.params = {
      ratingId: createdFountainRatings[0].id
    };
    req.body = createdFountainRatings[0].details;

    // Try to update fountain rating
    await simulateRouter(req, res, updateFountainRatingFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    // Copy new updated at
    createdFountainRatings[0].updated_at = res.message.updated_at;
    expect(createdFountainRatings[0]).to.deep.equal(res.message);
  });
});
