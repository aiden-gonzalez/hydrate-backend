import * as db from "../db/queries";
import {
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_ERROR,
  HTTP_NOT_FOUND,
  HTTP_OK,
  S3_DOWNLOAD_URL_EXPIRATION
} from "../utils/constants";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IPictureSignedUrl } from "./types";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION
});

export async function attachPictureToReq(req, res, next) {
  // Get path parameter
  const id = req.params.id;

  // Get picture
  try {
    const picture = await db.getPictureById(id);
    if (picture === undefined || picture === null) {
      return res.sendStatus(HTTP_NOT_FOUND);
    }
    req.picture = picture;
    next();
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function getPictureUrl(req, res) {
  try {
    // Get picture from request
    const picture = req.picture;
    
    // Create pre-signed URL for S3 object
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: picture.url // Assuming the url is the S3 key
    });
    
    // Generate pre-signed URL
    const pictureSignedUrl : IPictureSignedUrl = {
      signed_url: await getSignedUrl(s3Client, command, { expiresIn: S3_DOWNLOAD_URL_EXPIRATION }),
      expires: Date.now() + (S3_DOWNLOAD_URL_EXPIRATION * 1000) // Convert to milliseconds
    };

    res.status(HTTP_OK).json(pictureSignedUrl);
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function updatePictureStatus(req, res) {
  // Get pending status from request body
  const { pending } = req.body;

  // Update picture status
  try {
    const picture = req.picture;

    // If user doesn't own this picture, forbidden
    if (picture.user_id != req.user.id) {
      return res.sendStatus(HTTP_FORBIDDEN);
    }
    // Update status
    await db.updatePictureStatus(picture.id, pending);
    res.status(HTTP_OK).send("Successfully updated picture status");
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}

export async function deletePicture(req, res) {
  try {
    const picture = req.picture;

    // If user doesn't own this picture, forbidden
    if (picture.user_id != req.user.id) {
      return res.sendStatus(HTTP_FORBIDDEN);
    }

    // First delete picture from S3
    

    // Then delete picture from postgres db
    await db.deletePicture(picture.id);
    res.status(HTTP_OK).send("Successfully removed picture");
  } catch (error) {
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}
