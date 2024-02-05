import {getNextMock, getReqMock, getResMock, getUser} from "../testHelper.test";
import assert from "assert";
import * as constants from "../utils/constants";
import {User} from "../mongoDB";
import {ISignupRequest} from "./types";
import {IUser} from "../utils/types";
import {createAccount} from "../signup/signupController";

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

    await createAccount(req, res);
    // Should have worked
    assert(res.sentStatus == constants.HTTP_OK);
    const newUser = await User.findOne({ email: signupRequest.user_credentials.email }).exec();
    assert(newUser !== null);
    assert(newUser.email == signupRequest.user_credentials.email);
  });

  it("fails to register an existing user", async () => {
    const req = getReqMock(null, signupRequest);

    // Create user before create signup
    const newUser = await getUser();
    newUser.email = signupRequest.user_credentials.email;
    const newUserDocument = new User(newUser);
    await newUserDocument.save();

    // Now try to sign up
    await createAccount(req, res);
    // Should have been a 403 error
    assert(res.sentStatus == constants.HTTP_FORBIDDEN);
  });
});