import { Schema, model, connect } from "mongoose";
import { paths, components } from "../schema";
const mongoURL = process.env.MONGO_URL;

// TODO fix this with new import
//mongoose.set("strictQuery", false);

// BathroomInfo
type IBathroomInfo = components["schemas"]["BathroomInfo"];

// Bathroom
type IBathroom = components["schemas"]["Bathroom"];
const bathroomSchema = new Schema<IBathroom>({
    id: String,
    info:
    name: String,
    gender: {
        type: String,
        enum: ["male", "female", "unisex"]
    },
    sanitary_products: Boolean,
    baby_changer: Boolean,
    longitude: Number,
    latitude: Number
})
const bath = mongoose.model("Bath", new mongoose.Schema({

}));


const bathRate = mongoose.model("BathRate", new mongoose.Schema({
    id: String,
    bathroom_id: String,
    cleanliness: {
        type: Number,
        min: 0,
        max: 5
    },
    privacy: {
        type: Number,
        min: 0,
        max: 5
    },
    washing: {
        type: Number,
        min: 0,
        max: 5
    },
    drying: {
        type: Number,
        min: 0,
        max: 5
    },
    decor: {
        type: Number,
        min: 0,
        max: 5
    }
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
    taste: {
        type: Number,
        min: 0,
        max: 5
    },
    temperature: {
        type: Number,
        min: 0,
        max: 5
    },
    pressure: {
        type: Number,
        min: 0,
        max: 5
    }
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

async function main() {
    await mongoose.connect(mongoURL);
}

main().catch((err) => console.log(err));

function get() {
    //return db;
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

function closeClient() {
    //client.close();
}
