import { Request, Response } from "express";
import Project from "../models/Project.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const createProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required.",
      });
      return;
    }

    const {
      title,
      description,
      category,
      skills,
      teamSize,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !category ||
      !teamSize
    ) {
      res.status(400).json({
        message:
          "Title, description, category and team size are required.",
      });
      return;
    }

    // Make sure skills is an array
    const projectSkills = Array.isArray(skills)
      ? skills
      : [];

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      skills: projectSkills,
      teamSize: teamSize.trim(),
      createdBy: req.userId,
    });

    res.status(201).json({
      message: "Project posted successfully.",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      message: "Something went wrong while posting the project.",
    });
  }
};


export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await Project.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      message: "Something went wrong while fetching projects.",
    });
  }
};