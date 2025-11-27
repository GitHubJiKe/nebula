import { GoogleGenAI } from "@google/genai";
import { AIAction } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

export const generateAIResponse = async (
  text: string,
  action: AIAction
): Promise<string> => {
  if (!text.trim()) return "";

  let prompt = "";
  
  switch (action) {
    case AIAction.SUMMARIZE:
      prompt = `Summarize the following markdown content concisely:\n\n${text}`;
      break;
    case AIAction.FIX_GRAMMAR:
      prompt = `Fix grammar and spelling in the following markdown content. Do not change the tone:\n\n${text}`;
      break;
    case AIAction.EXPAND:
      prompt = `Expand on the following markdown content, adding more technical details and examples where appropriate:\n\n${text}`;
      break;
    case AIAction.TECH_POLISH:
      prompt = `Rewrite the following text to sound more technical, professional, and clear. Maintain markdown formatting:\n\n${text}`;
      break;
    default:
      prompt = text;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI response");
  }
};
