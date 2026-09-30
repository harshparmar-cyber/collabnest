import { Response } from "express";
import mongoose from "mongoose";

import CollaborationRequest from "../models/CollaborationRequest.js";
import CollaborationGroup from "../models/CollaborationGroup.js";
import Project from "../models/Project.js";

import { AuthRequest } from "../middleware/authMiddleware.js";

/*
|--------------------------------------------------------------------------
| Send collaboration request
|--------------------------------------------------------------------------
| POST /api/collaborations/projects/:projectId/request
*/
export const sendCollaborationRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const projectId = req.params.projectId as string;

    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (
      !projectId ||
      !mongoose.Types.ObjectId.isValid(projectId)
    ) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const requesterId = req.userId;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const ownerId = project.createdBy.toString();

    // User cannot request collaboration on their own project
    if (ownerId === requesterId) {
      return res.status(400).json({
        message: "You cannot collaborate on your own project",
      });
    }

    // Check whether the user is already a member of the group
    const existingGroup = await CollaborationGroup.findOne({
      project: projectId,
      members: requesterId,
    });

    if (existingGroup) {
      return res.status(400).json({
        message: "You are already a member of this group",
      });
    }

    // Check for an existing pending request
    const existingRequest =
      await CollaborationRequest.findOne({
        project: projectId,
        requester: requesterId,
        status: "pending",
      });

    if (existingRequest) {
      return res.status(400).json({
        message: "Collaboration request already sent",
      });
    }

    const request = await CollaborationRequest.create({
      project: projectId,
      requester: requesterId,
      owner: project.createdBy,
      status: "pending",
    });

    const populatedRequest =
      await CollaborationRequest.findById(request._id)
        .populate(
          "requester",
          "name email profilePhoto"
        )
        .populate(
          "owner",
          "name email profilePhoto"
        )
        .populate("project", "title");

    return res.status(201).json({
      message: "Collaboration request sent successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Send collaboration request error:",
      error
    );

    return res.status(500).json({
      message: "Failed to send collaboration request",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get collaboration requests
|--------------------------------------------------------------------------
| GET /api/collaborations/requests
*/
export const getCollaborationRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const requests = await CollaborationRequest.find({
      owner: req.userId,
      status: "pending",
    })
      .populate(
        "requester",
        "name email profilePhoto"
      )
      .populate(
        "project",
        "title description category"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error(
      "Get collaboration requests error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch collaboration requests",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Accept collaboration request
|--------------------------------------------------------------------------
| PUT /api/collaborations/requests/:requestId/accept
*/
export const acceptCollaborationRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const requestId = req.params.requestId as string;

    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (
      !requestId ||
      !mongoose.Types.ObjectId.isValid(requestId)
    ) {
      return res.status(400).json({
        message: "Invalid request ID",
      });
    }

    const request =
      await CollaborationRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Collaboration request not found",
      });
    }

    // Only the project owner can accept the request
    if (request.owner.toString() !== req.userId) {
      return res.status(403).json({
        message:
          "You are not allowed to accept this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message:
          "This request has already been processed",
      });
    }

    const project = await Project.findById(
      request.project
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find or create collaboration group
    |--------------------------------------------------------------------------
    */

    let group = await CollaborationGroup.findOne({
      project: request.project,
    });

    if (!group) {
      group = await CollaborationGroup.create({
        project: request.project,
        owner: request.owner,
        members: [
          request.owner,
          request.requester,
        ],
        name: `${project.title} Group`,
      });
    } else {
      const alreadyMember = group.members.some(
        (member) =>
          member.toString() ===
          request.requester.toString()
      );

      if (!alreadyMember) {
        group.members.push(request.requester);
        await group.save();
      }
    }

    // Mark request as accepted
    request.status = "accepted";

    await request.save();

    const populatedGroup =
      await CollaborationGroup.findById(group._id)
        .populate(
          "owner",
          "name email profilePhoto"
        )
        .populate(
          "members",
          "name email profilePhoto"
        )
        .populate(
          "project",
          "title description category"
        );

    return res.status(200).json({
      message:
        "Collaboration request accepted",
      group: populatedGroup,
    });
  } catch (error) {
    console.error(
      "Accept collaboration request error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to accept collaboration request",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Reject collaboration request
|--------------------------------------------------------------------------
| PUT /api/collaborations/requests/:requestId/reject
*/
export const rejectCollaborationRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const requestId = req.params.requestId as string;

    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (
      !requestId ||
      !mongoose.Types.ObjectId.isValid(requestId)
    ) {
      return res.status(400).json({
        message: "Invalid request ID",
      });
    }

    const request =
      await CollaborationRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message:
          "Collaboration request not found",
      });
    }

    // Only the project owner can reject the request
    if (request.owner.toString() !== req.userId) {
      return res.status(403).json({
        message:
          "You are not allowed to reject this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message:
          "This request has already been processed",
      });
    }

    request.status = "rejected";

    await request.save();

    return res.status(200).json({
      message:
        "Collaboration request rejected",
    });
  } catch (error) {
    console.error(
      "Reject collaboration request error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to reject collaboration request",
    });
  }
};

export const getMyCollaborationGroups = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required.",
      });
      return;
    }

    const groups = await CollaborationGroup.find({
      members: userId,
    })
      .populate("project", "title")
      .populate("members", "name email profilePhoto")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      groups,
    });
  } catch (error) {
    console.error("Get collaboration groups error:", error);

    res.status(500).json({
      message: "Failed to fetch collaboration groups.",
    });
  }
};