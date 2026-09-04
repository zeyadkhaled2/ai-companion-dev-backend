import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

function isRateLimitError(err: unknown): boolean {
  if (err && typeof err === 'object' && 'status' in err) {
    return (err as { status: number }).status === 429;
  }
  return false;
}
export async function generateQuestionWithAI(category: string, difficulty: string): Promise<string> {
  const prompt = `You are a senior technical interviewer. Generate exactly one interview question for the "${category}" category at "${difficulty}" difficulty level.

Requirements:
- Return ONLY the question text, with no preamble, explanation, or labels like "Question:"
- The question should be realistic and commonly asked in real technical interviews
- Match the difficulty precisely: Easy questions should test basic understanding, Medium should require deeper knowledge, Hard should be genuinely challenging`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    if (!response || !response.text) {
      throw new Error('Failed to generate question from AI');
    }
    return response.text.trim();
  } catch (err) {
    if (isRateLimitError(err)) {
      throw new Error('AI_RATE_LIMIT');
    }
    throw err;
  }
}

export async function evaluateAnswerWithAI(category: string, difficulty: string, questionContent: string, userAnswer: string): Promise<string> {
  const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Question (${difficulty} difficulty, ${category}): "${questionContent}"

Candidate's Answer: "${userAnswer}"

Evaluate the answer for correctness, depth, and clarity. Respond with ONLY a valid JSON object in this exact format, no extra text:
{"score": <number 0-100>, "feedback": "<2-3 sentences of constructive feedback>"}`;
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt
  });
  if (!response || !response.text) {
    throw new Error('Failed to evaluate answer with AI');
  }
  return response.text.trim();
}
type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export async function chatWithAI(history: ChatMessage[]): Promise<string> {
  const contents = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction: `You are a friendly, knowledgeable mentor helping a developer prepare for technical interviews. 
Answer questions about programming concepts, debugging, and interview topics clearly and concisely. 
If asked something unrelated to software development or interview prep, gently redirect the conversation back to those topics.`,
      },
    });
    if (!response || !response.text) {
      throw new Error('Failed to get AI response');
    }
    return response.text.trim();
  } catch (err) {
    if (isRateLimitError(err)) {
      throw new Error('AI_RATE_LIMIT');
    }
    throw err;
  }
}