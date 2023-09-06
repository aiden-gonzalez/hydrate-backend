import { Schema, model, connect } from "mongoose";
import { paths, components } from "../schema";
import validator from 'validator';
const mongoURL = process.env.MONGO_URL;

// THIS IS ALSO WHERE TYPES LIVE? MAYBE RENAME TO REFLECT THIS?
// TODO fix this with new import
//mongoose.set("strictQuery", false);

// Auth Types
type IAuthRefreshRequest = components["schemas"]["AuthRefreshRequest"];
type IAuthRequest = components["schemas"]["AuthRequest"];
type IAuthSuccessResponse = components["schemas"]["AuthSuccessResponse"];
type IClientCredentials = components["schemas"]["ClientCredentials"];
type ISignupRequest = components["schemas"]["SignupRequest"];

// UUID Regex
function getIdRegex(prefix : string) {
  return new RegExp(`^${prefix}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`);
}
const bathroomIdRegex = getIdRegex("bath");
const bathroomRatingIdRegex = getIdRegex("bath_rate");
const fountainIdRegex = getIdRegex("fount");
const fountainRatingIdRegex = getIdRegex("fount_rate");
const userIdRegex = getIdRegex("user");
const pictureIdRegex = getIdRegex("pic");

// URL Validator
function urlValidator(url: string) {
  return validator.isEmail(url);
}

// sha512Validator
function sha512Validator(hex: string) {
  return validator.isHash(hex, "sha512");
}

// Email Validator
function emailValidator(email: string) {
  return validator.isEmail(email);
}

// Entity ID Validator
function entityIdValidator(entityId: string) {
  return validator.matches(entityId, fountainIdRegex) || validator.matches(entityId, bathroomIdRegex);
}

// Location
type ILocation = components["schemas"]["Location"];
const locationSchema : Schema = new Schema<ILocation>({
  latitude: {
    type: Number,
    min: -90,
    max: 90,
    required: true
  },
  longitude: {
    type: Number,
    min: -90,
    max: 90,
    required: true
  }
});

// BathroomInfo
type IBathroomInfo = components["schemas"]["BathroomInfo"];
const bathroomInfoSchema : Schema = new Schema<IBathroomInfo>({
  name: {
    type: String,
    required: false
  },
  gender: {
    type: String,
    enum: ["male", "female", "all-gender"],
    required: true
  },
  location: {
    type: locationSchema,
    required: true
  },
  baby_changer: {
    type: Boolean,
    required: true
  },
  sanitary_products: {
    type: Boolean,
    required: true
  }
});

// Bathroom
type IBathroom = components["schemas"]["Bathroom"];
const bathroomSchema = new Schema<IBathroom>({
  id: {
    type: String,
    match: bathroomIdRegex,
    required: true
  },
  info: {
    type: bathroomInfoSchema,
    required: true
  }
}, {
  timestamps: true
});
const Bathroom = model<IBathroom>("Bathroom", bathroomSchema);

// BathroomRatingDetails
type IBathroomRatingDetails = components["schemas"]["BathroomRatingDetails"];
const bathroomRatingDetailsSchema : Schema = new Schema<IBathroomRatingDetails>({
  cleanliness: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  decor: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  drying: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  privacy: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  washing: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  }
});

// BathroomRating
type IBathroomRating = components["schemas"]["BathroomRating"];
const bathroomRatingSchema : Schema = new Schema<IBathroomRating>({
  id: {
    type: String,
    match: bathroomRatingIdRegex,
    required: true
  },
  bathroom_id: {
    type: String,
    match: bathroomIdRegex,
    required: true
  },
  user_id: {
    type: String,
    match: userIdRegex,
    required: true
  },
  details: {
    type: bathroomRatingDetailsSchema,
    required: true
  }
}, {
  timestamps: true
});
const BathroomRating = model<IBathroomRating>("BathroomRating", bathroomRatingSchema);

// FountainInfo
type IFountainInfo = components["schemas"]["FountainInfo"];
const fountainInfoSchema : Schema = new Schema<IFountainInfo>({
  name: {
    type: String,
    required: false
  },
  location: {
    type: locationSchema,
    required: true
  },
  bottle_filler: {
    type: Boolean,
    required: true
  }
});

// Fountain
type IFountain = components["schemas"]["Fountain"];
const fountainSchema : Schema = new Schema<IFountain>({
  id: {
    type: String,
    match: fountainIdRegex,
    required: true
  },
  info: {
    type: fountainInfoSchema,
    required: true
  }
}, {
  timestamps: true
});
const Fountain = model<IFountain>("Fountain", fountainSchema);

// FountainRatingDetails
type IFountainRatingDetails = components["schemas"]["FountainRatingDetails"];
const fountainRatingDetailsSchema : Schema = new Schema<IFountainRatingDetails>({
  pressure: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  taste: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  temperature: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  }
});

// FountainRating
type IFountainRating = components["schemas"]["FountainRating"];
const fountainRatingSchema : Schema = new Schema<IFountainRating>({
  id: {
    type: String,
    match: fountainRatingIdRegex,
    required: true
  },
  fountain_id: {
    type: String,
    match: fountainIdRegex,
    required: true
  },
  user_id: {
    type: String,
    match: userIdRegex,
    required: true
  },
  details: {
    type: fountainRatingDetailsSchema,
    required: true
  }
}, {
  timestamps: true
});
const FountainRating = model<IFountainRating>("FountainRating", fountainRatingSchema);

// HashedPassword
type IHashedPassword = components["schemas"]["HashedPassword"];
const hashedPasswordSchema : Schema = new Schema<IHashedPassword>({
  hash_pass: {
    type: String,
    validate: {
      validator: sha512Validator,
      message: "hash_pass should be SHA512 expressed as 128 character hexadecimal string."
    },
    required: true
  },
  hash_salt: {
    type: String,
    validate: {
      validator: sha512Validator,
      message: "hash_salt should be SHA512 expressed as 128 character hexadecimal string."
    },
    required: true
  }
});

// UserProfile
type IUserProfile = components["schemas"]["UserProfile"];
const userProfileSchema : Schema = new Schema<IUserProfile>({
  full_name: {
    type: String,
    required: true
  },
  picture_link: {
    type: String,
    validate: {
      validator: urlValidator,
      message: "picture_link should be valid URL."
    },
    required: false
  }
});

// User
type IUser = components["schemas"]["User"];
const userSchema : Schema = new Schema<IUser>({
  id: {
    type: String,
    match: userIdRegex,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    validate: {
      validator: emailValidator,
      message: "email must be valid email address."
    },
    required: true
  },
  hashed_password: {
    type: hashedPasswordSchema,
    required: true
  },
  profile: {
    type: userProfileSchema,
    required: true
  }
}, {
  timestamps: true
});
const User = model<IUser>("User", userSchema);

// Picture
type IPicture = components["schemas"]["Picture"];
const pictureSchema : Schema = new Schema<IPicture>({
  id: {
    type: String,
    match: pictureIdRegex,
    required: true
  },
  entity_id: {
    type: String,
    validate: {
      validator: entityIdValidator,
      message: "entity_id must be valid bathroom or fountain ID."
    },
    required: true
  },
  picture_link: {
    type: String,
    validate: {
      validator: urlValidator,
      message: "picture_link must be valid URL."
    },
    required: true
  }
});
const Picture = model<IPicture>("Picture", pictureSchema);

async function main() {
  await connect(mongoURL);
}

main().catch(err => console.log(err));
