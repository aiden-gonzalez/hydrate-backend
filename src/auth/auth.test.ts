import {getReqMock, getResMock, getUser, simulateRouter} from "../testHelper.test";
import {findUserMiddleware, validatePassword, validateRefresh} from "./authController";
import * as constants from "../utils/constants";
import {IAuthRefreshRequest, IAuthRequest} from "./types";
import {IUser} from "../utils/types";
import {expect} from "chai";
import * as db from '../db/queries';

describe("AUTH: logging in user", () => {
  let user : IUser = null;
  const authRequest : IAuthRequest = {
    user_credentials: {
      email: "unknown@gmail.com",
      password: "wrong password"
    }
  };
  const res = getResMock();
  const authFuncs = [findUserMiddleware, validatePassword];
  const refreshFuncs = [validateRefresh];

  it("fails to find an unknown user", async () => {
    user = await getUser();
    const req = getReqMock(null, authRequest);

    // Don't create user before attempting to log in
    await simulateRouter(req, res, authFuncs);

    // Login should have failed
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("finds a known user", async () => {
    authRequest.user_credentials.email = user.email;
    const req = getReqMock(null, authRequest);

    // Create user before login attempt
    await db.createUser(user);
    await simulateRouter(req, res, authFuncs);

    // User should have been found
    expect(req.dbUser).to.not.equal(null);
    expect(req.dbUser.id).to.equal(user.id);
    expect(req.dbUser.email).to.equal(user.email);
  });

  it("fails to return tokens if password is wrong", async () => {
    const req = getReqMock(null, authRequest);

    // Create user before login attempt
    await db.createUser(user);
    await simulateRouter(req, res, authFuncs);

    // Try to validate password
    await simulateRouter(req, res, authFuncs);

    // Login should have failed
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });

  it("returns tokens if password is correct", async () => {
    authRequest.user_credentials.password = "password";
    const req = getReqMock(null, authRequest);

    // Create user before login attempt
    await db.createUser(user);
    await simulateRouter(req, res, authFuncs);

    // Try to validate password
    await simulateRouter(req, res, authFuncs);

    // Login should have succeeded
    expectAuthResponse(res)
  });

  it ("validates refresh token and returns new tokens", async () => {
    let req = getReqMock(null, authRequest);

    // Create user before login attempt
    await db.createUser(user);
    await simulateRouter(req, res, authFuncs);

    // Validate password
    await simulateRouter(req, res, authFuncs);

    expect(res.sentStatus).to.equal(constants.HTTP_OK);
    expect(res.message);
    expect(res.message.access_token);
    expect(res.message.refresh_token);

    // Use tokens
    req = getReqMock(null, {
      refresh_token: res.message.refresh_token,
      expired_token: res.message.access_token,
    } as IAuthRefreshRequest);

    // Now attempt refresh
    await simulateRouter(req, res, refreshFuncs);

    // Refresh should have succeeded
    expectAuthResponse(res);
  });
});

function expectAuthResponse(res) {
  expect(res.sentStatus).to.equal(constants.HTTP_OK);
  expect(res.message.access_token).to.not.equal(null);
  expect(res.message.refresh_token).to.not.equal(null);
  expect(res.message.token_type).to.equal(constants.JWT_TYPE);
  expect(res.message.expires).to.equal(constants.JWT_ACCESS_EXPIRATION);
}
