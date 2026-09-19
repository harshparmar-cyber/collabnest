import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({
        message: "Authentication required.",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        message: "JWT secret is not configured.",
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as {
      userId: string;
    };

    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired session.",
    });
  }
};

export default authMiddleware;