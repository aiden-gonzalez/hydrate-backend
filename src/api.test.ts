import request from "supertest";
import {expect} from "chai";
import app from "./app";
import * as db from "./db/queries";
import * as constants from "./utils/constants";
import {generateToken, hashPass, hashPassWithSalt} from "./utils/auth";
import {getDb} from "./db/database";
import {getFountain, getFountainRating, getLocation, getPicture, getUser} from "./testHelper.test";
import {hashPasswordResetCode} from "./utils/generate";
import {IUser} from "./utils/types";

// These tests go through the full express app (routing, OpenAPI validation, error handling)
// rather than calling controller functions directly.
describe("API: end to end requests through the express app", () => {
  const testDb = getDb();

  async function createUser(username: string, email: string, password = "password123") : Promise<IUser> {
    const user = await db.createUser(await getUser(username, email));
    const hashed = await hashPass(password);
    await db.createAuth({user_id: user.id, ...hashed});
    return user;
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

  describe("account deletion", () => {
    it("requires the correct password", async () => {
      const user = await createUser("deleter", "deleter@example.com");

      const res = await request(app)
        .delete("/api/me")
        .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(user))
        .send({password: "wrong password"});

      expect(res.status).to.equal(constants.HTTP_UNAUTHORIZED);
      expect(await db.getUserById(user.id)).to.not.equal(undefined);
    });

    it("deletes the user, their ratings and pictures, but keeps fobs they created", async () => {
      const user = await createUser("deleter", "deleter@example.com");
      const other = await createUser("other", "other@example.com");
      const ownFob = await db.createFob(getFountain(user.id));
      const otherFob = await db.createFob(getFountain(other.id, "other", false, getLocation(41, -87)));
      await db.createRating(getFountainRating(otherFob.id, user.id));
      await db.createRating(getFountainRating(otherFob.id, other.id));
      await db.createPicture({...getPicture(otherFob.id, user.id), pending: false});

      const res = await request(app)
        .delete("/api/me")
        .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(user))
        .send({password: "password123"});

      expect(res.status).to.equal(constants.HTTP_OK);
      expect(await db.getUserById(user.id)).to.equal(undefined);
      expect(await db.getAuthForUser(user.id)).to.equal(undefined);
      expect(await db.getRatingsByUser(user.id)).to.have.length(0);
      expect(await db.getPicturesByUser(user.id)).to.have.length(0);
      expect(await db.getRatingsByUser(other.id)).to.have.length(1);
      expect(await db.getFob(ownFob.id)).to.not.equal(undefined);

      // Old tokens stop working
      const after = await request(app)
        .get("/api/auth/")
        .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(user));
      expect(after.status).to.equal(constants.HTTP_UNAUTHORIZED);

      // Fobs created by the deleted user still load, without a creator
      const details = await request(app)
        .get(`/api/fobs/${ownFob.id}/details`)
        .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(other));
      expect(details.status).to.equal(constants.HTTP_OK);
      expect(details.body.user).to.equal(undefined);
    });
  });

  describe("reporting content", () => {
    it("records a report for an existing fob, and ignores duplicates", async () => {
      const owner = await createUser("owner", "owner@example.com");
      const reporter = await createUser("reporter", "reporter@example.com");
      const fob = await db.createFob(getFountain(owner.id));

      for (let i = 0; i < 2; i++) {
        const res = await request(app)
          .post("/api/reports")
          .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(reporter))
          .send({content_type: "fob", content_id: fob.id, reason: "spam"});
        expect(res.status).to.equal(constants.HTTP_CREATED);
      }

      expect(await db.countReportersForContent("fob", fob.id)).to.equal(1);
    });

    it("resolves usernames when reporting users", async () => {
      const target = await createUser("target", "target@example.com");
      const reporter = await createUser("reporter", "reporter@example.com");

      const res = await request(app)
        .post("/api/reports")
        .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(reporter))
        .send({content_type: "user", content_id: "target", reason: "offensive", details: "bad name"});

      expect(res.status).to.equal(constants.HTTP_CREATED);
      expect(await db.countReportersForContent("user", target.id)).to.equal(1);
    });

    it("returns 404 when the reported content doesn't exist", async () => {
      const reporter = await createUser("reporter", "reporter@example.com");

      const res = await request(app)
        .post("/api/reports")
        .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(reporter))
        .send({content_type: "picture", content_id: "pic_missing", reason: "spam"});

      expect(res.status).to.equal(constants.HTTP_NOT_FOUND);
    });

    it("rejects unknown reasons", async () => {
      const reporter = await createUser("reporter", "reporter@example.com");

      const res = await request(app)
        .post("/api/reports")
        .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(reporter))
        .send({content_type: "user", content_id: "reporter", reason: "because"});

      expect(res.status).to.equal(constants.HTTP_BAD_REQUEST);
    });

    it("hides a picture from other users once enough users report it", async () => {
      const owner = await createUser("owner", "owner@example.com");
      const fob = await db.createFob(getFountain(owner.id));
      const picture = await db.createPicture({...getPicture(fob.id, owner.id), pending: false});

      for (let i = 0; i < constants.REPORT_HIDE_PICTURE_THRESHOLD; i++) {
        const reporter = await createUser(`reporter${i}`, `reporter${i}@example.com`);
        await request(app)
          .post("/api/reports")
          .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(reporter))
          .send({content_type: "picture", content_id: picture.id, reason: "inappropriate"})
          .expect(constants.HTTP_CREATED);
        expect((await db.getPictureById(picture.id)).hidden).to.equal(i === constants.REPORT_HIDE_PICTURE_THRESHOLD - 1);
      }

      const viewer = await createUser("viewer", "viewer@example.com");
      const res = await request(app)
        .get(`/api/pictures/${picture.id}`)
        .set(constants.HTTP_AUTHORIZATION_HEADER, tokenFor(viewer));
      expect(res.status).to.equal(constants.HTTP_NOT_FOUND);
    });
  });

  describe("passwords", () => {
    async function login(email: string, password: string) {
      return request(app).post("/api/auth/").send({user_credentials: {email, password}});
    }

    it("upgrades legacy password hashes on login", async () => {
      const user = await db.createUser(await getUser("legacy", "legacy@example.com"));
      const salt = "legacysalt";
      await db.createAuth({
        user_id: user.id,
        hash_salt: salt,
        hash_pass: await hashPassWithSalt("password123", salt, constants.HASH_ITERATIONS_LEGACY),
        hash_iterations: constants.HASH_ITERATIONS_LEGACY
      });

      expect((await login("legacy@example.com", "password123")).status).to.equal(constants.HTTP_OK);

      const upgraded = await db.getAuthForUser(user.id);
      expect(upgraded.hash_iterations).to.equal(constants.HASH_ITERATIONS);
      expect((await login("legacy@example.com", "password123")).status).to.equal(constants.HTTP_OK);
      expect((await login("legacy@example.com", "wrong password")).status).to.equal(constants.HTTP_UNAUTHORIZED);
    });

    it("resets a password with an emailed code, accepting lower case and dashes", async () => {
      const user = await createUser("forgetful", "forgetful@example.com");
      await db.createPasswordResetToken({
        user_id: user.id,
        token: hashPasswordResetCode("ABCD2345"),
        expires_at: Date.now() + constants.PASSWORD_RESET_EXPIRATION
      });

      const res = await request(app)
        .post("/api/auth/password-reset/reset")
        .send({token: "abcd-2345", new_password: "brandnewpass", confirm_password: "brandnewpass"});
      expect(res.status).to.equal(constants.HTTP_OK);
      expect(res.body.username).to.equal("forgetful");

      expect((await login("forgetful@example.com", "brandnewpass")).status).to.equal(constants.HTTP_OK);
      expect((await login("forgetful@example.com", "password123")).status).to.equal(constants.HTTP_UNAUTHORIZED);

      // Codes only work once
      const reused = await request(app)
        .post("/api/auth/password-reset/reset")
        .send({token: "ABCD2345", new_password: "anotherpass", confirm_password: "anotherpass"});
      expect(reused.status).to.equal(constants.HTTP_BAD_REQUEST);
    });

    it("invalidates older codes when a new one is requested", async () => {
      const user = await createUser("forgetful", "forgetful@example.com");
      await db.createPasswordResetToken({
        user_id: user.id,
        token: hashPasswordResetCode("OLDC0DE2"),
        expires_at: Date.now() + constants.PASSWORD_RESET_EXPIRATION
      });

      const requested = await request(app)
        .post("/api/auth/password-reset/request")
        .send({email: "forgetful@example.com"});
      expect(requested.status).to.equal(constants.HTTP_OK);
      expect(requested.body.message).to.equal(constants.PASSWORD_RESET_REQUEST_MESSAGE);

      const res = await request(app)
        .post("/api/auth/password-reset/reset")
        .send({token: "OLDC0DE2", new_password: "brandnewpass", confirm_password: "brandnewpass"});
      expect(res.status).to.equal(constants.HTTP_BAD_REQUEST);
    });

    it("rejects expired codes", async () => {
      const user = await createUser("forgetful", "forgetful@example.com");
      await db.createPasswordResetToken({
        user_id: user.id,
        token: hashPasswordResetCode("EXP1RED2"),
        expires_at: Date.now() - 1000
      });

      const res = await request(app)
        .post("/api/auth/password-reset/reset")
        .send({token: "EXP1RED2", new_password: "brandnewpass", confirm_password: "brandnewpass"});
      expect(res.status).to.equal(constants.HTTP_BAD_REQUEST);
    });
  });

  describe("rate limiting", () => {
    before(() => { process.env.RATE_LIMIT_DISABLED = "false"; });
    after(() => { process.env.RATE_LIMIT_DISABLED = "true"; });

    it("limits password reset requests per IP", async () => {
      const statuses = [];
      for (let i = 0; i <= constants.RATE_LIMIT_PASSWORD_RESET_REQUEST; i++) {
        const res = await request(app)
          .post("/api/auth/password-reset/request")
          .send({email: "nobody@example.com"});
        statuses.push(res.status);
      }
      expect(statuses.slice(0, -1).every((status) => status === constants.HTTP_OK)).to.equal(true);
      expect(statuses[statuses.length - 1]).to.equal(429);
    });
  });
});
