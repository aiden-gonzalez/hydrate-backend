import {IFountain, IFountainInfo, IFountainQueryParams, IFountainRating, IFountainRatingDetails} from "./types";
import * as database from "../utils/database";
import {
  HTTP_BAD_REQUEST,
  HTTP_CREATED,
  HTTP_FORBIDDEN,
  HTTP_FORBIDDEN_MESSAGE,
  HTTP_INTERNAL_ERROR,
  HTTP_OK
} from "../utils/constants";
import { IPicture } from "../utils/types";
import { generateFountainId, generateFountainRatingId, generatePictureId } from "../utils/generate";

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
  const rating = await database.getFountainRating(ratingId);
  
  // Check if user owns rating
  if (!rating.user_id == userId) {
    return res.status(HTTP_FORBIDDEN).send(HTTP_FORBIDDEN_MESSAGE);
  }

  // User owns the rating, carry on
  return next();
}

export function getFountains(req, res) {
  // Get filter query params
  const queryParams = {
    bottle_filler: req.query?.bottle_filler,
    latitude: req.query?.latitude,
    longitude: req.query?.longitude,
    radius: req.query?.radius
  } as IFountainQueryParams;

  // Execute query
  return new Promise((resolve) => {
    database.queryFountains(queryParams).then((fountains) => {
      resolve(res.status(HTTP_OK).json(fountains))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    });
  });
}

export function createFountain(req, res) {
  // Get fountain info from request
  const fountainInfo : IFountainInfo = req.body;

  // Create fountain
  const newFountain : IFountain = {
    id: generateFountainId(),
    info: fountainInfo
  }
  return new Promise((resolve) => {
    database.createFountain(newFountain).then((createdFountain) => {
      resolve(res.status(HTTP_CREATED).json(createdFountain));
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    });
  });
}

export function getFountainById(req, res) {
  // Get path parameter
  const fountainId = req.params.id;

  // Get fountain
  return new Promise((resolve) => {
    database.getFountain(fountainId).then((fountain) => {
      resolve(res.status(HTTP_OK).json(fountain))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}

export function updateFountain(req, res) {
  // Get path parameter
  const fountainId = req.params.id;

  // Get fountain info
  const fountainInfo : IFountainInfo = req.body;

  // Update fountain
  return new Promise((resolve) => {
    database.updateFountainById(fountainId, fountainInfo).then((fountain) => {
      resolve(res.status(HTTP_OK).json(fountain))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}

export function getFountainPictures(req, res) {
  // Get path parameter
  const fountainId = req.params.id;

  // Get fountain pictures
  return new Promise((resolve) => {
    database.getPictures(fountainId).then((fountainPictures) => {
      resolve(res.status(HTTP_OK).json(fountainPictures))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}

export function addFountainPicture(req, res) {
  // Get path parameter
  const fountainId = req.params.id;
  // Get picture info from request
  const pictureLink : string = req.body;

  // Create picture
  const newPicture : IPicture = {
    id: generatePictureId(),
    entity_id: fountainId,
    picture_link: pictureLink
  }
  return new Promise((resolve) => {
    database.createPicture(newPicture).then((createdPicture) => {
      resolve(res.status(HTTP_OK).json(createdPicture))
    }).catch((error) => {
      if (error.message && error.stack && error.stack.startsWith("ValidationError")) {
        resolve(res.status(HTTP_BAD_REQUEST).send(error.message));
      } else {
        resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
      }
    })
  });
}

export function getFountainPicture(req, res) {
  // Get path parameters
  // TODO fountainID is not considered here. This means that any fountainId could be passed in
  // and the picture would still be fetched if it exists. Depending on how potential future
  // fountains permission logic is implemented, this could be a vulnerability.
  // const fountainId = req.params.id;
  const pictureId = req.params.pictureId;

  // Get fountain picture
  return new Promise((resolve) => {
    database.getPictureById(pictureId).then((fountainPicture) => {
      resolve(res.status(HTTP_OK).json(fountainPicture))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}

export function deleteFountainPicture(req, res) {
  // Get path parameters
  // TODO do we care if the picture doesn't actually belong to the fountain which is specified?
  // Currently we don't check that the picture belongs to the fountain before deleting it.
  // We don't check the fountainId at all.
  // TODO we also don't check who created the picture. There is no ownership here. Anyone can moderate anything.
  // const fountainId = req.params.id;
  const pictureId = req.params.pictureId;

  // Delete fountain picture
  return new Promise((resolve) => {
    database.deletePicture(pictureId).then(() => {
      resolve(res.status(HTTP_OK).send("Successfully removed picture"))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}

export function getFountainRatings(req, res) {
  // Get path parameter
  const fountainId = req.params.id;

  // Get fountain ratings
  return new Promise((resolve) => {
    database.getFountainRatings(fountainId).then((fountainRatings) => {
      resolve(res.status(HTTP_OK).json(fountainRatings));
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  })
}

export function addFountainRating(req, res) {
  // TODO we can create a rating for fountains and users that don't exist, can't we?
  // this is probably not a good thing :(
  // TODO one user can add unlimited ratings for the same fountain. Also not good :(
  // Get path parameter
  const fountainId = req.params.id;
  // Get rating details from request
  const ratingDetails : IFountainRatingDetails = req.body;
  // Get authenticated user id
  const userId = req.user.id;

  // Create new fountain rating
  const newRating : IFountainRating = {
    id: generateFountainRatingId(),
    fountain_id: fountainId,
    user_id: userId,
    details: ratingDetails
  };
  return new Promise((resolve) => {
    database.createFountainRating(newRating).then((createdRating) => {
      resolve(res.status(HTTP_OK).json(createdRating))
    }).catch((error) => {
      if (error.message && error.stack && error.stack.startsWith("ValidationError")) {
        resolve(res.status(HTTP_BAD_REQUEST).send(error.message));
      } else {
        resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
      }
    });
  });
}

export function getFountainRating(req, res) {
  // Get path parameters
  // TODO fountainId is not considered here, same potential issue as with pictures?
  // const fountainId = req.params.id;
  const ratingId = req.params.ratingId;

  // Get fountain rating
  return new Promise((resolve) => {
    database.getFountainRating(ratingId).then((fountainRating) => {
      resolve(res.status(HTTP_OK).json(fountainRating))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}

export function updateFountainRating(req, res) {
  // Get path parameters
  // TODO fountainId is not considered here, same potential issue as with pictures?
  // const fountainId = req.params.id;
  const ratingId = req.params.ratingId;
  // Get new rating details from request
  const ratingDetails : IFountainRatingDetails = req.body;

  // Update fountain rating
  return new Promise((resolve) => {
    database.updateFountainRatingById(ratingId, ratingDetails).then((fountainRating) => {
      resolve(res.status(HTTP_OK).json(fountainRating))
    }).catch((error) => {
      resolve(res.status(HTTP_INTERNAL_ERROR).send(error));
    })
  });
}
