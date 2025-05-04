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
  HTTP_NOT_FOUND
} from "../utils/constants";
import {
  generateBathroomId,
  generateBathroomRatingId,
  generateFountainId,
  generateFountainRatingId,
  generatePictureId
} from "../utils/generate";
import {IFountainRatingDetails, IBathroomRatingDetails} from "./types";
import {NewFob} from "../db/types";
import {ratingDetailValueValidator, urlValidator} from "../utils/validation";
import {IPicture} from "../pictures/types";

// TODO think about how to set correct status depending on response from database
// If id is invalid, should be 404 not found?
// If request bad, should be 400?
// If not allowed to edit something, should be 403 or 401?
// If something goes wrong with the database, should be 500?

// Also consider refactoring to get rid of all the duplicated code once you figure that out

export async function ratingPermissionCheck(req, res, next) {
  // Get path parameter
  const ratingId = req.params.ratingId;
  // Get authenticated user id
  const userId = req.user.id;

  // Get rating from database
  const rating = await db.getRating(ratingId);

  // Check if user owns rating
  if (!rating.user_id == userId) {
    return res.status(HTTP_FORBIDDEN).send(HTTP_FORBIDDEN_MESSAGE);
  }

  // User owns the rating, carry on
  return next();
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

export async function getFobById(req, res) {
  // Get path parameter
  const fobId = req.params.id;

  // Get fountain
  try {
    const fob = await db.getFob(fobId);
    if (fob === undefined || fob === null) {
      return res.sendStatus(HTTP_NOT_FOUND);
    }
    res.status(HTTP_OK).json(fob);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function updateFob(req, res) {
  // Get path parameter
  const fobId = req.params.id;

  // Get fob info
  const fobUpdate : IFobInfo = req.body;

  // Update fob
  try {
    const fob = await db.updateFob(fobId, fobUpdate);
    res.status(HTTP_OK).json(fob);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function getFobPictures(req, res) {
  // Get path parameter
  const fobId = req.params.id;

  // Get fountain pictures
  try {
    const fobPictures = await db.getPicturesForFob(fobId);
    res.status(HTTP_OK).json(fobPictures);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function addFobPicture(req, res) {
  // Get path parameter
  const fobId = req.params.id;
  // Get picture url from request
  const pictureUrl = req.body.url;

  // Validate url
  if (!urlValidator(pictureUrl)) {
    return res.status(HTTP_BAD_REQUEST).send("Invalid picture URL!");
  }

  // Create picture
  const newPicture : IPicture = {
    id: generatePictureId(),
    user_id: req.user.id,
    fob_id: fobId,
    url: pictureUrl
  }

  try {
    const createdPicture = await db.createPicture(newPicture);
    res.status(HTTP_CREATED).json(createdPicture);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function getFobRatings(req, res) {
  // Get path parameter
  const fobId = req.params.id;

  // Get fountain ratings
  try {
    const fobRatings = await db.getRatingsForFob(fobId);
    res.status(HTTP_OK).json(fobRatings);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function addFobRating(req, res) {
  // TODO we can create a rating for fountains and users that don't exist, can't we?
  // this is probably not a good thing :(
  // TODO one user can add unlimited ratings for the same fountain. Also not good :(
  // Get path parameter
  const fobId = req.params.id;
  // Get rating details from request
  const ratingDetails : IRatingDetails = req.body;
  // Get authenticated user id
  const userId = req.user.id;

  // Validate details
  const isFountainRating = fobId.startsWith(FOUNTAIN_ID_PREFIX);
  if (isFountainRating) {
    const fountainRatingDetails = (ratingDetails as IFountainRatingDetails);
    if (!ratingDetailValueValidator(fountainRatingDetails.taste) || !ratingDetailValueValidator(fountainRatingDetails.temperature) || !ratingDetailValueValidator(fountainRatingDetails.pressure)) {
      return res.status(HTTP_BAD_REQUEST).send("Invalid rating detail value(s)!");
    }
  } else {
    const bathroomRatingDetails = (ratingDetails as IBathroomRatingDetails);
    if (!ratingDetailValueValidator(bathroomRatingDetails.washing) || !ratingDetailValueValidator(bathroomRatingDetails.decor) || !ratingDetailValueValidator(bathroomRatingDetails.cleanliness) || !ratingDetailValueValidator(bathroomRatingDetails.drying) || !ratingDetailValueValidator(bathroomRatingDetails.privacy)) {
      return res.status(HTTP_BAD_REQUEST).send("Invalid rating detail value(s)!");
    }
  }

  // Create new fountain rating
  const newRating = {
    id: isFountainRating ? generateFountainRatingId() : generateBathroomRatingId(),
    fob_id: fobId,
    user_id: userId,
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
  // TODO fountainId is not considered here, same potential issue as with pictures?
  // const fountainId = req.params.id;
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
  // TODO fountainId is not considered here, same potential issue as with pictures?
  // const fountainId = req.params.id;
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
