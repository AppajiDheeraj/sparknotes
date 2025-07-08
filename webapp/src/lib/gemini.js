// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
};

export async function summariseTranscript(transcript) {
  const prompt = `
Summarize this YouTube video transcript into key points.
Make it clear, engaging, and easy to understand.
Summarize in less than 10 words:

${transcript}
  `;

  const result = await model.generateContent(prompt);
  console.log('Gemini result:', result);
  return result.response.text();
}
