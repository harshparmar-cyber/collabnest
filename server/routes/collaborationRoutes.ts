import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  sendCollaborationRequest,
  getCollaborationRequests,
  acceptCollaborationRequest,
  rejectCollaborationRequest,
  getMyCollaborationGroups,
} from "../controllers/collaborationController.js";

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

router.get(
  "/groups",
  authMiddleware,
  getMyCollaborationGroups
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

export default router;