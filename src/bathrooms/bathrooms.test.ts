import {authenticateRequest} from "../utils/auth";
import {
  getAuthedReqMockForUser,
  getBathroom,
  getBathroomRatingDetails,
  getPicture,
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
import {setupBathroomReq} from "./bathroomsRouter";
import { IBathroom, IBathroomRating, IBathroomRatingDetails } from "./types";
import * as database from "../utils/database";
import {generateBathroomId, generateBathroomRatingId, generateUserId} from "../utils/generate";
import {ILocation, IUser} from "../utils/types";
import {Bathroom, BathroomRating} from "../mongoDB";
import {calculateDistance} from "../utils/calculation";

describe("BATHROOMS: CRUD of all kinds", () => {
  const getBathroomsFuncs = [authenticateRequest, setupBathroomReq, getFobs];
  const createBathroomFuncs = [authenticateRequest, setupBathroomReq, createFob];
  const getBathroomFuncs = [authenticateRequest, setupBathroomReq, getFobById];
  const updateBathroomFuncs = [authenticateRequest, setupBathroomReq, updateFob];
  const getBathroomPicturesFuncs = [authenticateRequest, setupBathroomReq, getFobPictures];
  const addBathroomPictureFuncs = [authenticateRequest, setupBathroomReq, addFobPicture];
  const getBathroomPictureFuncs = [authenticateRequest, setupBathroomReq, getFobPicture];
  const deleteBathroomPictureFuncs = [authenticateRequest, setupBathroomReq, deleteFobPicture];
  const getBathroomRatingsFuncs = [authenticateRequest, setupBathroomReq, getFobRatings];
  const addBathroomRatingFuncs = [authenticateRequest, setupBathroomReq, addFobRating];
  const getBathroomRatingFuncs = [authenticateRequest, setupBathroomReq, getFobRating];
  const updateBathroomRatingFuncs = [authenticateRequest, setupBathroomReq, ratingPermissionCheck, updateFobRating];

  // TODO add more unhappy paths? Malformed data, bad responses?

  async function createBathrooms(user_id = generateUserId()) {
    // Create bathrooms
    const bathroomOne : IBathroom = {
      id: generateBathroomId(),
      user_id: user_id,
      info: {
        name: "Bathroom One",
        gender: "female",
        baby_changer: true,
        sanitary_products: false,
        location: {
          latitude: 40.42476607308126,
          longitude: -86.9114030295504
        }
      }
    };
    const bathroomTwo : IBathroom = {
      id: generateBathroomId(),
      user_id: user_id,
      info: {
        name: "Bathroom Two",
        gender: "male",
        baby_changer: true,
        sanitary_products: false,
        location: {
          latitude: 40.42486535509428,
          longitude: -86.91207343967577
        }
      }
    };
    const bathroomThree : IBathroom = {
      id: generateBathroomId(),
      user_id: user_id,
      info: {
        name: "Bathroom Three",
        gender: "female",
        baby_changer: false,
        sanitary_products: true,
        location: {
          latitude: 40.425193836261464,
          longitude: -86.9112570893454
        }
      }
    };

    const createdBathroomOne = await database.createFob(Bathroom, bathroomOne);
    const createdBathroomTwo = await database.createFob(Bathroom, bathroomTwo);
    const createdBathroomThree = await database.createFob(Bathroom, bathroomThree);

    return [createdBathroomOne, createdBathroomTwo, createdBathroomThree];
  }

  async function createBathroomRatings (bathroomId : string, userId : string) {
    // Create bathroom ratings
    const bathroomRatingOne : IBathroomRating = {
      id: generateBathroomRatingId(),
      bathroom_id: bathroomId,
      user_id: userId,
      details: {
        cleanliness: 1,
        decor: 1,
        drying: 1,
        privacy: 1,
        washing: 1
      } as IBathroomRatingDetails
    }
    const bathroomRatingTwo : IBathroomRating = {
      id: generateBathroomRatingId(),
      bathroom_id: bathroomId,
      user_id: userId,
      details: {
        cleanliness: 2,
        decor: 2,
        drying: 2,
        privacy: 2,
        washing: 2
      } as IBathroomRatingDetails
    }
    const bathroomRatingThree : IBathroomRating = {
      id: generateBathroomRatingId(),
      bathroom_id: bathroomId,
      user_id: userId,
      details: {
        cleanliness: 3,
        decor: 3,
        drying: 3,
        privacy: 3,
        washing: 3
      } as IBathroomRatingDetails
    }

    const createdBathroomRatingOne = await database.createRating(BathroomRating, bathroomRatingOne);
    const createdBathroomRatingTwo = await database.createRating(BathroomRating, bathroomRatingTwo);
    const createdBathroomRatingThree = await database.createRating(BathroomRating, bathroomRatingThree);

    return [createdBathroomRatingOne, createdBathroomRatingTwo, createdBathroomRatingThree];
  }

  async function createPictures(entityId : string, userId : string) {
    // Create pictures
    const pictureOne = getPicture(entityId, userId, "https://www.google.com");
    const pictureTwo = getPicture(entityId, userId, "https://www.facebook.com");
    const pictureThree = getPicture(entityId, userId, "https://www.mail.google.com");

    const createdPictureOne = await database.createPicture(pictureOne);
    const createdPictureTwo = await database.createPicture(pictureTwo);
    const createdPictureThree = await database.createPicture(pictureThree);

    return [createdPictureOne, createdPictureTwo, createdPictureThree];
  }

  function expectEntitiesEqual(entitiesA, entitiesB) {
    expect(entitiesA).to.deep.equal(entitiesB);
    expect(entitiesA.length).to.equal(entitiesB.length);
    for (let i = 0; i < entitiesA.length; i++) {
      expect(entitiesA[i]).to.deep.equal(entitiesB.find((bathroom) => bathroom.id === entitiesA[i].id));
    }
  }

  it("can't create a bathroom without authentication", async () => {
    const req = getReqMock(null, getBathroom().info);
    const res = getResMock();

    // Try to create bathroom
    await simulateRouter(req, res, createBathroomFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("creates a bathroom with authentication", async () => {
    const bathroomToCreate = getBathroom();
    const req = getAuthedReqMockForUser(await getUser(), bathroomToCreate.info);
    const res = getResMock();

    // Try to create bathroom
    await simulateRouter(req, res, createBathroomFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_CREATED);
    expect(bathroomToCreate.info).to.deep.equal(res.message.info);
  });

  it("can't get bathrooms without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Try to get bathrooms
    await simulateRouter(req, res, getBathroomsFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("gets all bathrooms with authentication", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Try to get all bathrooms
    await simulateRouter(req, res, getBathroomsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdBathrooms);
  });

  it("gets all bathrooms with baby changers", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Set up query
    req.query = {
      baby_changer: true
    };

    // Try to get all bathrooms with baby changers
    await simulateRouter(req, res, getBathroomsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdBathrooms.filter((bathroom) => (bathroom as IBathroom).info.baby_changer));
  });

  it ("gets all bathrooms within a certain radius of a point", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Set up query
    req.query = {
      latitude: 40.42492454100864,
      longitude: -86.91155253041734,
      radius: 40 // in meters
    }

    // ensure index on bathroom location (needed for testing since collections get rapidly dropped)
    await Bathroom.ensureIndexes();

    // Try to get all bathrooms within 50 meters of (5, 5)
    await simulateRouter(req, res, getBathroomsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdBathrooms.filter((bathroom) => calculateDistance(bathroom.info.location, {latitude: 40.42492454100864, longitude: -86.91155253041734} as ILocation) < 40));
  });

  it ("can't get a particular bathroom without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Specify an ID in request
    req.params = {
      id: createdBathrooms[0].id
    };

    // Try to get bathroom
    await simulateRouter(req, res, getBathroomFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it ("gets a particular bathroom", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Specify an ID in request
    req.params = {
      id: createdBathrooms[0].id
    };

    // Try to get bathroom
    await simulateRouter(req, res, getBathroomFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expect(createdBathrooms[0]).to.deep.equal(res.message);
  });

  it ("can't update a bathroom without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Specify bathroom updates in request
    createdBathrooms[0].info = createdBathrooms[1].info;
    req.params = {
      id: createdBathrooms[0].id
    };
    req.body = createdBathrooms[0].info;

    // Try to update bathroom
    await simulateRouter(req, res, updateBathroomFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it ("updates a bathroom", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Specify bathroom updates in request
    createdBathrooms[0].info = createdBathrooms[1].info;
    req.params = {
      id: createdBathrooms[0].id
    };
    req.body = createdBathrooms[0].info;

    // Try to update bathroom
    await simulateRouter(req, res, updateBathroomFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expect(createdBathrooms[0]).to.deep.equal(res.message);
  });

  it("can't create a bathroom picture without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Set up picture to create
    req.params = {
      id: createdBathrooms[0].id
    };
    req.body = {
      url: "https://www.google.com"
    }; // picture link

    // Try to create bathroom picture
    await simulateRouter(req, res, addBathroomPictureFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("can't create a bathroom picture with invalid URL", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Set up picture to create
    req.params = {
      id: createdBathrooms[0].id
    };
    req.body = {
      url: "not a url"
    }; // invalid picture link

    // Try to create bathroom picture
    await simulateRouter(req, res, addBathroomPictureFuncs);

    // Should have failed with 400
    expect(res.sentStatus).to.equal(constants.HTTP_BAD_REQUEST);
    expect(res.message).to.satisfy((message) => message.startsWith("Picture validation failed"));
  });

  it("creates a bathroom picture", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Set up picture to create
    req.params = {
      id: createdBathrooms[0].id
    };
    const pictureToCreate = getPicture(createdBathrooms[0].id, user.id);
    req.body = pictureToCreate.info; // picture info with valid link

    // Try to create bathroom picture
    await simulateRouter(req, res, addBathroomPictureFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_CREATED);
    pictureToCreate.id = res.message.id;
    expect(pictureToCreate).to.deep.equal(res.message);
  });

  it("can't get bathroom pictures without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Add pictures
    await createPictures(createdBathrooms[0].id, generateUserId());

    // Set up request
    req.params = {
      id: createdBathrooms[0].id
    };

    // Try to get pictures
    await simulateRouter(req, res, getBathroomPicturesFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("gets bathroom pictures", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Add pictures
    const createdPictures = await createPictures(createdBathrooms[0].id, user.id);

    // Set up request
    req.params = {
      id: createdBathrooms[0].id
    };

    // Try to get pictures
    await simulateRouter(req, res, getBathroomPicturesFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdPictures);
  });

  it("can't get a particular picture without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Add pictures
    const createdPictures = await createPictures(createdBathrooms[0].id, generateUserId());

    // Set up request
    req.params = {
      pictureId: createdPictures[0].id
    };

    // Try to get picture
    await simulateRouter(req, res, getBathroomPictureFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("successfully gets a particular picture", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Add pictures
    const createdPictures = await createPictures(createdBathrooms[0].id, user.id);

    // Set up request
    req.params = {
      pictureId: createdPictures[0].id
    };

    // Try to get picture
    await simulateRouter(req, res, getBathroomPictureFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdPictures[0]);
  });

  it("successfully deletes a picture while authenticated", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Add pictures
    const createdPictures = await createPictures(createdBathrooms[0].id, user.id);

    // Set up request
    req.params = {
      pictureId: createdPictures[0].id
    };

    // Try to delete picture
    await simulateRouter(req, res, deleteBathroomPictureFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);

    // Picture should not exist
    const picture = await database.getPictureById(createdPictures[0].id);
    expect(picture).to.be.null;
  });

  it("can't create bathroom rating without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Set up request
    req.params = {
      id: createdBathrooms[0].id
    };
    req.body = getBathroomRatingDetails();

    // Try to add rating
    await simulateRouter(req, res, addBathroomRatingFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("can't create a bathroom rating with invalid scores", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Set up request
    req.params = {
      id: createdBathrooms[0].id
    };
    req.body = getBathroomRatingDetails(10, -5, 0);

    // Try to add rating
    await simulateRouter(req, res, addBathroomRatingFuncs);

    // Should have failed with bad request
    expect(res.sentStatus).to.equal(constants.HTTP_BAD_REQUEST);
    expect(res.message).to.satisfy((message) => message.startsWith("BathroomRating validation failed"));
  });

  it("successfully creates a bathroom rating", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Set up request
    req.params = {
      id: createdBathrooms[0].id
    };
    req.body = getBathroomRatingDetails();

    // Try to add rating
    await simulateRouter(req, res, addBathroomRatingFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_CREATED);
    expectEntitiesEqual(res.message.details, req.body);
  });

  it("successfully gets all ratings for a particular bathroom", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Create a few ratings for a particular bathroom
    const createdBathroomRatings = await createBathroomRatings(createdBathrooms[0].id, user.id);

    // Set up request
    req.params = {
      id: createdBathrooms[0].id
    };

    // Try to get ratings
    await simulateRouter(req, res, getBathroomRatingsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdBathroomRatings);
  });

  it("can't get a particular bathroom rating without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Add ratings
    const createdBathroomRatings = await createBathroomRatings(createdBathrooms[0].id, generateUserId());

    // Set up request
    req.params = {
      ratingId: createdBathroomRatings[0].id
    };

    // Try to get bathroom rating
    await simulateRouter(req, res, getBathroomRatingFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("successfully gets a particular bathroom rating", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Add ratings
    const createdBathroomRatings = await createBathroomRatings(createdBathrooms[0].id, user.id);

    // Set up request
    req.params = {
      ratingId: createdBathroomRatings[0].id
    };

    // Try to get bathroom rating
    await simulateRouter(req, res, getBathroomRatingFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdBathroomRatings[0]);
  });

  it ("can't update a bathroom rating without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Create ratings
    const createdBathroomRatings = await createBathroomRatings(createdBathrooms[0].id, generateUserId());

    // Specify bathroom rating updates in request
    createdBathroomRatings[0].details = createdBathroomRatings[1].details;
    req.params = {
      ratingId: createdBathroomRatings[0].id
    };
    req.body = createdBathroomRatings[0].details;

    // Try to update bathroom rating
    await simulateRouter(req, res, updateBathroomRatingFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it ("updates a bathroom rating", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createBathrooms();

    // Create ratings
    const createdBathroomRatings = await createBathroomRatings(createdBathrooms[0].id, user.id);

    // Specify bathroom rating updates in request
    createdBathroomRatings[0].details = createdBathroomRatings[1].details;
    req.params = {
      ratingId: createdBathroomRatings[0].id
    };
    req.body = createdBathroomRatings[0].details;

    // Try to update bathroom rating
    await simulateRouter(req, res, updateBathroomRatingFuncs);

    // Ignore updatedAt
    delete createdBathroomRatings[0]["updatedAt"];
    delete res.message.updatedAt;

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expect(createdBathroomRatings[0]).to.deep.equal(res.message);
  });
});
