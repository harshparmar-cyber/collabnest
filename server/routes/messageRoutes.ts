import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getGroupMessages } from "../controllers/messageController.js";

const router = Router();

router.get(
  "/groups/:groupId/messages",
  authMiddleware,
  getGroupMessages
);

export default router;