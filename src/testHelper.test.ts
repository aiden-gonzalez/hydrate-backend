import 'dotenv/config';
import mongoose from "mongoose";
import assert from "assert";

// Tell mongoose to use es6 Promise implementation
mongoose.Promise = global.Promise;

describe("Connect to database and run tests", function () {
  it("Should connect to database", async () => {
    await mongoose.connect("mongodb://root:password@127.0.0.1:27017/hydrate?authSource=admin");
    console.log("Connected to local MongoDB");
    mongoose.connection.on("error", (error) => {
      console.warn("Error: ", error);
    });
    assert(mongoose.connection.db);

    // Comment out to see the documents after testing
    beforeEach((done) => {
      dropAllCollections(mongoose.connection.db).then(() => {
        done();
      });
    });

    afterEach((done) => {
      dropAllCollections(mongoose.connection.db).then(() => {
        done();
      });
    });
  });
});

async function dropAllCollections(db) {
  try {
    const collections = await db.collections()
    for (let collection of collections) {
      await collection.drop();
    }
  } catch (error) {
    console.log(error);
  }
}