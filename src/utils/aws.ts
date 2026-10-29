import { IPicture, IPictureSignedUrl } from '../pictures/types';
import * as constants from './constants';
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { CloudFrontClient } from "@aws-sdk/client-cloudfront";
import { fromSSO } from "@aws-sdk/credential-provider-sso";
import { getSignedUrl as cfGetSignedUrl } from "@aws-sdk/cloudfront-signer";

export function generateS3PictureKey(picId : string, fobId: string) {
  return `${constants.S3_FOB_PICTURES_FOLDER}/${fobId}/${picId}`;
}

export function generateCloudfrontSignedUrl(picture: IPicture) : IPictureSignedUrl {
  const expiration = new Date(Date.now() + (constants.S3_DOWNLOAD_URL_EXPIRATION * 1000));
  return {
    picture_id: picture.id,
    signed_url: cfGetSignedUrl({
      url: `${process.env.AWS_CLOUDFRONT_URL}/${picture.url}`,
      // Docker env files don't expand "\n", so allow the key to be given on one line
      privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      keyPairId: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID,
      dateLessThan: expiration
    }),
    expires: expiration.getTime()
  } as IPictureSignedUrl;
}

export function getS3Client() {
  return new S3Client({
    region: process.env.AWS_REGION,
    ...(process.env.NODE_ENV === 'local' && process.env.AWS_SSO_PROFILE
      ? { credentials: fromSSO({ profile: process.env.AWS_SSO_PROFILE }) }
      : {}) // Empty object for production - uses default provider chain
  });
}

export function getCloudfrontClient() {
  return new CloudFrontClient({
    region: process.env.AWS_REGION,
    ...(process.env.NODE_ENV === 'local' && process.env.AWS_SSO_PROFILE
      ? { credentials: fromSSO({ profile: process.env.AWS_SSO_PROFILE }) }
      : {}) // Empty object for production - uses default provider chain
  });
}

let sharedS3Client: S3Client;

// Best-effort removal of picture files from S3 (used when the owning fob / user is deleted).
// Failures are logged rather than thrown so the database cleanup still happens.
export async function deletePictureObjects(pictures: IPicture[]) : Promise<void> {
  // There is no S3 in the test environment
  if (process.env.NODE_ENV === "test" || pictures.length === 0) {
    return;
  }
  sharedS3Client = sharedS3Client ?? getS3Client();
  await Promise.all(pictures.map((picture) => sharedS3Client.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: picture.url
  })).catch((error) => console.error("Error deleting picture from S3:", error))));
}
