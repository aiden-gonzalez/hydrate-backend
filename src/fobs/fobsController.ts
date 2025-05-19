import {
  FobType,
  IFobCreationDetails,
  IFobInfo,
  IFobQueryParams,
  IFobWithDetails,
  IRating,
  IRatingDetails
} from "./types";
import * as db from "../db/queries";
import {
  HTTP_BAD_REQUEST,
  HTTP_CREATED,
  HTTP_FORBIDDEN,
  HTTP_FORBIDDEN_MESSAGE,
  HTTP_INTERNAL_ERROR,
  HTTP_OK,
  FOUNTAIN_ID_PREFIX,
  HTTP_NOT_FOUND,
  S3_UPLOAD_URL_EXPIRATION
} from "../utils/constants";
import {
  generateBathroomId,
  generateBathroomRatingId,
  generateFountainId,
  generateFountainRatingId,
  generatePictureId,
} from "../utils/generate";
import {generateCloudfrontSignedUrl, generateS3PictureKey, getS3Client} from "../utils/aws";
import {IFountainRatingDetails, IBathroomRatingDetails} from "./types";
import {NewFob} from "../db/types";
import {ratingDetailValueValidator} from "../utils/validation";
import {IPicture, IPictureSignedUrl} from "../pictures/types";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client once at the top level
const s3 = getS3Client();
const bucketName = process.env.AWS_S3_BUCKET_NAME;

export async function ratingPermissionCheck(req, res, next) {
  // Get path parameter
  const ratingId = req.params.ratingId;
  // Get authenticated user id
  const userId = req.user.id;

  // Get rating from the database
  const rating = await db.getRating(ratingId);

  // Check if user owns rating
  if (!rating.user_id == userId) {
    return res.status(HTTP_FORBIDDEN).send(HTTP_FORBIDDEN_MESSAGE);
  }

  // User owns the rating, carry on
  return next();
}

export async function attachFobToReq(req, res, next) {
  // Get path parameter
  const fobId = req.params.id;

  try {
    // Try to get fob from the database
    const fob = await db.getFob(fobId);

    // If fob doesn't exist, return 404
    if (fob === undefined || fob === null) {
      return res.sendStatus(HTTP_NOT_FOUND);
    }

    // Fob exists, attach to request and continue
    req.fob = fob;
    return next();
  } catch (error) {
    return res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function getFobs(req, res) {
  const queryParams = {
    type: req.query?.type,
    latitude: req.query?.latitude,
    longitude: req.query?.longitude,
    radius: req.query?.radius,
    user_id: req.query?.user_id,
    from_date: req.query?.from_date,
    to_date: req.query?.to_date
  } as IFobQueryParams;

  // Execute query
  try {
    const fobs = await db.findFobs(queryParams);
    res.status(HTTP_OK).json(fobs);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function createFob(req, res) {
  // Get fob info from request
  const fobCreationDetails : IFobCreationDetails = req.body;

  // Create fob
  const newFob = {
    id: fobCreationDetails.type == FobType.Fountain ? generateFountainId() : generateBathroomId(),
    user_id: req.user.id,
    name: fobCreationDetails.name,
    location: fobCreationDetails.location,
    info: fobCreationDetails.info
  } as NewFob;

  try {
    const createdFob = await db.createFob(newFob);
    res.status(HTTP_CREATED).json(createdFob);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function returnFob(req, res) {
  return res.status(HTTP_OK).json(req.fob);
}

export async function updateFob(req, res) {
  // Get fob info
  const fobUpdate : IFobInfo = req.body;

  // Update fob
  try {
    const fob = await db.updateFob(req.fob.id, fobUpdate);
    res.status(HTTP_OK).json(fob);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function getFobPicturesUrls(req, res) {
  try {
    const fobPictures = await db.getPicturesForFob(req.fob.id);

    // If there are no pictures, return with empty array
    if (fobPictures.length === 0) {
      return res.status(HTTP_OK).json([]);
    }

    // Generate signed URLs for each picture in the fobPictures array
    const signedUrls = fobPictures.map(generateCloudfrontSignedUrl);

    res.status(HTTP_OK).json(signedUrls);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function getFobPictureUploadUrl(req, res) {
  try {
    // Generate a new picture ID and S3 key
    const pictureId = generatePictureId();
    const s3Key = generateS3PictureKey(pictureId, req.fob.id);

    // For upload, use PutObjectCommand
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key
    });
    const expiration = new Date(Date.now() + (S3_UPLOAD_URL_EXPIRATION * 1000));
    const signedUploadUrl = await getSignedUrl(s3, putCommand, { expiresIn: S3_UPLOAD_URL_EXPIRATION });

    // Create a new picture entry in the DB with pending = true and the S3 key as url
    const newPicture: IPicture = {
      id: pictureId,
      user_id: req.user.id,
      fob_id: req.fob.id,
      pending: true,
      url: s3Key
    };

    await db.createPicture(newPicture);

    // Respond with the signed upload URL and expiry
    const newPictureSignedUrl: IPictureSignedUrl = {
      picture_id: pictureId,
      signed_url: signedUploadUrl,
      expires: expiration.getTime()
    };

    res.status(HTTP_OK).json(newPictureSignedUrl);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function getFobRatings(req, res) {
  // Get fountain ratings
  try {
    const fobRatings = await db.getRatingsForFob(req.fob.id);
    res.status(HTTP_OK).json(fobRatings);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function addFobRating(req, res) {
  // Get rating details from request
  const ratingDetails : IRatingDetails = req.body;

  // Validate details
  const isFountainRating = req.fob.id.startsWith(FOUNTAIN_ID_PREFIX);
  if (isFountainRating) {
    const fountainRatingDetails = (ratingDetails as IFountainRatingDetails);
    if (!ratingDetailValueValidator(fountainRatingDetails.taste)
      || !ratingDetailValueValidator(fountainRatingDetails.temperature)
      || !ratingDetailValueValidator(fountainRatingDetails.pressure)) {
      return res.status(HTTP_BAD_REQUEST).send("Invalid rating detail value(s)!");
    }
  } else {
    const bathroomRatingDetails = (ratingDetails as IBathroomRatingDetails);
    if (!ratingDetailValueValidator(bathroomRatingDetails.washing)
      || !ratingDetailValueValidator(bathroomRatingDetails.decor)
      || !ratingDetailValueValidator(bathroomRatingDetails.cleanliness)
      || !ratingDetailValueValidator(bathroomRatingDetails.drying)
      || !ratingDetailValueValidator(bathroomRatingDetails.privacy)) {
      return res.status(HTTP_BAD_REQUEST).send("Invalid rating detail value(s)!");
    }
  }

  // Check if user already rated this fountain
  const existingRating = await db.getRatingByFobAndUser(req.fob.id, req.user.id);
  if (existingRating) {
    return res.status(HTTP_BAD_REQUEST).send("You have already rated this fountain!");
  }

  // Create new fountain rating
  const newRating = {
    id: isFountainRating ? generateFountainRatingId() : generateBathroomRatingId(),
    fob_id: req.fob.id,
    user_id: req.user.id,
    details: ratingDetails
  } as IRating;

  try {
    const createdRating = await db.createRating(newRating);
    res.status(HTTP_CREATED).json(createdRating);
  } catch (error) {
    if (error.message && error.stack && error.stack.startsWith("ValidationError")) {
      res.status(HTTP_BAD_REQUEST).send(error.message);
    } else {
      res.status(HTTP_INTERNAL_ERROR).send(error);
    }
  }
}

export async function getFobRating(req, res) {
  // Get path parameters
  const ratingId = req.params.ratingId;

  // Get fountain rating
  try {
    const fobRating = await db.getRating(ratingId);
    res.status(HTTP_OK).json(fobRating);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function updateFobRating(req, res) {
  // Get path parameters
  const ratingId = req.params.ratingId;
  // Get new rating details from request
  const ratingUpdate : IRatingDetails = req.body;

  // Update fountain rating
  try {
    const fobRating = await db.updateRating(ratingId, ratingUpdate);
    res.status(HTTP_OK).json(fobRating);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function getFobWithDetails(req, res) {
  // Get path parameter
  const fobId = req.params.id;

  try {
    // Fetch fob details
    const fob = await db.getFob(fobId);

    // If fob not found
    if (fob === undefined || fob === null) {
      return res.sendStatus(HTTP_NOT_FOUND);
    }

    // Fetch associated pictures and ratings
    const [user, pictures, ratingsWithDetails] = await Promise.all([
      db.getUserById(fob.user_id),
      db.getPicturesForFob(fobId),
      db.getRatingsWithDetailsForFob(fobId)
    ]);

    // Combine details
    const fobWithDetails : IFobWithDetails = {
      fob,
      user,
      pictures,
      ratingsWithDetails
    };

    res.status(HTTP_OK).json(fobWithDetails);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}
