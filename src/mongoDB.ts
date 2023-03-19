const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URL;

let client;
let db;
let bathRate;
let bath;
let fountRate;
let fount;
let pic;
let user;

// TODO incorporate Mongoose?

function connect () {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    client.connect(err => {
        if (err) {
            console.log(err);
        }
        db = client.db("hydRate");
        bathRate = db.collection("Bathroom Ratings");
        bath = db.collection("Bathrooms");
        fountRate = db.collection("Fountain Ratings");
        fount = db.collection("Fountains");
        pic = db.collection("Pictures");
        user = db.collection("Users");
    });
}

function get() {
    return db;
}

function bathroomRatings() {
    return bathRate;
}

function bathrooms() {
    return bath;
}

function fountainRatings() {
    return fountRate;
}

function fountains() {
    return fount;
}

function pictures() {
    return pic;
}

function users() {
    return user;
}

function close() {
    client.close();
}
