import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const PATHS = ["Frontend Development", "Backend Development", "Database", "Full Stack Development", "Data Structures & Algorithms", "DevOps", "Custom"];
type Interview = { sessionId: string; path: string; currentIndex: number; totalQuestions: number; question: string };
type Result = { score: number; summary: string; strengths: string[]; improvements: string[]; recommendations: string[]; feedback: { question: string; answer: string; score: number; feedback: string }[] };
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null; start(): void; stop(): void; abort(): void };
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

export default function InterviewPage() {
    const [path, setPath] = useState(PATHS[0]);
    const [customTopic, setCustomTopic] = useState("");
    const [session, setSession] = useState<Interview | null>(null);
    const [answer, setAnswer] = useState("");
    const [result, setResult] = useState<Result | null>(null);
    const [loading, setLoading] = useState(false);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [error, setError] = useState("");
    const recognitionRef = useRef<Recognition | null>(null);
    const transcriptRef = useRef("");

    const stopVoice = () => { recognitionRef.current?.abort(); recognitionRef.current = null; window.speechSynthesis?.cancel(); setListening(false); setSpeaking(false); };
    useEffect(() => () => { recognitionRef.current?.abort(); window.speechSynthesis?.cancel(); }, []);
    const speak = (text: string) => {
        if (!("speechSynthesis" in window)) { setError("Text-to-speech is not supported in this browser."); return; }
        window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "en-IN"; utterance.rate = 0.92;
        utterance.onstart = () => setSpeaking(true); utterance.onend = () => setSpeaking(false); utterance.onerror = () => setSpeaking(false); window.speechSynthesis.speak(utterance);
    };
    const api = async (route: string, body?: unknown) => {
        const response = await fetch(`${API_URL}/api/interviews${route}`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message || "Request failed."); return data;
    };
    const startInterview = async () => {
        setLoading(true); setError(""); setResult(null); setAnswer(""); stopVoice();
        try { const data = await api("/start", { path, customTopic }); setSession(data); speak(`Welcome to your ${data.path} interview. Question 1. ${data.question}`); }
        catch (e) { setError(e instanceof Error ? e.message : "Could not start interview."); } finally { setLoading(false); }
    };
    const startListening = () => {
        setError(""); const w = window as SpeechWindow; const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
        if (!Ctor) { setError("Speech recognition is not supported here. Try Chrome on localhost or HTTPS."); return; }
        stopVoice(); transcriptRef.current = ""; setAnswer(""); const recognition = new Ctor(); recognition.lang = "en-IN"; recognition.continuous = true; recognition.interimResults = true;
        recognition.onresult = (event) => { let finalText = transcriptRef.current; let interim = ""; for (let i = event.resultIndex; i < event.results.length; i++) { const text = event.results[i][0]?.transcript || ""; if (event.results[i].isFinal) finalText += `${text} `; else interim += text; } transcriptRef.current = finalText; setAnswer(`${finalText}${interim}`.trim()); };
        recognition.onerror = (event) => { setListening(false); if (event.error !== "aborted" && event.error !== "no-speech") setError(`Speech recognition error: ${event.error}. Check microphone permission.`); };
        recognition.onend = () => setListening(false); recognitionRef.current = recognition;
        try { recognition.start(); setListening(true); } catch { setError("Could not start microphone. Check browser permission and try again."); }
    };
    const submitAnswer = async () => {
        if (!session || !answer.trim()) return; setLoading(true); setError(""); recognitionRef.current?.stop(); setListening(false);
        try {
            const saved = await api(`/${session.sessionId}/answer`, { index: session.currentIndex, answer: answer.trim() });
            if (saved.completed) { setLoading(true); const finalData = await api(`/${session.sessionId}/finish`); setResult(finalData.result); setSession(null); setAnswer(""); stopVoice(); }
            else { const next = { ...session, currentIndex: saved.nextIndex, question: saved.nextQuestion }; setSession(next); setAnswer(""); transcriptRef.current = ""; speak(`Question ${next.currentIndex + 1}. ${next.question}`); }
        } catch (e) { setError(e instanceof Error ? e.message : "Could not submit answer."); } finally { setLoading(false); }
    };
    const reset = () => { stopVoice(); setSession(null); setResult(null); setAnswer(""); setError(""); };

    return <main className="min-h-screen bg-[#f4f8ff] px-4 py-8 text-slate-800 sm:px-6 lg:px-10"><div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-blue-700">CollabNest</p><h1 className="mt-1 text-3xl font-bold text-[#12355b] sm:text-4xl">AI Voice Interview</h1><p className="mt-2 text-slate-600">Practice a 10-question technical interview out loud.</p></div><Link to="/dashboard" className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">Dashboard</Link></header>
        {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {!session && !result && <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8"><div className="mb-5 text-3xl">🎙️</div><h2 className="text-xl font-bold">Set up your interview</h2><p className="mt-2 text-sm leading-6 text-slate-600">Gemini creates 10 intermediate questions. Your browser reads each question aloud.</p><label className="mt-6 block text-sm font-semibold">Interview path</label><select value={path} onChange={e => setPath(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3">{PATHS.map(p => <option key={p}>{p}</option>)}</select>{path === "Custom" && <input value={customTopic} onChange={e => setCustomTopic(e.target.value)} maxLength={80} placeholder="e.g. PostgreSQL, React, Node.js" className="mt-3 w-full rounded-xl border px-4 py-3" />}<div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900"><b>Intermediate · 10 questions</b><p className="mt-1">Voice questions, speech-to-text answers, AI evaluation.</p></div><button disabled={loading || !API_URL || (path === "Custom" && !customTopic.trim())} onClick={startInterview} className="mt-6 w-full rounded-xl bg-[#0b4da5] px-5 py-3.5 font-semibold text-white disabled:opacity-50">{loading ? "Preparing questions…" : "Start interview"}</button>{!API_URL && <p className="mt-3 text-sm text-red-600">VITE_API_URL is missing from your frontend environment.</p>}</section>}
        {session && <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap justify-between gap-3"><span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">{session.path}</span><span className="text-sm font-semibold text-slate-500">Question {session.currentIndex + 1} of 10</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-600" style={{ width: `${(session.currentIndex + 1) * 10}%` }} /></div><div className="mt-8 rounded-2xl bg-[#f3f7ff] p-5 sm:p-7"><p className="text-sm font-semibold text-blue-700">{speaking ? "● AI interviewer is speaking…" : "Your question"}</p><h2 className="mt-3 text-xl font-semibold leading-8 text-[#12355b]">{session.question}</h2><button onClick={() => speak(session.question)} className="mt-4 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800">🔊 Read question again</button></div><div className="mt-6 flex justify-between gap-3"><label className="font-semibold">Your spoken answer</label><span className="text-xs text-slate-500">Read-only transcript</span></div><textarea value={answer} readOnly rows={6} placeholder="Press Start speaking and answer in your own words…" className="mt-2 w-full resize-y rounded-xl border bg-slate-50 px-4 py-3 leading-6 outline-none" /><div className="mt-4 flex flex-col gap-3 sm:flex-row">{!listening ? <button disabled={loading} onClick={startListening} className="flex-1 rounded-xl border border-blue-200 px-4 py-3 font-semibold text-blue-800 disabled:opacity-50">🎙️ {answer ? "Record again" : "Start speaking"}</button> : <button onClick={() => { recognitionRef.current?.stop(); setListening(false); }} className="flex-1 rounded-xl bg-amber-100 px-4 py-3 font-semibold text-amber-900">Stop recording</button>}<button disabled={loading || listening || !answer.trim()} onClick={submitAnswer} className="flex-1 rounded-xl bg-[#0b4da5] px-4 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Submitting…" : session.currentIndex === 9 ? "Submit & see results" : "Submit answer →"}</button></div><p className="mt-3 text-xs leading-5 text-slate-500">You cannot edit the transcript. If recognition mishears you, record your answer again before submitting.</p></section>}
        {result && <section className="space-y-5"><div className="rounded-3xl bg-gradient-to-br from-[#073b88] to-[#1766c2] p-7 text-white shadow-lg sm:p-9"><p className="text-sm font-semibold uppercase tracking-widest text-blue-100">Interview complete</p><p className="mt-4 text-6xl font-bold">{result.score}<span className="text-xl text-blue-100"> / 100</span></p><p className="mt-4 leading-7 text-blue-50">{result.summary}</p></div><div className="grid gap-5 sm:grid-cols-2"><div className="rounded-2xl border bg-white p-5"><h3 className="font-bold text-emerald-800">Strengths</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{result.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul></div><div className="rounded-2xl border bg-white p-5"><h3 className="font-bold text-amber-800">Areas to improve</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{result.improvements.map((x, i) => <li key={i}>{x}</li>)}</ul></div></div><div className="rounded-2xl border bg-white p-5 sm:p-7"><h3 className="text-xl font-bold">Question-wise feedback</h3><div className="mt-4 space-y-4">{result.feedback.map((x, i) => <article key={i} className="rounded-xl bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><h4 className="font-semibold">Q{i + 1}. {x.question}</h4><span className="shrink-0 rounded-lg bg-blue-100 px-2 py-1 text-sm font-bold text-blue-800">{x.score}/100</span></div><p className="mt-2 text-sm text-slate-600"><b>Your answer:</b> {x.answer}</p><p className="mt-2 text-sm leading-6">{x.feedback}</p></article>)}</div></div><div className="rounded-2xl border bg-white p-5"><h3 className="font-bold">Recommended next steps</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{result.recommendations.map((x, i) => <li key={i}>{x}</li>)}</ul></div><button onClick={reset} className="w-full rounded-xl bg-[#0b4da5] px-5 py-3.5 font-semibold text-white">Start another interview</button></section>}
    </div></main>;
}
