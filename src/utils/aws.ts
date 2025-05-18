import { IPicture, IPictureSignedUrl } from '../pictures/types';
import * as constants from './constants';
import { getSignedUrl as cfGetSignedUrl } from "@aws-sdk/cloudfront-signer";

export function generateS3PictureKey(picId : string, fobId: string) {
  return `${constants.S3_FOB_PICTURES_FOLDER}/${fobId}/${picId}`;
}

export function generateCloudfrontSignedUrl(picture: IPicture) : IPictureSignedUrl {
  const expiration = new Date(Date.now() + (constants.S3_DOWNLOAD_URL_EXPIRATION * 1000));
  return {
    signed_url: cfGetSignedUrl({
      url: `${process.env.AWS_CLOUDFRONT_URL}/${picture.url}`,
      privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY,
      keyPairId: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID,
      dateLessThan: expiration
    }),
    expires: expiration.getTime()
  } as IPictureSignedUrl;
}
