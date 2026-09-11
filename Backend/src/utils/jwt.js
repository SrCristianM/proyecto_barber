import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(payload, options = {}) {
  return jwt.sign(payload, env.JWT.SECRET, {
    expiresIn: options.expiresIn || env.JWT.EXPIRES_IN
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT.SECRET);
  } catch (err) {
    return null;
  }
}
