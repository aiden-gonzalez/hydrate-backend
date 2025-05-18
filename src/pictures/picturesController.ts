import * as db from "../db/queries";
import {
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_ERROR,
  HTTP_NOT_FOUND,
  HTTP_OK
} from "../utils/constants";

export async function getPictureUrl(req, res) {
  // Get path parameter
  const id = req.params.id;

  // Get picture
  try {
    const picture = await db.getPictureById(id);
    if (picture === undefined || picture === null) {
      return res.sendStatus(HTTP_NOT_FOUND);
    }
    res.status(HTTP_OK).json(picture);
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function updatePictureStatus(req, res) {
  // Get path parameter
  const id = req.params.id;

  // Get status from request body


  // Update picture status
}

export async function deletePicture(req, res) {
  // Get path parameters
  // TODO we also don't check who created the picture. There is no ownership here. Anyone can moderate anything.
  const id = req.params.id;

  try {
    const picture = await db.getPictureById(id);
    // If picture doesn't exist, 404
    if (picture === undefined || picture === null) {
      return res.sendStatus(HTTP_NOT_FOUND);
    }
    // If user doesn't own this picture, forbidden
    if (picture.user_id != req.user.id) {
      return res.sendStatus(HTTP_FORBIDDEN);
    }
    // Delete picture
    await db.deletePicture(id);
    res.status(HTTP_OK).send("Successfully removed picture");
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}
