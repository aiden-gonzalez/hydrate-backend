import * as db from "../db/queries";
import {
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_ERROR,
  HTTP_NOT_FOUND,
  HTTP_OK,
  S3_DOWNLOAD_URL_EXPIRATION
} from "../utils/constants";
import {
  S3Client,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl as cfGetSignedUrl } from "@aws-sdk/cloudfront-signer";
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
    
    // Create signed Cloudfront URL for picture
    const expiration = new Date(Date.now() + (S3_DOWNLOAD_URL_EXPIRATION * 1000));
    const pictureSignedUrl : IPictureSignedUrl = {
      signed_url: cfGetSignedUrl({
        url: `${process.env.AWS_CLOUDFRONT_URL}/${picture.url}`,
        privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY,
        keyPairId: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID,
        dateLessThan: expiration
      }),
      expires: expiration.getTime()
    };

    res.status(HTTP_OK).json(pictureSignedUrl);
  } catch (error) {
    console.error("Error generating cloudfront signed URL:", error);
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
    const updatedPicture = await db.updatePictureStatus(picture.id, pending);
    if (updatedPicture !== undefined && updatedPicture !== null && updatedPicture.pending === pending) {
      return res.status(HTTP_OK);
    } else {
      throw new Error("Failed to update picture status");
    }
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
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: picture.url
    });
    await s3Client.send(deleteCommand);
  
    // Then delete picture from postgres db
    await db.deletePicture(picture.id);

    res.sendStatus(HTTP_OK);
  } catch (error) {
    console.error("Error deleting picture:", error);
    res.status(HTTP_INTERNAL_ERROR).send(error);
  }
}
