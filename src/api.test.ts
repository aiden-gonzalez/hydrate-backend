import request from "supertest";
import {expect} from "chai";
import app from "./app";
import * as db from "./db/queries";
import * as constants from "./utils/constants";
import {generateToken} from "./utils/auth";
import {getDb} from "./db/database";
import {getFountain, getFountainRating, getLocation, getUser} from "./testHelper.test";
import {IUser} from "./utils/types";

// These tests go through the full express app (routing, OpenAPI validation, error handling)
// rather than calling controller functions directly.
describe("API: end to end requests through the express app", () => {
  const testDb = getDb();

  async function createUser(username: string, email: string) : Promise<IUser> {
    return db.createUser(await getUser(username, email));
  }

  function tokenFor(user: IUser, expiration = constants.JWT_ACCESS_EXPIRATION) {
    return generateToken(user, expiration);
  }

  beforeEach(async () => {
    await testDb.deleteFrom('user').execute();
    await testDb.deleteFrom('fob').execute();
  });

  after(async () => {
    await testDb.destroy();
  });

  it("serves the authenticated user's contributions at /api/me/contributions", async () => {
    const user = await createUser("meuser", "me@example.com");
    await db.createFob(getFountain(user.id));

    const res = await request(app)
      .get("/api/me/contributions")
      .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(user));

    expect(res.status).to.equal(constants.HTTP_OK);
    expect(res.body.fobs).to.have.length(1);
  });

  it("does not let a user update someone else's rating", async () => {
    const owner = await createUser("owner", "owner@example.com");
    const other = await createUser("other", "other@example.com");
    const fob = await db.createFob(getFountain(owner.id));
    const rating = await db.createRating(getFountainRating(fob.id, owner.id));

    const res = await request(app)
      .put(`/api/fobs/${fob.id}/ratings/${rating.id}`)
      .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(other))
      .send({pressure: 1, taste: 1, temperature: 1});

    expect(res.status).to.equal(constants.HTTP_FORBIDDEN);
    const unchanged = await db.getRating(rating.id);
    expect(unchanged.details).to.deep.equal(rating.details);
  });

  it("lets a user update their own rating", async () => {
    const owner = await createUser("owner", "owner@example.com");
    const fob = await db.createFob(getFountain(owner.id));
    const rating = await db.createRating(getFountainRating(fob.id, owner.id));

    const res = await request(app)
      .put(`/api/fobs/${fob.id}/ratings/${rating.id}`)
      .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(owner))
      .send({pressure: 1, taste: 2, temperature: 3});

    expect(res.status).to.equal(constants.HTTP_OK);
    expect(res.body.details).to.deep.equal({pressure: 1, taste: 2, temperature: 3});
  });

  it("returns 404 for a rating that belongs to a different fob", async () => {
    const owner = await createUser("owner", "owner@example.com");
    const fobA = await db.createFob(getFountain(owner.id));
    const fobB = await db.createFob(getFountain(owner.id, "other", false, getLocation(41, -87)));
    const rating = await db.createRating(getFountainRating(fobA.id, owner.id));

    const res = await request(app)
      .get(`/api/fobs/${fobB.id}/ratings/${rating.id}`)
      .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(owner));

    expect(res.status).to.equal(constants.HTTP_NOT_FOUND);
  });

  it("only lets the creator delete a fob", async () => {
    const owner = await createUser("owner", "owner@example.com");
    const other = await createUser("other", "other@example.com");
    const fob = await db.createFob(getFountain(owner.id));

    const forbidden = await request(app)
      .delete(`/api/fobs/${fob.id}`)
      .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(other));
    expect(forbidden.status).to.equal(constants.HTTP_FORBIDDEN);
    expect(await db.getFob(fob.id)).to.not.equal(undefined);

    const deleted = await request(app)
      .delete(`/api/fobs/${fob.id}`)
      .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(owner));
    expect(deleted.status).to.equal(constants.HTTP_OK);
    expect(await db.getFob(fob.id)).to.equal(undefined);
  });

  it("does not expose other users' email addresses in fob details", async () => {
    const owner = await createUser("owner", "owner@example.com");
    const rater = await createUser("rater", "rater@example.com");
    const viewer = await createUser("viewer", "viewer@example.com");
    const fob = await db.createFob(getFountain(owner.id));
    await db.createRating(getFountainRating(fob.id, rater.id));

    const res = await request(app)
      .get(`/api/fobs/${fob.id}/details`)
      .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(viewer));

    expect(res.status).to.equal(constants.HTTP_OK);
    expect(res.body.user.username).to.equal("owner");
    expect(res.text).to.not.include("@example.com");
  });

  it("refreshes tokens for an existing user", async () => {
    const user = await createUser("refresher", "refresh@example.com");

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({refresh_token: tokenFor(user, constants.JWT_REFRESH_EXPIRATION), expired_token: "expired"});

    expect(res.status).to.equal(constants.HTTP_OK);
    expect(res.body.username).to.equal("refresher");
  });

  it("refuses to refresh tokens for a deleted user", async () => {
    const user = await getUser("ghost", "ghost@example.com");

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({refresh_token: tokenFor(user, constants.JWT_REFRESH_EXPIRATION), expired_token: "expired"});

    expect(res.status).to.equal(constants.HTTP_UNAUTHORIZED);
  });

  it("returns a JSON 400 for requests that fail validation", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({refresh_token: "missing expired token"});

    expect(res.status).to.equal(constants.HTTP_BAD_REQUEST);
    expect(res.body.message).to.be.a("string");
  });
});
