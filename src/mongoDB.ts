const mongoose = require("mongoose");
const mongoURL = process.env.MONGO_URL;

mongoose.set("strictQuery", false);

const bath = mongoose.model("Bath", new mongoose.Schema({
    id: String,
    name: String,
    gender: String,
    sanitary_products: Boolean,
    baby_changer: Boolean,
    longitude: Number,
    latitude: Number
}));

const bathRate = mongoose.model("BathRate", new mongoose.Schema({
    id: String,
    bathroom_id: String,
    cleanliness: Number,
    privacy: Number,
    washing: Number,
    drying: Number,
    decor: Number
}));

const fount = mongoose.model("Fount", new mongoose.Schema({
    id: String,
    name: String,
    bottle_filler: Boolean,
    longitude: Number,
    latitude: Number
}));

const fountRate = mongoose.model("FountRate", new mongoose.Schema({
    id: String,
    fountain_id: String,
    taste: Number,
    temperature: Number,
    pressure: Number
}));

const user = mongoose.model("User", new mongoose.Schema({
    id: String,
    username: String,
    pass_hash: String,
    profile: {
        full_name: String,
        email: String,
        picture_link: String
    },
    created: Date
}));

const pic = mongoose.model("Pic", new mongoose.Schema({
    id: String,
    f_or_b_id: String,
    picture_link: String
}))

function connect () {
    mongoose.connect(mongoURL).then(() => {

    }).catch((err) => console.log(err));
    // client.connect(err => {
    //     db = client.db("hydRate");
    //     bathRate = db.collection("Bathroom Ratings");
    //     bath = db.collection("Bathrooms");
    //     fountRate = db.collection("Fountain Ratings");
    //     fount = db.collection("Fountains");
    //     pic = db.collection("Pictures");
    //     user = db.collection("Users");
    // });
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
