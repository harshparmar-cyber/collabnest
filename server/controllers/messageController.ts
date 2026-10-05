import { Response } from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import CollaborationGroup from "../models/CollaborationGroup.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const getGroupMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const groupId = req.params.groupId as string | undefined;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required.",
      });
      return;
    }

    if (!groupId) {
      res.status(400).json({
        message: "Collaboration group ID is required.",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).json({
        message: "Invalid collaboration group ID.",
      });
      return;
    }

    const group = await CollaborationGroup.findOne({
      _id: groupId,
      members: userId,
    });

    if (!group) {
      res.status(403).json({
        message:
          "You are not a member of this collaboration group.",
      });
      return;
    }

    const messages = await Message.find({
      group: groupId,
    })
      .populate("sender", "name email profilePhoto")
      .sort({ createdAt: 1 });

    res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("Get group messages error:", error);

    res.status(500).json({
      message: "Failed to fetch group messages.",
    });
  }
};