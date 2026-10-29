import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "A valid bearer token is required.",
      },
    });
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "A bearer token is required.",
      },
    });
    return;
  }

  try {
    jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    next();
  } catch {
    res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "The token is invalid or expired.",
      },
    });
  }
}
