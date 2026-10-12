import { Router, Request, Response } from "express";
import mongoose from "mongoose";

import {
  signup,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  getUserProfile,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateProfile);

/*
 * Return safe public profile fields for registered users.
 * The dashboard filters out the currently logged-in user and displays up to 4.
 * Never return password or email from this endpoint.
 */
router.get(
  "/users",
  authMiddleware,
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const requestedLimit = Number(_req.query.limit) || 50;
      const limit = Math.min(Math.max(requestedLimit, 1), 100);

      const users = await User.find({})
        .select("name bio skills profilePhoto createdAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      res.status(200).json({
        success: true,
        users: users.map((user) => ({
          id: String(user._id),
          name: user.name,
          bio: user.bio || "",
          skills: Array.isArray(user.skills) ? user.skills : [],
          profilePhoto: user.profilePhoto || "",
          createdAt: user.createdAt,
        })),
      });
    } catch (error) {
      console.error("Fetch registered users error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch registered users.",
      });
    }
  }
);

// Keep this route after /users so the literal route is not treated as an ID.
router.get("/users/:id", getUserProfile);

export default router;
