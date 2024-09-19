import {getReqMock, getResMock, getUser} from "../testHelper.test";
import * as constants from "../utils/constants";
import * as db from '../db/queries';
import {ISignupRequest} from "./types";
import {createAccount} from "../signup/signupController";
import {expect} from "chai";

describe("SIGNUP: registering a new user", () => {
  const signupRequest : ISignupRequest = {
    username: "testusername",
    user_credentials: {
      email: "test@gmail.com",
      password: "test_password123"
    }
  };
  const res = getResMock();

  it("registers a new user", async () => {
    const req = getReqMock(null, signupRequest);

    // Try to create an account
    await createAccount(req, res);

    // Should have worked
    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    const newUser = await db.getUserByUsername(signupRequest.username);
    expect(newUser).to.not.equal(null);
    expect(newUser.username).to.equal(signupRequest.username);
    expect(newUser.email).to.equal(signupRequest.user_credentials.email);
  });

  it("fails to register an existing user", async () => {
    const req = getReqMock(null, signupRequest);

    // Create user before create signup
    const newUser = await getUser();
    newUser.username = signupRequest.username;
    await db.createUser(newUser);

    // Now try to sign up
    await createAccount(req, res);
    // Should have been a 403 error
    expect(res.sentStatus).to.equal(constants.HTTP_FORBIDDEN);
  });
});