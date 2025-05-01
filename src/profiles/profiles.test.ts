import {
  getAuthedReqMockForUser, getBathroom, getBathroomRating, getFountain, getFountainRating, getLocation, getPicture,
  getReqMock,
  getResMock,
  getUser,
  simulateRouter
} from "../testHelper.test";
import * as constants from "../utils/constants";
import {
  getContributionsForUser,
  getProfileForUser,
  getUserMiddleware,
  profilePermissionCheck,
  updateProfile
} from "./profilesController";
import {authenticateRequest} from '../utils/auth';
import * as db from "../db/queries";
import {IUserContributions, IProfile} from "./types";
import {expect} from "chai";

function copyTimestamps(obj_a, obj_b) {
  obj_a.created_at = obj_b.created_at;
  obj_a.updated_at = obj_b.updated_at;
}

describe("PROFILES: getting and updating profiles", () => {
  const getProfileFuncs = [authenticateRequest, getUserMiddleware, getProfileForUser];
  const updateProfileFuncs = [authenticateRequest, getUserMiddleware, profilePermissionCheck, updateProfile];
  const getContributionsFunc = [authenticateRequest, getUserMiddleware, getContributionsForUser];

  it("can't get a user profile without authentication", async () => {
    const user = await getUser();
    const req = getReqMock();
    req.params = {
      username: user.username
    };
    const res = getResMock();

    // Try to get user profile
    await simulateRouter(req, res, getProfileFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("fails to find a profile for user that doesn't exist", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    req.params = {
      username: user.username
    };
    const res = getResMock();

    // Try to get a user profile
    await simulateRouter(req, res, getProfileFuncs);

    // Should have failed with not found
    expect(res.sentStatus).to.equal(constants.HTTP_NOT_FOUND);
    expect(res.message).to.equal(constants.HTTP_NOT_FOUND_MESSAGE);
  });

  it("finds a user profile that does exist", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    req.params = {
      username: user.username
    };
    const res = getResMock();

    // First create user in database
    await db.createUser(user);

    // Now try to get the user profile
    await simulateRouter(req, res, getProfileFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expect(res.message).to.deep.equal(user.profile);
  });

  it("fails to update a profile that does not exist", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    req.params = {
      username: "some_other_username"
    };
    const res = getResMock();

    // Create requesting user in database, but not other user
    await db.createUser(user);

    // Try to get the user profile
    await simulateRouter(req, res, updateProfileFuncs);

    // Should have failed with forbidden
    expect(res.sentStatus).to.equal(constants.HTTP_NOT_FOUND);
    expect(res.message).to.equal(constants.HTTP_NOT_FOUND_MESSAGE);
  });

  it("fails to update a profile not owned by the requesting user", async () => {
    const user = await getUser();
    const otherUsername = "some_other_username";
    const otherUser = await getUser(otherUsername, "someotheremail@gmail.com");
    const req = getAuthedReqMockForUser(user);
    req.params = {
      username: otherUsername
    };
    const res = getResMock();

    // Create requesting user and other user in database
    await db.createUser(user);
    await db.createUser(otherUser);

    // Try to get the user profile
    await simulateRouter(req, res, updateProfileFuncs);

    // Should have failed with forbidden
    expect(res.sentStatus).to.equal(constants.HTTP_FORBIDDEN);
    expect(res.message).to.equal(constants.HTTP_FORBIDDEN_MESSAGE);
  });

  it("successfully updates a user profile that is owned by the requesting user", async () => {
    const newUserProfile : IProfile = {
      full_name: "Updated Name",
      picture_link: "https://www.facebook.com"
    };
    const user = await getUser();
    const req = getAuthedReqMockForUser(user, newUserProfile);
    req.params = {
      username: user.username
    };
    const res = getResMock();

    // First create user in database
    await db.createUser(user);

    // Now try to update the user profile
    await simulateRouter(req, res, updateProfileFuncs);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expect(res.message).to.deep.equal(newUserProfile);
  });

  it("fails to get user contributions without authentication", async () => {
    const user = await getUser();
    const req = getReqMock();
    req.params = {
      username: user.username
    };
    const res = getResMock();

    // Try to get user profile
    await simulateRouter(req, res, getContributionsFunc);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("fails to get user contributions for a user that doesn't exist", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    req.params = {
      username: user.username
    };
    const res = getResMock();

    // Try to get a user profile
    await simulateRouter(req, res, getContributionsFunc);

    // Should have failed with not found
    expect(res.sentStatus).to.equal(constants.HTTP_NOT_FOUND);
    expect(res.message).to.equal(constants.HTTP_NOT_FOUND_MESSAGE);
  });

  it("successfully gets user contributions for a user that does exist", async () => {
    const user = await getUser();
    const req = getAuthedReqMockForUser(user);
    req.params = {
      username: user.username
    };
    const res = getResMock();

    // First create user in database
    await db.createUser(user);

    // Create contributions
    const fountain = getFountain(user.id);
    const bathroom = getBathroom(user.id);
    bathroom.location = getLocation(40, -86);
    const contributions : IUserContributions = {
      fobs: [fountain, bathroom],
      ratings: [getFountainRating(fountain.id, user.id), getBathroomRating(bathroom.id, user.id)],
      pictures: [getPicture(fountain.id, user.id), getPicture(bathroom.id, user.id)]
    }
    await db.createFob(contributions.fobs[0]);
    await db.createFob(contributions.fobs[1]);
    await db.createRating(contributions.ratings[0]);
    await db.createRating(contributions.ratings[1]);
    await db.createPicture(contributions.pictures[0]);
    await db.createPicture(contributions.pictures[1]);

    // Now try to get the user contributions
    await simulateRouter(req, res, getContributionsFunc);

    // Should have succeeded
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    // Copy timestamps
    copyTimestamps(contributions.fobs[0], res.message.fountains[0]);
    copyTimestamps(contributions.fobs[1], res.message.bathrooms[0]);
    copyTimestamps(contributions.ratings[0], res.message.fountain_ratings[0]);
    copyTimestamps(contributions.ratings[1], res.message.bathroom_ratings[0]);
    copyTimestamps(contributions.pictures[0], res.message.pictures[0]);
    copyTimestamps(contributions.pictures[1], res.message.pictures[1]);
    expect(contributions).to.deep.equal(res.message);
  });

  // TODO from_date and to_date tests
});