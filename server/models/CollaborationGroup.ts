import mongoose, { Document, Schema } from "mongoose";

export interface ICollaborationGroup extends Document {
  project: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const collaborationGroupSchema =
  new Schema<ICollaborationGroup>(
    {
      project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        unique: true,
      },

      owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      members: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      name: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<ICollaborationGroup>(
  "CollaborationGroup",
  collaborationGroupSchema
);