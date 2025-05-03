import {
  expectEntitiesEqual,
  getAuthedReqMockForUser,
  getReqMock,
  getResMock,
  getUser,
  simulateRouter
} from "../testHelper.test";
import * as constants from "../utils/constants";
import {
  getPicture,
  deletePicture
} from "./picturesController";
import {authenticateRequest} from '../utils/auth';
import * as db from "../db/queries";
import {expect} from "chai";
import {generateBathroomId, generateFountainId, generateUserId} from "../utils/generate";
import {NewFob} from "../db/types";
import * as testUtil from '../testHelper.test';

describe("PICTURES: getting and deleting pictures", () => {
  const getPictureFuncs = [authenticateRequest, getPicture];
  const deletePictureFuncs = [authenticateRequest, deletePicture];

  async function createFobs(user = null) {
    // Create user if necessary
    if (user == null) {
      user = await db.createUser(await getUser());
    }

    // Create fountain
    const fountain : NewFob = {
      id: generateFountainId(),
      user_id: user.id,
      name: "Fountain",
      location: {
        latitude: 40.42476607308126,
        longitude: -86.9114030295504
      },
      info: {
        bottle_filler: true,
      }
    };

    // Create bathroom
    const bathroom : NewFob = {
      id: generateBathroomId(),
      user_id: user.id,
      name: "Bathroom",
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

    const createdFobOne = await db.createFob(fountain);
    const createdFobTwo = await db.createFob(bathroom);

    return [createdFobOne, createdFobTwo];
  }

  async function createPictures(entityId : string, userId : string) {
    // Create pictures
    const pictureOne = testUtil.getPicture(entityId, userId, "https://www.google.com");
    const pictureTwo = testUtil.getPicture(entityId, userId, "https://www.facebook.com");
    const pictureThree = testUtil.getPicture(entityId, userId, "https://www.mail.google.com");

    const createdPictureOne = await db.createPicture(pictureOne);
    const createdPictureTwo = await db.createPicture(pictureTwo);
    const createdPictureThree = await db.createPicture(pictureThree);

    return [createdPictureOne, createdPictureTwo, createdPictureThree];
  }

  it("can't get a picture without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Create bathrooms
    const createdFobs = await createFobs();

    // Add pictures
    const createdPictures = await createPictures(createdFobs[0].id, generateUserId());

    // Set up request
    req.params = {
      id: createdPictures[0].id
    };

    // Try to get picture
    await simulateRouter(req, res, getPictureFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
  });

  it("successfully gets a particular picture", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create bathrooms
    const createdFobs = await createFobs();

    // Add pictures
    const createdPictures = await createPictures(createdFobs[0].id, user.id);

    // Set up request
    req.params = {
      id: createdPictures[0].id
    };

    // Try to get picture
    await simulateRouter(req, res, getPictureFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expectEntitiesEqual(res.message, createdPictures[0]);
  });

  it("successfully deletes a picture while authenticated", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    const res = getResMock();

    // Create fountains
    const createdFobs = await createFobs();

    // Add pictures
    const createdPictures = await createPictures(createdFobs[0].id, user.id);

    // Set up request
    req.params = {
      id: createdPictures[0].id
    };

    // Try to delete picture
    await simulateRouter(req, res, deletePictureFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);

    // Picture should not exist
    const picture = await db.getPictureById(createdPictures[0].id);
    expect(picture).to.be.undefined;
  });
});
