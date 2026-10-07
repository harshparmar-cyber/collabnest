import mongoose, { Document, Schema } from "mongoose";

export type MessageType = "text" | "image" | "audio";

export interface IMessage extends Document {
  group: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;

  type: MessageType;

  text?: string;

  mediaUrl?: string;

  duration?: number;

  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: "CollaborationGroup",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "audio"],
      default: "text",
      required: true,
    },

    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    mediaUrl: {
      type: String,
      trim: true,
    },

    duration: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMessage>(
  "Message",
  messageSchema
);