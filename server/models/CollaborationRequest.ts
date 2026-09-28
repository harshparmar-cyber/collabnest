import mongoose, { Document, Schema } from "mongoose";

export interface ICollaborationRequest extends Document {
  project: mongoose.Types.ObjectId;
  requester: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const collaborationRequestSchema =
  new Schema<ICollaborationRequest>(
    {
      project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      },

      requester: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<ICollaborationRequest>(
  "CollaborationRequest",
  collaborationRequestSchema
);