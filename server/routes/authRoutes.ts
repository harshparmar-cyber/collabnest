import { Router } from "express";
import {
  signup,
  login,
  getCurrentUser,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", authMiddleware, getCurrentUser);

export default router;