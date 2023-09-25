import { Schema, model } from "mongoose";
import * as regexes from "./utils/regex";
import * as validators from "./utils/validation";
import * as bathroomTypes from "./bathrooms/types";
import * as fountainTypes from "./fountains/types";
import * as profileTypes from "./profiles/types";
import * as utilTypes from "./utils/types";

// Location
const locationSchema : Schema = new Schema<utilTypes.ILocation>({
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
const bathroomInfoSchema : Schema = new Schema<bathroomTypes.IBathroomInfo>({
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
const bathroomSchema = new Schema<bathroomTypes.IBathroom>({
  id: {
    type: String,
    match: regexes.bathroomIdRegex,
    required: true
  },
  info: {
    type: bathroomInfoSchema,
    required: true
  }
}, {
  timestamps: true
});
export const Bathroom = model<bathroomTypes.IBathroom>("Bathroom", bathroomSchema);

// BathroomRatingDetails
const bathroomRatingDetailsSchema : Schema = new Schema<bathroomTypes.IBathroomRatingDetails>({
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
const bathroomRatingSchema : Schema = new Schema<bathroomTypes.IBathroomRating>({
  id: {
    type: String,
    match: regexes.bathroomRatingIdRegex,
    required: true
  },
  bathroom_id: {
    type: String,
    match: regexes.bathroomIdRegex,
    required: true
  },
  user_id: {
    type: String,
    match: regexes.userIdRegex,
    required: true
  },
  details: {
    type: bathroomRatingDetailsSchema,
    required: true
  }
}, {
  timestamps: true
});
export const BathroomRating = model<bathroomTypes.IBathroomRating>("BathroomRating", bathroomRatingSchema);

// FountainInfo
const fountainInfoSchema : Schema = new Schema<fountainTypes.IFountainInfo>({
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
const fountainSchema : Schema = new Schema<fountainTypes.IFountain>({
  id: {
    type: String,
    match: regexes.fountainIdRegex,
    required: true
  },
  info: {
    type: fountainInfoSchema,
    required: true
  }
}, {
  timestamps: true
});
export const Fountain = model<fountainTypes.IFountain>("Fountain", fountainSchema);

// FountainRatingDetails
const fountainRatingDetailsSchema : Schema = new Schema<fountainTypes.IFountainRatingDetails>({
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
const fountainRatingSchema : Schema = new Schema<fountainTypes.IFountainRating>({
  id: {
    type: String,
    match: regexes.fountainRatingIdRegex,
    required: true
  },
  fountain_id: {
    type: String,
    match: regexes.fountainIdRegex,
    required: true
  },
  user_id: {
    type: String,
    match: regexes.userIdRegex,
    required: true
  },
  details: {
    type: fountainRatingDetailsSchema,
    required: true
  }
}, {
  timestamps: true
});
export const FountainRating = model<fountainTypes.IFountainRating>("FountainRating", fountainRatingSchema);

// HashedPassword
const hashedPasswordSchema : Schema = new Schema<utilTypes.IHashedPassword>({
  hash_pass: {
    type: String,
    validate: {
      validator: validators.sha512Validator,
      message: "hash_pass should be SHA512 expressed as 128 character hexadecimal string."
    },
    required: true
  },
  hash_salt: {
    type: String,
    validate: {
      validator: validators.sha512Validator,
      message: "hash_salt should be SHA512 expressed as 128 character hexadecimal string."
    },
    required: true
  }
});

// UserProfile
const userProfileSchema : Schema = new Schema<profileTypes.IUserProfile>({
  full_name: {
    type: String,
    required: true
  },
  picture_link: {
    type: String,
    validate: {
      validator: validators.urlValidator,
      message: "picture_link should be valid URL."
    },
    required: false
  }
});

// User
const userSchema : Schema = new Schema<utilTypes.IUser>({
  id: {
    type: String,
    match: regexes.userIdRegex,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    validate: {
      validator: validators.emailValidator,
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
export const User = model<utilTypes.IUser>("User", userSchema);

// Picture
const pictureSchema : Schema = new Schema<utilTypes.IPicture>({
  id: {
    type: String,
    match: regexes.pictureIdRegex,
    required: true
  },
  entity_id: {
    type: String,
    validate: {
      validator: validators.entityIdValidator,
      message: "entity_id must be valid bathroom or fountain ID."
    },
    required: true
  },
  picture_link: {
    type: String,
    validate: {
      validator: validators.urlValidator,
      message: "picture_link must be valid URL."
    },
    required: true
  }
});
export const Picture = model<utilTypes.IPicture>("Picture", pictureSchema);
