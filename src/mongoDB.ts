import { Schema, model } from "mongoose";
import * as regexes from "./utils/regex";
import * as validators from "./utils/validation";
import * as bathroomTypes from "./bathrooms/types";
import * as fountainTypes from "./fountains/types";
import * as profileTypes from "./profiles/types";
import * as utilTypes from "./utils/types";

// Location
export type IDbLocation = {
  type: string;
  coordinates: [number, number];
};
const dbLocationSchema : Schema = new Schema<IDbLocation>({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

// BathroomInfo
export type IDbBathroomInfo = {
  name: string,
  gender: string,
  location: IDbLocation,
  baby_changer: boolean,
  sanitary_products: boolean
};
const bathroomInfoSchema : Schema = new Schema<IDbBathroomInfo>({
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
    type: dbLocationSchema,
    index: '2dsphere',
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
export type IDbBathroom = {
  id: string,
  info: IDbBathroomInfo
};
const bathroomSchema = new Schema<IDbBathroom>({
  id: {
    type: String,
    match: regexes.bathroomIdRegex,
    required: true,
    unique: true
  },
  info: {
    type: bathroomInfoSchema,
    required: true
  }
}, {
  timestamps: true
});
export const Bathroom = model<IDbBathroom>("Bathroom", bathroomSchema);

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
    required: true,
    unique: true
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
export type IDbFountainInfo = {
  name: string,
  bottle_filler: boolean,
  location: IDbLocation
}
const fountainInfoSchema : Schema = new Schema<IDbFountainInfo>({
  name: {
    type: String,
    required: false
  },
  location: {
    type: dbLocationSchema,
    index: '2dsphere',
    required: true
  },
  bottle_filler: {
    type: Boolean,
    required: true
  }
});

// Fountain
export type IDbFountain = {
  id: string,
  info: IDbFountainInfo
}
const fountainSchema : Schema = new Schema<IDbFountain>({
  id: {
    type: String,
    match: regexes.fountainIdRegex,
    required: true,
    unique: true
  },
  info: {
    type: fountainInfoSchema,
    required: true
  }
}, {
  timestamps: true
});
export const Fountain = model<IDbFountain>("Fountain", fountainSchema);

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
    required: true,
    unique: true
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
    required: false
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
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
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
    required: true,
    unique: true
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
