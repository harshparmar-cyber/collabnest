import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const createToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in .env");
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: "7d",
  });
};

export const signup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        message: "Name, email and password are required.",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409).json({
        message: "An account with this email already exists.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = createToken(user._id.toString());

   res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Something went wrong while creating the account.",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required.",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      res.status(401).json({
        message: "Invalid email or password.",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      res.status(401).json({
        message: "Invalid email or password.",
      });
      return;
    }

    const token = createToken(user._id.toString());

    res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Something went wrong while logging in.",
    });
  }
};

export const getCurrentUser = async (
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

    const user = await User.findById(
      req.userId
    ).select("-password");

    if (!user) {
      res.status(404).json({
        message: "User not found.",
      });

      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        profilePhoto: user.profilePhoto,
        portfolio: user.portfolio,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

export const updateProfile = async (
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
      name,
      bio,
      skills,
      profilePhoto,
      portfolio,
    } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({
        message: "Name is required.",
      });

      return;
    }

    if (name.trim().length > 60) {
      res.status(400).json({
        message: "Name cannot be longer than 60 characters.",
      });

      return;
    }

    if (
      typeof bio === "string" &&
      bio.length > 500
    ) {
      res.status(400).json({
        message: "Bio cannot be longer than 500 characters.",
      });

      return;
    }

    /*
     * Profile photo validation
     *
     * The frontend sends the selected image as a Base64
     * data URL, for example:
     *
     * data:image/jpeg;base64,/9j/4AAQSk...
     */

    if (typeof profilePhoto === "string" && profilePhoto) {
      const validImagePattern =
        /^data:image\/(jpeg|jpg|png|webp);base64,/i;

      if (!validImagePattern.test(profilePhoto)) {
        res.status(400).json({
          message:
            "Profile photo must be a JPG, PNG, or WebP image.",
        });

        return;
      }

      // Approximate 3 MB maximum Base64 payload.
      if (profilePhoto.length > 4_000_000) {
        res.status(400).json({
          message:
            "Profile photo is too large. Please choose an image under 3 MB.",
        });

        return;
      }
    }

    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({
        message: "User not found.",
      });

      return;
    }

    user.name = name.trim();

    user.bio =
      typeof bio === "string"
        ? bio.trim()
        : "";

    user.skills = Array.isArray(skills)
      ? skills
          .filter(
            (skill): skill is string =>
              typeof skill === "string"
          )
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

    user.profilePhoto =
      typeof profilePhoto === "string"
        ? profilePhoto.trim()
        : "";

    user.portfolio =
      Array.isArray(portfolio)
        ? portfolio.map((project) => ({
            title:
              typeof project.title === "string"
                ? project.title.trim()
                : "",

            description:
              typeof project.description === "string"
                ? project.description.trim()
                : "",

            link:
              typeof project.link === "string"
                ? project.link.trim()
                : "",

            image:
              typeof project.image === "string"
                ? project.image.trim()
                : "",
          }))
        : [];

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        profilePhoto: user.profilePhoto,
        portfolio: user.portfolio,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong while updating your profile.",
    });
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "-password -email"
    );

    if (!user) {
      res.status(404).json({
        message: "User profile not found.",
      });

      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        bio: user.bio,
        skills: user.skills,
        profilePhoto: user.profilePhoto,
        portfolio: user.portfolio,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Get user profile error:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong while loading the profile.",
    });
  }
};

export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    });

    res.status(200).json({
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      message: "Something went wrong while logging out.",
    });
  }
};