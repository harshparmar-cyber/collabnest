
import { Request, Response } from "express";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import InterviewSession from "../models/InterviewSession.js";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface GeneratedQuestion {
  question?: string;
}

interface GeneratedQuestionsResponse {
  questions?: GeneratedQuestion[];
}

interface FeedbackItem {
  score?: number | string;
  feedback?: string;
}

interface InterviewEvaluation {
  score?: number | string;
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  recommendations?: string[];
  feedback?: FeedbackItem[];
}

const ai = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the backend."
    );
  }

  return new GoogleGenAI({ apiKey });
};

function userId(req: Request): string | null {
  const id = (req as AuthenticatedRequest).userId;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return String(id);
}

function parseJson<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  return JSON.parse(cleaned) as T;
}

const model = (): string =>
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

const allowedPaths = [
  "Frontend Development",
  "Backend Development",
  "Database",
  "Full Stack Development",
  "Data Structures & Algorithms",
  "DevOps",
  "Custom",
];

// POST /api/interviews/start
export async function startInterview(
  req: Request,
  res: Response
) {
  try {
    const uid = userId(req);

    if (!uid) {
      return res.status(401).json({
        message: "Please log in again.",
      });
    }

    const path = String(req.body?.path || "").trim();
    const customTopic = String(
      req.body?.customTopic || ""
    ).trim();

    if (!allowedPaths.includes(path)) {
      return res.status(400).json({
        message: "Choose a valid interview path.",
      });
    }

    const topic = path === "Custom" ? customTopic : path;

    if (!topic || topic.length > 80) {
      return res.status(400).json({
        message: "Enter a topic up to 80 characters.",
      });
    }

    const response = await ai().models.generateContent({
      model: model(),
      contents: `
Create exactly 10 distinct intermediate-level technical
interview questions about "${topic}".

Mix conceptual and practical reasoning.
Return valid JSON only in this format:
{"questions":[{"question":"Question text"}]}

Do not include answers, introductions, or numbering.
Each question must stand alone.
      `,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
        maxOutputTokens: 2500,
      },
    });

    const parsed = parseJson<GeneratedQuestionsResponse>(
      response.text || ""
    );

    const questions = (parsed.questions || [])
      .map((item) => ({
        question: String(item.question || "").trim(),
        answer: "",
      }))
      .filter((item) => item.question.length > 0);

    if (questions.length !== 10) {
      return res.status(502).json({
        message:
          "AI did not generate 10 questions. Please retry.",
      });
    }

    const session = await InterviewSession.create({
      user: uid,
      path: topic,
      difficulty: "intermediate",
      questions,
    });

    return res.status(201).json({
      sessionId: session.id,
      path: topic,
      currentIndex: 0,
      totalQuestions: 10,
      question: questions[0].question,
    });
  } catch (error) {
    console.error("startInterview:", error);

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Could not start interview.",
    });
  }
}

// POST /api/interviews/:sessionId/answer
export async function submitAnswer(
  req: Request,
  res: Response
) {
  try {
    const uid = userId(req);

    if (!uid) {
      return res.status(401).json({
        message: "Please log in again.",
      });
    }

    const sessionId = String(req.params.sessionId ?? "");
    const index = Number(req.body?.index);
    const answer = String(req.body?.answer || "").trim();

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        message: "Invalid session ID.",
      });
    }

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index > 9 ||
      !answer ||
      answer.length > 6000
    ) {
      return res.status(400).json({
        message: "Provide a valid spoken answer.",
      });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: uid,
    });

    if (!session) {
      return res.status(404).json({
        message: "Interview session not found.",
      });
    }

    if (session.status !== "in_progress") {
      return res.status(409).json({
        message: "Interview already completed.",
      });
    }

    const nextExpected = session.questions.findIndex(
      (question) => !question.answer.trim()
    );

    if (index !== nextExpected) {
      return res.status(409).json({
        message: "Answer the questions in order.",
      });
    }

    session.questions[index].answer = answer;
    await session.save();

    const next = session.questions.findIndex(
      (question) => !question.answer.trim()
    );

    return res.json({
      success: true,
      completed: next === -1,
      answered: index + 1,
      nextIndex: next,
      nextQuestion:
        next < 0 ? null : session.questions[next].question,
    });
  } catch (error) {
    console.error("submitAnswer:", error);

    return res.status(500).json({
      message: "Could not save answer.",
    });
  }
}

// POST /api/interviews/:sessionId/finish
export async function finishInterview(
  req: Request,
  res: Response
) {
  try {
    const uid = userId(req);

    if (!uid) {
      return res.status(401).json({
        message: "Please log in again.",
      });
    }

    const sessionId = String(req.params.sessionId ?? "");

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        message: "Invalid session ID.",
      });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: uid,
    });

    if (!session) {
      return res.status(404).json({
        message: "Interview session not found.",
      });
    }

    if (session.status === "completed" && session.result) {
      return res.json({ result: session.result });
    }

    if (
      session.questions.some(
        (question) => !question.answer.trim()
      )
    ) {
      return res.status(400).json({
        message: "Answer all 10 questions first.",
      });
    }

    const interviewData = session.questions.map(
      (question, index) => ({
        number: index + 1,
        question: question.question,
        answer: question.answer,
      })
    );

    const response = await ai().models.generateContent({
      model: model(),
      contents: `
Evaluate this student's intermediate-level
"${session.path}" mock interview.

Evaluate technical correctness, completeness, clarity,
and practical understanding. Do not infer vocal confidence
from the transcript.

Return valid JSON only in this format:
{
  "score": 0,
  "summary": "...",
  "strengths": ["..."],
  "improvements": ["..."],
  "feedback": [
    {
      "question": "...",
      "answer": "...",
      "score": 0,
      "feedback": "..."
    }
  ],
  "recommendations": ["..."]
}

Scores must be integers from 0 to 100.
Include exactly 10 feedback entries in question order.
Be specific and constructive.

Interview answers:
${JSON.stringify(interviewData)}
      `,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 5000,
      },
    });

    const raw = parseJson<InterviewEvaluation>(
      response.text || ""
    );

    const feedback = Array.isArray(raw.feedback)
      ? raw.feedback.slice(0, 10).map((item, index) => ({
          question: session.questions[index].question,
          answer: session.questions[index].answer,
          score: Math.max(
            0,
            Math.min(
              100,
              Math.round(Number(item.score) || 0)
            )
          ),
          feedback: String(
            item.feedback ||
              "Review this answer and practice the topic."
          ),
        }))
      : [];

    if (feedback.length !== 10) {
      return res.status(502).json({
        message:
          "AI returned incomplete feedback. Please retry.",
      });
    }

    const result = {
      score: Math.max(
        0,
        Math.min(100, Math.round(Number(raw.score) || 0))
      ),
      summary: String(
        raw.summary || "Interview completed."
      ),
      strengths: Array.isArray(raw.strengths)
        ? raw.strengths.map(String).slice(0, 8)
        : [],
      improvements: Array.isArray(raw.improvements)
        ? raw.improvements.map(String).slice(0, 8)
        : [],
      recommendations: Array.isArray(raw.recommendations)
        ? raw.recommendations.map(String).slice(0, 8)
        : [],
      feedback,
    };

    session.result = result;
    session.status = "completed";
    await session.save();

    return res.json({ result });
  } catch (error) {
    console.error("finishInterview:", error);

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Could not evaluate interview.",
    });
  }
}

// GET /api/interviews/:sessionId
export async function getInterview(
  req: Request,
  res: Response
) {
  try {
    const uid = userId(req);

    if (!uid) {
      return res.status(401).json({
        message: "Please log in again.",
      });
    }

    const sessionId = String(req.params.sessionId ?? "");

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        message: "Invalid session ID.",
      });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: uid,
    }).select(
      "path difficulty questions status result createdAt"
    );

    if (!session) {
      return res.status(404).json({
        message: "Interview session not found.",
      });
    }

    return res.json({ session });
  } catch (error) {
    console.error("getInterview:", error);

    return res.status(500).json({
      message: "Could not load interview.",
    });
  }
}
