import { Router } from "express";

import {
  signup,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  getUserProfile,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/signup",
  signup
);

router.post(
  "/login",
  login
);

router.post(
  "/logout",
  logout
);

router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

router.get(
  "/users/:id",
  getUserProfile
);

export default router;