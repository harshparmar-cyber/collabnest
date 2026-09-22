import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  category: string;
  skills: string[];
  teamSize: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    skills: {
      type: [String],
      required: true,
      default: [],
    },

    teamSize: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model<IProject>(
  "Project",
  projectSchema
);

export default Project;