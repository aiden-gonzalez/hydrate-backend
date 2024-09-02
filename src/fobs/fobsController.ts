import {
  IFob,
  IFobInfo,
  IFobRating,
  IFobRatingDetails
} from "./types";
import * as db from "../db/queries";
import {
  HTTP_BAD_REQUEST,
  HTTP_CREATED,
  HTTP_FORBIDDEN,
  HTTP_FORBIDDEN_MESSAGE,
  HTTP_INTERNAL_ERROR,
  HTTP_OK
} from "../utils/constants";
import { IPicture } from "../utils/types";
import {
  generateBathroomId,
  generateBathroomRatingId,
  generateFountainId,
  generateFountainRatingId,
  generatePictureId
} from "../utils/generate";
import {IBathroomQueryParams, IBathroomRating} from "../bathrooms/types";
import {IFountainQueryParams, IFountainRating} from "../fountains/types";

// TODO think about how to set correct status depending on response from database
// If none are found, should be 404 not found?
// If id is invalid, should be 400?
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

export function getFobs(req, res) {
  let queryParams;
  if (req.isFountain) {
    queryParams = {
      bottle_filler: req.query?.bottle_filler,
      latitude: req.query?.latitude,
      longitude: req.query?.longitude,
      radius: req.query?.radius,
      user_id: req.query?.user_id,
      from_date: req.query?.from_date,
      to_date: req.query?.to_date
    } as IFountainQueryParams;
  } else {
    queryParams = {
      baby_changer: req.query?.baby_changer,
      sanitary_products: req.query?.sanitary_products,
      gender: req.query?.gender,
      latitude: req.query?.latitude,
      longitude: req.query?.longitude,
      radius: req.query?.radius,
      user_id: req.query?.user_id,
      from_date: req.query?.from_date,
      to_date: req.query?.to_date
    } as IBathroomQueryParams;
  }
  // Execute query
  return new Promise((resolve) => {
    db.findFobs(queryParams).then((fobs) => {
      resolve(res.status(HTTP_OK).json(fobs))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    });
  });
}

export function createFob(req, res) {
  // Get fob info from request
  const fobInfo : IFobInfo = req.body;

  // Create fob
  const newFob = {
    id: req.isFountain ? generateFountainId() : generateBathroomId(),
    user_id: req.user.id,
    info: fobInfo
  } as IFob;

  return new Promise((resolve) => {
    db.createFob(newFob).then((createdFob) => {
      resolve(res.status(HTTP_CREATED).json(createdFob));
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    });
  });
}

export function getFobById(req, res) {
  // Get path parameter
  const fobId = req.params.id;

  // Get fountain
  return new Promise((resolve) => {
    db.getFob(fobId).then((fob) => {
      resolve(res.status(HTTP_OK).json(fob))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}

export function updateFob(req, res) {
  // Get path parameter
  const fobId = req.params.id;

  // Get fountain info
  const fobUpdate : IFob = {
    info: req.body
  };

  // Update fountain
  return new Promise((resolve) => {
    db.updateFob(fobId, fobUpdate).then((fob) => {
      resolve(res.status(HTTP_OK).json(fob))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}

export function getFobPictures(req, res) {
  // Get path parameter
  const fobId = req.params.id;

  // Get fountain pictures
  return new Promise((resolve) => {
    db.getPicturesForEntity(fobId).then((fobPictures) => {
      resolve(res.status(HTTP_OK).json(fobPictures))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}

export function addFobPicture(req, res) {
  // Get path parameter
  const fobId = req.params.id;
  // Get picture url from request
  const pictureUrl = req.body;

  // Create picture
  const newPicture : IPicture = {
    id: generatePictureId(),
    user_id: req.user.id,
    entity_id: fobId,
    url: pictureUrl
  }
  return new Promise((resolve) => {
    db.createPicture(newPicture).then((createdPicture) => {
      resolve(res.status(HTTP_CREATED).json(createdPicture))
    }).catch((error) => {
      if (error.message && error.stack && error.stack.startsWith("ValidationError")) {
        resolve(res.status(HTTP_BAD_REQUEST).send(error.message));
      } else {
        resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
      }
    })
  });
}

export function getFobPicture(req, res) {
  // Get path parameters
  // TODO fountainID is not considered here. This means that any fountainId could be passed in
  // and the picture would still be fetched if it exists. Depending on how potential future
  // fountains permission logic is implemented, this could be a vulnerability.
  // const fountainId = req.params.id;
  const pictureId = req.params.pictureId;

  // Get fountain picture
  return new Promise((resolve) => {
    db.getPictureById(pictureId).then((fobPicture) => {
      resolve(res.status(HTTP_OK).json(fobPicture))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}

export function deleteFobPicture(req, res) {
  // Get path parameters
  // TODO do we care if the picture doesn't actually belong to the fountain which is specified?
  // Currently we don't check that the picture belongs to the fountain before deleting it.
  // We don't check the fountainId at all.
  // TODO we also don't check who created the picture. There is no ownership here. Anyone can moderate anything.
  // const fountainId = req.params.id;
  const pictureId = req.params.pictureId;

  // Delete fountain picture
  return new Promise((resolve) => {
    db.deletePicture(pictureId).then(() => {
      resolve(res.status(HTTP_OK).send("Successfully removed picture"))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}

export function getFobRatings(req, res) {
  // Get path parameter
  const fobId = req.params.id;

  // Get fountain ratings
  return new Promise((resolve) => {
    db.getRatingsForFob(fobId).then((fobRatings) => {
      resolve(res.status(HTTP_OK).json(fobRatings));
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  })
}

export function addFobRating(req, res) {
  // TODO we can create a rating for fountains and users that don't exist, can't we?
  // this is probably not a good thing :(
  // TODO one user can add unlimited ratings for the same fountain. Also not good :(
  // Get path parameter
  const fobId = req.params.id;
  // Get rating details from request
  const ratingDetails : IFobRatingDetails = req.body;
  // Get authenticated user id
  const userId = req.user.id;

  // Create new fountain rating
  const newRating = {
    id: req.isFountain ? generateFountainRatingId() : generateBathroomRatingId(),
    user_id: userId,
    details: ratingDetails
  } as IFobRating;

  // Add id
  if (req.isFountain) {
    (newRating as IFountainRating).fountain_id = fobId;
  } else {
    (newRating as IBathroomRating).bathroom_id = fobId;
  }

  return new Promise((resolve) => {
    db.createRating(newRating).then((createdRating) => {
      resolve(res.status(HTTP_CREATED).json(createdRating))
    }).catch((error) => {
      if (error.message && error.stack && error.stack.startsWith("ValidationError")) {
        resolve(res.status(HTTP_BAD_REQUEST).send(error.message));
      } else {
        resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
      }
    });
  });
}

export function getFobRating(req, res) {
  // Get path parameters
  // TODO fountainId is not considered here, same potential issue as with pictures?
  // const fountainId = req.params.id;
  const ratingId = req.params.ratingId;

  // Get fountain rating
  return new Promise((resolve) => {
    db.getRating(ratingId).then((fobRating) => {
      resolve(res.status(HTTP_OK).json(fobRating))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}

export function updateFobRating(req, res) {
  // Get path parameters
  // TODO fountainId is not considered here, same potential issue as with pictures?
  // const fountainId = req.params.id;
  const ratingId = req.params.ratingId;
  // Get new rating details from request
  const ratingUpdate : IFobRating = {
    details: req.body
  };

  // Update fountain rating
  return new Promise((resolve) => {
    db.updateRating(ratingId, ratingUpdate).then((fobRating) => {
      resolve(res.status(HTTP_OK).json(fobRating))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}
