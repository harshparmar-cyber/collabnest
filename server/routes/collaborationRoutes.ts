import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  sendCollaborationRequest,
  getCollaborationRequests,
  acceptCollaborationRequest,
  rejectCollaborationRequest,
  getMyCollaborationGroups,
} from "../controllers/collaborationController.js";

import {
  getGroupMessages,
} from "../controllers/messageController.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Send collaboration request
|--------------------------------------------------------------------------
| POST /api/collaborations/projects/:projectId/request
*/
router.post(
  "/projects/:projectId/request",
  authMiddleware,
  sendCollaborationRequest
);

/*
|--------------------------------------------------------------------------
| Get pending collaboration requests
|--------------------------------------------------------------------------
| GET /api/collaborations/requests
*/
router.get(
  "/requests",
  authMiddleware,
  getCollaborationRequests
);

/*
|--------------------------------------------------------------------------
| Accept collaboration request
|--------------------------------------------------------------------------
| PUT /api/collaborations/requests/:requestId/accept
*/
router.put(
  "/requests/:requestId/accept",
  authMiddleware,
  acceptCollaborationRequest
);

/*
|--------------------------------------------------------------------------
| Reject collaboration request
|--------------------------------------------------------------------------
| PUT /api/collaborations/requests/:requestId/reject
*/
router.put(
  "/requests/:requestId/reject",
  authMiddleware,
  rejectCollaborationRequest
);

/*
|--------------------------------------------------------------------------
| Get my collaboration groups
|--------------------------------------------------------------------------
| GET /api/collaborations/groups
*/
router.get(
  "/groups",
  authMiddleware,
  getMyCollaborationGroups
);

/*
|--------------------------------------------------------------------------
| Get previous messages of a collaboration group
|--------------------------------------------------------------------------
| GET /api/collaborations/groups/:groupId/messages
*/
router.get(
  "/groups/:groupId/messages",
  authMiddleware,
  getGroupMessages
);

export default router;