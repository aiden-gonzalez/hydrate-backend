import {generateToken, isValidPass, validateToken} from "../utils/auth";
import {IPasswordResetRequest, IPasswordResetResetRequest, IAuthRefreshRequest, IAuthRequest, IAuthSuccessResponse} from "./types";
import {IHashedPassword, IUser} from "../utils/types";
import * as constants from "../utils/constants";
import * as db from "../db/queries";
import { generatePasswordResetToken } from "../utils/generate";
import { passwordValidator } from "../utils/validation";
import { sendPasswordResetEmail } from "../utils/email";

export async function findUserMiddleware (req, res, next) {
  // Get auth info
  const authRequest : IAuthRequest = req.body;

  // Find user in database
  const user = await db.getUserByEmail(authRequest.user_credentials.email);
  if (user === null || user === undefined) {
    return res.sendStatus(constants.HTTP_UNAUTHORIZED);
  }

  req.dbUser = user;
  return next();
}

export async function validatePassword (req, res) {
  // Get auth info and user from request
  const authRequest : IAuthRequest = req.body;
  const user : IUser = req.dbUser;

  // Check password
  const hashed_password = await db.getAuthForUser(user.id) as IHashedPassword;
  const passwordValid = await isValidPass(authRequest.user_credentials.password, hashed_password);
  if (!passwordValid) {
    return res.sendStatus(constants.HTTP_UNAUTHORIZED);
  }

  // Send tokens
  return res.status(constants.HTTP_OK).send(getAuthSuccessResponse(user));
}

export async function validateRefresh(req, res) {
  // Get refresh token from request
  const refreshRequest : IAuthRefreshRequest = req.body;

  // Validate token
  validateToken(refreshRequest.refresh_token).then((user: IUser) => {
    // Check that user still exists in db
    const dbUser = db.getUserById(user.id);

    // If user account is non-existent, then we consider the tokens invalid
    if (dbUser === undefined || dbUser === null) {
      return res.sendStatus(constants.HTTP_UNAUTHORIZED);
    }

    // Send new tokens
    return res.status(constants.HTTP_OK).send(getAuthSuccessResponse(user));
  }).catch((error) => {
    return res.sendStatus(constants.HTTP_UNAUTHORIZED);
  });
}

export function success(req, res) {
  res.sendStatus(constants.HTTP_OK);
}

function getAuthSuccessResponse(user : IUser) : IAuthSuccessResponse {
  return {
    access_token: generateToken(user, constants.JWT_ACCESS_EXPIRATION),
    refresh_token: generateToken(user, constants.JWT_REFRESH_EXPIRATION),
    token_type: constants.JWT_TYPE,
    expires: Math.round((new Date()).getTime() / 1000) + constants.JWT_ACCESS_EXPIRATION,
    username: user.username
  };
}

export async function requestPasswordReset(req, res) {
  const resetRequest: IPasswordResetRequest = req.body;

  // Check if user exists
  const user = await db.getUserByEmail(resetRequest.email);
  if (user) {
    // Generate token
    const token = generatePasswordResetToken();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    await db.createPasswordResetToken({
      user_id: user.id,
      token,
      expires_at: expiresAt
    });

    // Send email
    const resetLink = `https://yourapp.com/reset-password?token=${token}`;
    await sendPasswordResetEmail(resetRequest.email, resetLink);
  }

  // Always respond the same way
  res.status(constants.HTTP_OK).send({ message: "If an account exists with that email, a password reset email has been sent." });
}

export async function resetPassword(req, res) {
  const resetRequest: IPasswordResetResetRequest = req.body;

  // Validate passwords
  if (resetRequest.new_password !== resetRequest.confirm_password) {
    return res.status(constants.HTTP_BAD_REQUEST).send({ message: "Passwords do not match." });
  }
  if (!passwordValidator(resetRequest.new_password)) {
    return res.status(constants.HTTP_BAD_REQUEST).send({ message: "Password does not meet requirements." });
  }

  // Get token
  const tokenRecord = await db.getPasswordResetToken(resetRequest.token);
  if (!tokenRecord || tokenRecord.used || tokenRecord.expires_at < Date.now()) {
    return res.status(constants.HTTP_BAD_REQUEST).send({ message: "Invalid or expired password reset token." });
  }

  // Update password
  await db.updateAuthForUser(tokenRecord.user_id, resetRequest.new_password);

  // Invalidate token
  await db.invalidatePasswordResetToken(resetRequest.token);

  // Get user and return auth response
  const user = await db.getUserById(tokenRecord.user_id);
  return res.status(constants.HTTP_OK).send(getAuthSuccessResponse(user));
}
