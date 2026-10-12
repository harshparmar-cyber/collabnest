import mongoose, { Schema, Document } from "mongoose";

export interface IInterviewQuestion { question: string; answer: string }
export interface IInterviewResult {
  score: number; summary: string; strengths: string[]; improvements: string[];
  feedback: { question: string; answer: string; score: number; feedback: string }[];
  recommendations: string[];
}
export interface IInterviewSession extends Document {
  user: mongoose.Types.ObjectId; path: string; difficulty: "intermediate";
  questions: IInterviewQuestion[]; status: "in_progress" | "completed";
  result?: IInterviewResult; createdAt: Date; updatedAt: Date;
}
const sessionSchema = new Schema<IInterviewSession>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  path: { type: String, required: true, trim: true, maxlength: 80 },
  difficulty: { type: String, enum: ["intermediate"], default: "intermediate" },
  questions: { type: [{ question: { type: String, required: true }, answer: { type: String, default: "" }, _id: false }], required: true, validate: (v: IInterviewQuestion[]) => v.length === 10 },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
  result: {
    score: Number, summary: String, strengths: [String], improvements: [String], recommendations: [String],
    feedback: [{ question: String, answer: String, score: Number, feedback: String, _id: false }],
  },
}, { timestamps: true });
export default mongoose.model<IInterviewSession>("InterviewSession", sessionSchema);
