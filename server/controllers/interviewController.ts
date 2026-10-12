import { Request, Response } from "express";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import InterviewSession from "../models/InterviewSession.js";

const ai = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured on the backend.");
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};
// Adjust this helper if your authMiddleware uses a different request property.
function userId(req: Request): string | null {
  const u = (req as Request & { user?: { userId?: string; id?: string; _id?: string } }).user;
  const id = u?.userId || u?.id || u?._id;
  return id && mongoose.Types.ObjectId.isValid(id) ? String(id) : null;
}
function json<T>(s: string): T {
  return JSON.parse(s.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")) as T;
}
const model = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function startInterview(req: Request, res: Response) {
  try {
    const uid = userId(req); if (!uid) return res.status(401).json({ message: "Please log in again." });
    const path = String(req.body?.path || "").trim();
    const customTopic = String(req.body?.customTopic || "").trim();
    const allowed = ["Frontend Development", "Backend Development", "Database", "Full Stack Development", "Data Structures & Algorithms", "DevOps", "Custom"];
    if (!allowed.includes(path)) return res.status(400).json({ message: "Choose a valid interview path." });
    const topic = path === "Custom" ? customTopic : path;
    if (!topic || topic.length > 80) return res.status(400).json({ message: "Enter a topic up to 80 characters." });
    const response = await ai().models.generateContent({
      model: model(),
      contents: `Create exactly 10 distinct intermediate-level technical interview questions for ${topic}. Mix conceptual and practical reasoning. Return valid JSON only: {"questions":[{"question":"..."}]}. No answers, no intro, no numbering. Each question should stand alone.`,
      config: { responseMimeType: "application/json", temperature: 0.6, maxOutputTokens: 2500 },
    });
    const parsed = json<{ questions: { question: string }[] }>(response.text || "");
    const questions = (parsed.questions || []).map((q: { question?: string }) => ({ question: String(q.question || "").trim(), answer: "" })).filter(q => q.question);
    if (questions.length !== 10) return res.status(502).json({ message: "AI did not generate 10 questions. Please retry." });
    const session = await InterviewSession.create({ user: uid, path: topic, difficulty: "intermediate", questions });
    return res.status(201).json({ sessionId: session.id, path: topic, currentIndex: 0, totalQuestions: 10, question: questions[0].question });
  } catch (e) { console.error("startInterview", e); return res.status(500).json({ message: e instanceof Error ? e.message : "Could not start interview." }); }
}

export async function submitAnswer(req: Request, res: Response) {
  try {
    const uid = userId(req); if (!uid) return res.status(401).json({ message: "Please log in again." });
    const sessionId = String(req.params.sessionId ?? ""); const index = Number(req.body?.index); const answer = String(req.body?.answer || "").trim();
    if (!mongoose.Types.ObjectId.isValid(sessionId)) return res.status(400).json({ message: "Invalid session ID." });
    if (!Number.isInteger(index) || index < 0 || index > 9 || !answer || answer.length > 6000) return res.status(400).json({ message: "Provide a valid spoken answer." });
    const session = await InterviewSession.findOne({ _id: sessionId, user: uid });
    if (!session) return res.status(404).json({ message: "Interview session not found." });
    if (session.status !== "in_progress") return res.status(409).json({ message: "Interview already completed." });
    const nextExpected = session.questions.findIndex((q: { answer: string }) => !q.answer.trim());
    if (index !== nextExpected) return res.status(409).json({ message: "Answer the questions in order." });
    session.questions[index].answer = answer; await session.save();
    const next = session.questions.findIndex((q: { answer: string }) => !q.answer.trim());
    return res.json({ success: true, completed: next === -1, answered: index + 1, nextIndex: next, nextQuestion: next < 0 ? null : session.questions[next].question });
  } catch (e) { console.error("submitAnswer", e); return res.status(500).json({ message: "Could not save answer." }); }
}

export async function finishInterview(req: Request, res: Response) {
  try {
    const uid = userId(req); if (!uid) return res.status(401).json({ message: "Please log in again." });
    const sessionId = String(req.params.sessionId ?? "");
    if (!mongoose.Types.ObjectId.isValid(sessionId)) return res.status(400).json({ message: "Invalid session ID." });
    const session = await InterviewSession.findOne({ _id: sessionId, user: uid });
    if (!session) return res.status(404).json({ message: "Interview session not found." });
    if (session.status === "completed" && session.result) return res.json({ result: session.result });
    if (session.questions.some((q: { answer: string }) => !q.answer.trim())) return res.status(400).json({ message: "Answer all 10 questions first." });
    const response = await ai().models.generateContent({
      model: model(),
      contents: `Evaluate this student's intermediate ${session.path} mock interview fairly for technical correctness, completeness, clarity and practical understanding. Do not infer vocal confidence from text. Return JSON only with: {"score":0,"summary":"...","strengths":["..."],"improvements":["..."],"feedback":[{"question":"...","answer":"...","score":0,"feedback":"..."}],"recommendations":["..."]}. Scores must be integers 0-100 and feedback must have exactly 10 entries in order. Be specific and constructive. Data: ${JSON.stringify(session.questions.map((q,i)=>({number:i+1,question:q.question,answer:q.answer})))}`,
      config: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 5000 },
    });
    const raw = json<any>(response.text || "");
    const result = {
      score: Math.max(0, Math.min(100, Math.round(Number(raw.score) || 0))),
      summary: String(raw.summary || "Interview completed."),
      strengths: Array.isArray(raw.strengths) ? raw.strengths.map(String).slice(0,8) : [],
      improvements: Array.isArray(raw.improvements) ? raw.improvements.map(String).slice(0,8) : [],
      recommendations: Array.isArray(raw.recommendations) ? raw.recommendations.map(String).slice(0,8) : [],
      feedback: Array.isArray(raw.feedback) ? raw.feedback.slice(0,10).map((f: { score?: number | string; feedback?: string }, i: number)=>({ question: session.questions[i].question, answer: session.questions[i].answer, score: Math.max(0,Math.min(100,Math.round(Number(f.score)||0))), feedback: String(f.feedback || "Review this answer and practice the topic.") })) : [],
    };
    if (result.feedback.length !== 10) return res.status(502).json({ message: "AI returned incomplete feedback. Please retry." });
    session.result = result; session.status = "completed"; await session.save();
    return res.json({ result });
  } catch (e) { console.error("finishInterview", e); return res.status(500).json({ message: e instanceof Error ? e.message : "Could not evaluate interview." }); }
}

export async function getInterview(req: Request, res: Response) {
  try {
    const uid = userId(req); if (!uid) return res.status(401).json({ message: "Please log in again." });
    const sessionId = String(req.params.sessionId ?? "");
    if (!mongoose.Types.ObjectId.isValid(sessionId)) return res.status(400).json({ message: "Invalid session ID." });
    const session = await InterviewSession.findOne({ _id: sessionId, user: uid }).select("path difficulty questions status result createdAt");
    if (!session) return res.status(404).json({ message: "Interview session not found." });
    return res.json({ session });
  } catch (e) { console.error("getInterview", e); return res.status(500).json({ message: "Could not load interview." }); }
}
