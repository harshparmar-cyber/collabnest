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
      message:
        "Something went wrong while posting the project.",
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
      message:
        "Something went wrong while fetching projects.",
    });
  }
};


/* =========================================================
   UPDATE PROJECT
========================================================= */

export const updateProject = async (
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

    const { id } = req.params;

    const {
      title,
      description,
      category,
      skills,
      teamSize,
    } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({
        message: "Project not found.",
      });
      return;
    }

    // Make sure only the project owner can edit it
    if (project.createdBy.toString() !== req.userId) {
      res.status(403).json({
        message:
          "You are not allowed to edit this project.",
      });
      return;
    }

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

    project.title = title.trim();
    project.description = description.trim();
    project.category = category.trim();
    project.skills = Array.isArray(skills)
      ? skills
      : [];
    project.teamSize = teamSize.trim();

    await project.save();

    res.status(200).json({
      message: "Project updated successfully.",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    res.status(500).json({
      message:
        "Something went wrong while updating the project.",
    });
  }
};


/* =========================================================
   DELETE PROJECT
========================================================= */

export const deleteProject = async (
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

    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({
        message: "Project not found.",
      });
      return;
    }

    // Make sure only the project owner can delete it
    if (project.createdBy.toString() !== req.userId) {
      res.status(403).json({
        message:
          "You are not allowed to delete this project.",
      });
      return;
    }

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    res.status(500).json({
      message:
        "Something went wrong while deleting the project.",
    });
  }
};