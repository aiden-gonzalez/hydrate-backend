import { IPicture, IPictureSignedUrl } from '../pictures/types';
import * as constants from './constants';
import { S3Client } from "@aws-sdk/client-s3";
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
      privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY,
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
