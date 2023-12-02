import {getNextMock, getReqMock, getResMock, getUser} from "../testHelper.test";
import {validateUser} from "./authController";
import assert from "assert";
import * as constants from "../utils/constants";
import {User} from "../mongoDB";
import {IAuthRequest} from "./types";

describe("AUTH: dealing with tokens", () => {
  it("fails to log in unknown user", async () => {
    const authRequest : IAuthRequest = {
      user_credentials: {
        email: "unknown@gmail.com",
        password: "password"
      }
    }
    const req = getReqMock(null, authRequest);
    const res = getResMock();
    const next = getNextMock();

    // Don't create user before attempting to log in
    await validateUser(req, res, next);
    // Login should have failed
    assert(res.sentStatus == constants.HTTP_UNAUTHORIZED);
    assert(res.message == constants.HTTP_UNAUTHORIZED_MESSAGE);
    assert(!next["called"]);
  });

  it("logs in a known user", async () => {
    const req = getReqMock();
    const res = getResMock();
    const next = getNextMock();
    const user = await getUser();

    // Create user before login attempt
    const userModel = new User(user);
    await userModel.save();
    await validateUser(req, res, next);
    // Login should have succeeded
    assert(req.user == user);
    assert(next["called"]);
  });
});