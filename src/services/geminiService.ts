import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function generateQuestionWithAI(category: string, difficulty: string): Promise<string> {
  const prompt = `You are a senior technical interviewer. Generate exactly one interview question for the "${category}" category at "${difficulty}" difficulty level.

Requirements:
- Return ONLY the question text, with no preamble, explanation, or labels like "Question:"
- The question should be realistic and commonly asked in real technical interviews
- Match the difficulty precisely: Easy questions should test basic understanding, Medium should require deeper knowledge, Hard should be genuinely challenging`;

  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: prompt,
  });
  if (!response || !response.text) {
    throw new Error('Failed to generate question from AI');
  }
  return response.text.trim();
}

export async function evaluateAnswerWithAI(category: string, difficulty: string, questionContent: string, userAnswer: string): Promise<string> {
  const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Question (${difficulty} difficulty, ${category}): "${questionContent}"

Candidate's Answer: "${userAnswer}"

Evaluate the answer for correctness, depth, and clarity. Respond with ONLY a valid JSON object in this exact format, no extra text:
{"score": <number 0-100>, "feedback": "<2-3 sentences of constructive feedback>"}`;
  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: prompt
  });
  if (!response || !response.text) {
    throw new Error('Failed to evaluate answer with AI');
  }
  return response.text.trim();
}