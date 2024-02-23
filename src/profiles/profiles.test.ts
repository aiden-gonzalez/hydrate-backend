import {getAuthedReqMockForUser, getNextMock, getReqMock, getResMock, getUser} from "../testHelper.test";
import assert from "assert";
import * as constants from "../utils/constants";
import {getProfileForUser, updateProfile} from "./profilesController";
import {authenticateRequest} from '../utils/auth';
import * as database from "../utils/database";

describe("PROFILES: getting and updating profiles", async () => {
  const user = await getUser();

  // TODO NEED TO FIX ALL OF THESE TO USE THE MIDDLEWARE FUNCTIONS TOO
  it("can't get a user profile without authentication", async () => {
    const res = getResMock();
    const req = getReqMock();
    req.params = {
      username: user.username
    };
    const next = getNextMock();

    authenticateRequest(req, res, next);
    // Should have failed with unauthorized
    assert(res.sentStatus == constants.HTTP_UNAUTHORIZED);
    assert(res.message == constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("fails to find a profile for user that doesn't exist", async () => {
    const req = getAuthedReqMockForUser(user);
    req.params = {
      username: user.username
    };
    const res = getResMock();

    // Try to get a user profile
    await getProfileForUser(req, res);
    // Should have failed with not found
    assert(res.sentStatus == constants.HTTP_NOT_FOUND);
    assert(res.message = constants.HTTP_NOT_FOUND_MESSAGE);
  });

  it("finds a user profile that does exist", async () => {
    const req = getAuthedReqMockForUser(user);
    req.params = {
      username: user.username
    };
    const res = getResMock();

    // First create user in database
    await database.createUser(user);
    // Now try to get the user profile
    await getProfileForUser(req, res);
    // Should have succeeded
    assert(res.sentStatus == constants.HTTP_OK);
    assert(res.message == user.profile);
  });

  it("fails to update a profile not owned by the requesting user", async () => {
    const req = getAuthedReqMockForUser(user);
    req.params = {
      username: "some_other_username"
    };
    const res = getResMock();

    // Try to get the user profile
    await updateProfile(req, res);
    // Should have falied with forbidden
    assert(res.sentStatus == constants.HTTP_FORBIDDEN);
    assert(res.message == constants.HTTP_FORBIDDEN_MESSAGE);
  });
});