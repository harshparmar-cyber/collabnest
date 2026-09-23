import { Router } from "express";

import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Create a new project
router.post("/", authMiddleware, createProject);

// Get all projects
router.get("/", getProjects);

// Update a project
router.put("/:id", authMiddleware, updateProject);

// Delete a project
router.delete("/:id", authMiddleware, deleteProject);

export default router;