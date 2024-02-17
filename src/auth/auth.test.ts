import {getNextMock, getReqMock, getResMock, getUser} from "../testHelper.test";
import {findUserMiddleware, validatePassword} from "./authController";
import assert from "assert";
import * as constants from "../utils/constants";
import {User} from "../mongoDB";
import {IAuthRequest} from "./types";
import {IUser} from "../utils/types";

describe("AUTH: logging in user", () => {
  let user : IUser = null;
  const authRequest : IAuthRequest = {
    user_credentials: {
      email: "unknown@gmail.com",
      password: "wrong password"
    }
  };
  const res = getResMock();
  const next = getNextMock();

  it("fails to find an unknown user", async () => {
    user = await getUser();
    const req = getReqMock(null, authRequest);

    // Don't create user before attempting to log in
    await findUserMiddleware(req, res, next);
    // Login should have failed
    assert(res.sentStatus == constants.HTTP_UNAUTHORIZED);
    assert(res.message == constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("finds a known user", async () => {
    authRequest.user_credentials.email = user.email;
    const req = getReqMock(null, authRequest);

    // Create user before login attempt
    const userModel = new User(user);
    await userModel.save();
    await findUserMiddleware(req, res, next);
    // User should have been found
    assert(req.user !== null);
    assert(req.user.id === user.id);
    assert(req.user.email === user.email);
  });

  it("fails to return tokens if password is wrong", async () => {
    const req = getReqMock(null, authRequest);

    // Assume user already found
    req.user = user;

    await validatePassword(req, res);
    // Login should have failed
    assert(res.sentStatus == constants.HTTP_UNAUTHORIZED);
    assert(res.message == constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("returns tokens if password is correct", async () => {
    authRequest.user_credentials.password = "password";
    const req = getReqMock(null, authRequest);

    // Assume user already found
    req.user = user;

    await validatePassword(req, res);
    // Login should have succeeded
    assert(res.sentStatus == constants.HTTP_OK);
    assert(res.message.access_token !== null);
    assert(res.message.refresh_token !== null);
    assert(res.message.token_type === constants.JWT_TYPE);
    assert(res.message.expires === constants.JWT_ACCESS_EXPIRATION);
  });

  it ("validates refresh token and returns new tokens", async () => {
    assert(true);
  });
});
