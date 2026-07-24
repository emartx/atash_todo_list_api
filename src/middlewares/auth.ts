import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../util/auth";
import { returnFailure } from "../util/util";

const publicEndpoints = new Set(["/login", "/register"]);

export const requireAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method === "POST" && publicEndpoints.has(req.path)) {
    return next();
  }

  const authorization = req.header("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return returnFailure(res, 401, "Access token is required");
  }

  const token = authorization.slice("Bearer ".length).trim();
  try {
    if (!token || !verifyAccessToken(token)) {
      return returnFailure(res, 401, "Invalid or expired access token");
    }
  } catch {
    return returnFailure(res, 500, "Authentication is not configured");
  }

  return next();
};
