import jwt from "jsonwebtoken";
import env from "../config/env.js";
import type { TokenPayload } from "../types/types.js";

export const signToken = (payload: TokenPayload, secret: string, expiresIn: jwt.SignOptions["expiresIn"]) => {
	if (!expiresIn) {
		expiresIn = env.JWT_EXPIRES_IN;
	}

	if (!secret) {
		secret = env.JWT_SECRET;
	}

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

export const verifyToken = (token: string, secret: string) => {
	if (!secret) {
		secret = env.JWT_SECRET;
	}
	return jwt.verify(token, secret);
};
