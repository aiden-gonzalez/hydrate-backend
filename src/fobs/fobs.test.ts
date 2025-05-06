import {authenticateRequest} from "../utils/auth";
import {
  expectEntitiesEqual,
  getAuthedReqMockForUser, getBathroom,
  getFountain,
  getFountainRatingDetails,
  getPicture,
  getReqMock,
  getResMock,
  getUser, removeAverageRating,
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
  getFobRatings,
  addFobRating,
  getFobRating,
  updateFobRating,
  getFobWithDetails
} from "./fobsController";
import {
  IFob,
  IFobCreationDetails,
  IRating,
  IFountainRatingDetails,
  IFountainInfo, IBathroomRatingDetails
} from "./types";
import * as db from "../db/queries";
import {
  generateFountainId,
  generateFountainRatingId,
  generateBathroomId,
  generateUserId,
  generateBathroomRatingId
} from "../utils/generate";
import {ILocation, IUser} from "../utils/types";
import {calculateDistance} from "../utils/calculation";
import {Fob, NewFob} from "../db/types";

describe("FOBS: CRUD of all kinds", () => {
  const getFobsFuncs = [authenticateRequest, getFobs];
  const createFobFuncs = [authenticateRequest, createFob];
  const getFobFuncs = [authenticateRequest, getFobById];
  const updateFobFuncs = [authenticateRequest, updateFob];
  const getFobPicturesFuncs = [authenticateRequest, getFobPictures];
  const addFobPictureFuncs = [authenticateRequest, addFobPicture];
  const getFobRatingsFuncs = [authenticateRequest, getFobRatings];
  const addFobRatingFuncs = [authenticateRequest, addFobRating];
  const getFobRatingFuncs = [authenticateRequest, getFobRating];
  const updateFobRatingFuncs = [authenticateRequest, ratingPermissionCheck, updateFobRating];
  const getFobWithDetailsFuncs = [authenticateRequest, getFobWithDetails];

  // TODO add more unhappy paths? Malformed data, bad responses?

  async function createFobs(user = null) {
    // Create user if necessary
    if (user == null) {
      user = await db.createUser(await getUser());
    }

    // Create fountains
    const fountainOne : NewFob = {
      id: generateFountainId(),
      user_id: user.id,
      name: "Fob One",
      location: {
        latitude: 40.42476607308126,
        longitude: -86.9114030295504
      },
      info: {
        bottle_filler: true,
      }
    };
    const fountainTwo : NewFob = {
      id: generateFountainId(),
      user_id: user.id,
      name: "Fob Two",
      location: {
        latitude: 40.42486535509428,
        longitude: -86.91207343967577
      },
      info: {
        bottle_filler: false,
      }
    };
    const fountainThree : NewFob = {
      id: generateFountainId(),
      user_id: user.id,
      name: "Fob Three",
      location: {
        latitude: 40.425193836261464,
        longitude: -86.9112570893454
      },
      info: {
        bottle_filler: true,
      }
    };

    // Create bathrooms
    const bathroomOne : NewFob = {
      id: generateBathroomId(),
      user_id: user.id,
      name: "Bathroom One",
      location: {
        latitude: 40.424766046533,
        longitude: -86.911403067846
      },
      info: {
        gender: "female",
        baby_changer: true,
        sanitary_products: false
      }
    };
    const bathroomTwo : NewFob = {
      id: generateBathroomId(),
      user_id: user.id,
      name: "Bathroom Two",
      location: {
        latitude: 40.4248653569847,
        longitude: -86.91207343234
      },
      info: {
        gender: "male",
        baby_changer: true,
        sanitary_products: false
      }
    };
    const bathroomThree : NewFob = {
      id: generateBathroomId(),
      user_id: user.id,
      name: "Bathroom Three",
      location: {
        latitude: 40.42519386737,
        longitude: -86.91125797826
      },
      info: {
        gender: "female",
        baby_changer: false,
        sanitary_products: true
      }
    };

    const createdFobOne = await db.createFob(fountainOne);
    const createdFobTwo = await db.createFob(fountainTwo);
    const createdFobThree = await db.createFob(fountainThree);
    const createdFobFour = await db.createFob(bathroomOne);
    const createdFobFive = await db.createFob(bathroomTwo);
    const createdFobSix = await db.createFob(bathroomThree);

    return [createdFobOne, createdFobTwo, createdFobThree, createdFobFour, createdFobFive, createdFobSix];
  }

  async function createRatings (user : IUser = null, fob : Fob = null) {
    // First create user if necessary
    if (user == null) {
      user = await db.createUser(await getUser());
    }
    
    // Then create fob if necessary
    if (fob == null) {
      fob = await db.createFob(getFountain(user.id));
    }

    // Create fob ratings
    const fountainRatingOne : IRating = {
      id: generateFountainRatingId(),
      fob_id: fob.id,
      user_id: user.id,
      details: {
        pressure: 1,
        taste: 1,
        temperature: 1
      } as IFountainRatingDetails
    }
    const fountainRatingTwo : IRating = {
      id: generateFountainRatingId(),
      fob_id: fob.id,
      user_id: user.id,
      details: {
        pressure: 2,
        taste: 2,
        temperature: 2
      } as IFountainRatingDetails
    }
    const fountainRatingThree : IRating = {
      id: generateFountainRatingId(),
      fob_id: fob.id,
      user_id: user.id,
      details: {
        pressure: 3,
        taste: 3,
        temperature: 3
      } as IFountainRatingDetails
    }

    const createdFobRatingOne = await db.createRating(fountainRatingOne);
    const createdFobRatingTwo = await db.createRating(fountainRatingTwo);
    const createdFobRatingThree = await db.createRating(fountainRatingThree);

    return [createdFobRatingOne, createdFobRatingTwo, createdFobRatingThree];
  }

  async function createBathroomRatings (user : IUser = null, bathroom : Fob = null) {
    // First create user if necessary
    if (user == null) {
      user = await db.createUser(await getUser());
    }

    // Then create bathroom if necessary
    if (bathroom == null) {
      bathroom = await db.createFob(getBathroom(user.id));
    }

    // Then create bathroom ratings
    const bathroomRatingOne : IRating = {
      id: generateBathroomRatingId(),
      fob_id: bathroom.id,
      user_id: user.id,
      details: {
        cleanliness: 1,
        decor: 1,
        drying: 1,
        privacy: 1,
        washing: 1
      } as IBathroomRatingDetails
    }
    const bathroomRatingTwo : IRating = {
      id: generateBathroomRatingId(),
      fob_id: bathroom.id,
      user_id: user.id,
      details: {
        cleanliness: 2,
        decor: 2,
        drying: 2,
        privacy: 2,
        washing: 2
      } as IBathroomRatingDetails
    }
    const bathroomRatingThree : IRating = {
      id: generateBathroomRatingId(),
      fob_id: bathroom.id,
      user_id: user.id,
      details: {
        cleanliness: 3,
        decor: 3,
        drying: 3,
        privacy: 3,
        washing: 3
      } as IBathroomRatingDetails
    }

    const createdBathroomRatingOne = await db.createRating(bathroomRatingOne);
    const createdBathroomRatingTwo = await db.createRating(bathroomRatingTwo);
    const createdBathroomRatingThree = await db.createRating(bathroomRatingThree);

    return [createdBathroomRatingOne, createdBathroomRatingTwo, createdBathroomRatingThree];
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

  it("can't create a fob without authentication", async () => {
    const req = getReqMock(null, getFountain().info);
    const res = getResMock();

    // Try to create fountain
    await simulateRouter(req, res, createFobFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
  });

  it("creates a fountain with authentication", async () => {
    const fountainToCreate = getFountain();
    const req = getAuthedReqMockForUser(await getUser(), {
      name: fountainToCreate.name,
      location: fountainToCreate.location,
      info: fountainToCreate.info
    } as IFobCreationDetails);
    const res = getResMock();

    // Try to create fountain
    await simulateRouter(req, res, createFobFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_CREATED);
    expect(fountainToCreate.info).to.deep.equal(res.message.info);
  });

  it("can't get fountains without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Try to get fountains
    await simulateRouter(req, res, getFobsFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
  });

  it("gets all fountains with authentication", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFobs = await createFobs();

    // Try to get all fountains
    await simulateRouter(req, res, getFobsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    removeAverageRating(res.message as IFob[]);
    expectEntitiesEqual(res.message, createdFobs);
  });

  // Skipping this one because this feature is no longer implemented
  // but it'd be nice to re-implement it another time
  it.skip("gets all fountains with bottle fillers", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFobs = await createFobs();

    // Set up query
    req.query = {
      bottle_filler: true
    };

    // Try to get all fountains with bottle fillers
    await simulateRouter(req, res, getFobsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdFobs.filter((fountain) => ((fountain as IFob).info as IFountainInfo).bottle_filler));
  });

  it ("gets all bathrooms within a certain radius of a point", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createFobs();

    // Set up query
    req.query = {
      latitude: 40.42492454100864,
      longitude: -86.91155253041734,
      radius: 40 // in meters
    }

    // Try to get all bathrooms within 50 meters of (5, 5)
    await simulateRouter(req, res, getFobsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    removeAverageRating(res.message as IFob[]);
    expectEntitiesEqual(res.message, createdBathrooms.filter((bathroom) => calculateDistance(bathroom.location, {latitude: 40.42492454100864, longitude: -86.91155253041734} as ILocation) < 40));
  });

  it ("can't get a particular bathroom without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createFobs();

    // Specify an ID in request
    req.params = {
      id: createdBathrooms[0].id
    };

    // Try to get bathroom
    await simulateRouter(req, res, getFobFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
  });

  it ("gets a particular bathroom", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createFobs();

    // Specify an ID in request
    req.params = {
      id: createdBathrooms[0].id
    };

    // Try to get bathroom
    await simulateRouter(req, res, getFobFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expect(createdBathrooms[0]).to.deep.equal(res.message);
  });

  it ("can't update a bathroom without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createFobs();

    // Specify bathroom updates in request
    createdBathrooms[0].info = createdBathrooms[1].info;
    req.params = {
      id: createdBathrooms[0].id
    };
    req.body = createdBathrooms[0].info;

    // Try to update bathroom
    await simulateRouter(req, res, updateFobFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
  });

  it ("updates a fountain", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFobs = await createFobs();

    // Specify fountain updates in request
    createdFobs[0].info = createdFobs[1].info;
    req.params = {
      id: createdFobs[0].id
    };
    req.body = createdFobs[0].info;

    // Try to update fountain
    await simulateRouter(req, res, updateFobFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    // Copy new updated at
    createdFobs[0].updated_at = res.message.updated_at;
    expect(createdFobs[0]).to.deep.equal(res.message);
  });

  it("can't create a fountain picture without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFobs = await createFobs();

    // Set up picture to create
    req.params = {
      id: createdFobs[0].id
    };
    req.body = "https://www.google.com"; // picture link

    // Try to create fountain picture
    await simulateRouter(req, res, addFobPictureFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
  });

  it("can't create a fountain picture with invalid URL", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFobs = await createFobs();

    // Set up picture to create
    req.params = {
      id: createdFobs[0].id
    };
    req.body = {
      "url": "not a url" // invalid picture link
    };

    // Try to create fountain picture
    await simulateRouter(req, res, addFobPictureFuncs);

    // Should have failed with 400
    expect(res.sentStatus).to.equal(constants.HTTP_BAD_REQUEST);
    expect(res.message).to.satisfy((message) => message.startsWith("Invalid picture URL!"));
  });

  it("creates a fountain picture", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFobs = await createFobs();

    // Set up picture to create
    req.params = {
      id: createdFobs[0].id
    };
    const pictureToCreate = getPicture(createdFobs[0].id, user.id);
    req.body = {
      "url": pictureToCreate.url
    }; // valid picture link

    // Try to create fountain picture
    await simulateRouter(req, res, addFobPictureFuncs);

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
    const createdFobs = await createFobs();

    // Add pictures
    await createPictures(createdFobs[0].id, generateUserId());

    // Set up request
    req.params = {
      id: createdFobs[0].id
    };

    // Try to get pictures
    await simulateRouter(req, res, getFobPicturesFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
  });

  it("gets bathroom pictures", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createFobs();

    // Add pictures
    const createdPictures = await createPictures(createdBathrooms[0].id, user.id);

    // Set up request
    req.params = {
      id: createdBathrooms[0].id
    };

    // Try to get pictures
    await simulateRouter(req, res, getFobPicturesFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdPictures);
  });

  it("can't create fountain rating without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFobs = await createFobs();

    // Set up request
    req.params = {
      id: createdFobs[0].id
    };
    req.body = getFountainRatingDetails();

    // Try to add rating
    await simulateRouter(req, res, addFobRatingFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
  });

  it("can't create a fountain rating with invalid scores", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFobs = await createFobs();

    // Set up request
    req.params = {
      id: createdFobs[0].id
    };
    req.body = getFountainRatingDetails(10, -5, 0);

    // Try to add rating
    await simulateRouter(req, res, addFobRatingFuncs);

    // Should have failed with bad request
    expect(res.sentStatus).to.equal(constants.HTTP_BAD_REQUEST);
    expect(res.message).to.satisfy((message) => message.startsWith("Invalid rating detail value(s)!"));
  });

  it("successfully creates a fountain rating", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFobs = await createFobs();

    // Set up request
    req.params = {
      id: createdFobs[0].id
    };
    req.body = getFountainRatingDetails();

    // Try to add rating
    await simulateRouter(req, res, addFobRatingFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_CREATED);
    expectEntitiesEqual(res.message.details, req.body);
  });

  it("successfully gets all ratings for a particular bathroom", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createFobs(user);

    // Create a few ratings for a particular bathroom
    const createdBathroomRatings = await createBathroomRatings(user, createdBathrooms[0]);

    // Set up request
    req.params = {
      id: createdBathrooms[0].id
    };

    // Try to get ratings
    await simulateRouter(req, res, getFobRatingsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdBathroomRatings);
  });

  it("can't get a particular bathroom rating without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createFobs();

    // Add ratings
    const createdBathroomRatings = await createBathroomRatings(await getUser(), createdBathrooms[0]);

    // Set up request
    req.params = {
      ratingId: createdBathroomRatings[0].id
    };

    // Try to get bathroom rating
    await simulateRouter(req, res, getFobRatingFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
  });

  it("successfully gets a particular bathroom rating", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdBathrooms = await createFobs();

    // Add ratings
    const createdBathroomRatings = await createBathroomRatings(user, createdBathrooms[0]);

    // Set up request
    req.params = {
      ratingId: createdBathroomRatings[0].id
    };

    // Try to get bathroom rating
    await simulateRouter(req, res, getFobRatingFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdBathroomRatings[0]);
  });

  it ("can't update a fountain rating without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fountains
    const createdFobs = await createFobs();

    // Create ratings
    const createdFobRatings = await createRatings(await getUser(), createdFobs[0]);

    // Specify fountain rating updates in request
    createdFobRatings[0].details = createdFobRatings[1].details;
    req.params = {
      ratingId: createdFobRatings[0].id
    };
    req.body = createdFobRatings[0].details;

    // Try to update fountain rating
    await simulateRouter(req, res, updateFobRatingFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
  });

  it ("updates a fountain rating", async () => {
    const user : IUser = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFobs = await createFobs();

    // Create ratings
    const createdFobRatings = await createRatings(user, createdFobs[0]);

    // Specify fountain rating updates in request
    createdFobRatings[0].details = createdFobRatings[1].details;
    req.params = {
      ratingId: createdFobRatings[0].id
    };
    req.body = createdFobRatings[0].details;

    // Try to update fountain rating
    await simulateRouter(req, res, updateFobRatingFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    // Copy new updated at
    createdFobRatings[0].updated_at = res.message.updated_at;
    expect(createdFobRatings[0]).to.deep.equal(res.message);
  });

  it("can't get fob with details without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create fobs
    const createdFobs = await createFobs();

    // Specify an ID in request
    req.params = {
      id: createdFobs[0].id
    };

    // Try to get fob details
    await simulateRouter(req, res, getFobWithDetailsFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
  });

  it("gets fob details with pictures and ratings", async () => {
    const user = await db.createUser(await getUser());
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fobs
    const createdFobs = await createFobs(user);

    // Add pictures and ratings
    const createdPictures = await createPictures(createdFobs[0].id, user.id);
    const createdRatings = await createRatings(user, createdFobs[0]);

    // Specify an ID in request
    req.params = {
      id: createdFobs[0].id
    };

    // Try to get fob details
    await simulateRouter(req, res, getFobWithDetailsFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expect(res.message).to.deep.equal({
      fob: createdFobs[0],
      user: user,
      pictures: createdPictures,
      ratingsWithDetails: createdRatings.map((rating) => { return {
        user: user,
        rating: rating
      }})
    });
  });

  it("returns 404 for non-existent fob with details", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Specify a non-existent ID in request
    req.params = {
      id: "non-existent-id"
    };

    // Try to get fob details
    await simulateRouter(req, res, getFobWithDetailsFuncs);

    // Should have failed with not found
    expect(res.sentStatus).to.equal(constants.HTTP_NOT_FOUND);
  });
});
