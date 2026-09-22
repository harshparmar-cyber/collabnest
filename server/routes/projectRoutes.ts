import { Router } from "express";
import {
  createProject,
  getProjects,
} from "../controllers/projectController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Create a new project
router.post("/", authMiddleware, createProject);

// Get all projects
router.get("/", getProjects);

export default router;