import {authenticateRequest} from "../utils/auth";
import {getReqMock, getResMock, simulateRouter} from "../testHelper.test";
import {expect} from "chai";
import * as constants from "../utils/constants";
import {getFountains} from "./fountainsController";

describe("FOUNTAINS: CRUD of all kinds", () => {
  const getFountainsFuncs = [authenticateRequest, getFountains];

  it("can't get fountains without authentication", async () => {
    const req = getReqMock();
    const res = getResMock();

    // Try to get fountains
    await simulateRouter(req, res, getFountainsFuncs);

    // Should have failed with unauthorized
    expect(res.sentStatus).to.equal(constants.HTTP_UNAUTHORIZED);
    expect(res.message).to.equal(constants.HTTP_UNAUTHORIZED_MESSAGE);
  });
});
