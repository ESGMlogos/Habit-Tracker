import { GoogleGenAI, Type } from "@google/genai";
import { Habit, HabitLogs, AIAnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-pro-preview';

export const analyzeProgress = async (
  habits: Habit[],
  logs: HabitLogs,
  userQuery?: string
): Promise<AIAnalysisResponse> => {
  
  // Construct a summary of performance
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const habitSummary = habits.map(h => {
    const completions = logs[h.id] || [];
    const total = completions.length;
    const lastCompleted = completions.sort().pop() || 'Never';
    return `${h.title} (${h.category}): ${total} times. Last: ${lastCompleted}`;
  }).join('\n');

  const prompt = `
    You are an elite productivity coach for a user attempting a 900-day habit streak.
    Current Date: ${todayStr}
    
    User's Habit Data:
    ${habitSummary}

    User Specific Query (if any): ${userQuery || "General status check"}

    Analyze their performance. Be strict but encouraging. 
    Return a JSON object with:
    - insight: A short paragraph analyzing their trends.
    - motivationalQuote: A punchy, unique quote relevant to their struggle or success.
    - score: A number 0-100 based on consistency.
    - suggestions: An array of 3 specific, actionable bullet points to improve or maintain momentum.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            motivationalQuote: { type: Type.STRING },
            score: { type: Type.NUMBER },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResponse;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      insight: "I'm having trouble connecting to the neural network right now. Keep pushing forward regardless.",
      motivationalQuote: "Consistency is key, even when the lights go out.",
      score: 50,
      suggestions: ["Check your internet connection", "Review your API Key", "Just do one habit today"]
    };
  }
};

export const suggestHabits = async (goal: string): Promise<Habit[]> => {
  const prompt = `
    The user wants to achieve this goal: "${goal}".
    Suggest 3-5 high-impact daily habits to achieve this.
    Return JSON array of habit objects.
    Each object must have: title, description, category (must be one of: Health, Fitness, Learning, Productivity, Mindfulness, Creativity).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING } // We'll map string to enum later loosely
            }
          }
        }
      }
    });

    if (response.text) {
      const rawData = JSON.parse(response.text);
      // Map to proper types with ID
      return rawData.map((h: any) => ({
        id: crypto.randomUUID(),
        title: h.title,
        description: h.description,
        category: h.category, // Assuming AI follows instructions, otherwise allow loose string
        createdAt: new Date().toISOString(),
        archived: false
      }));
    }
    return [];
  } catch (e) {
    console.error(e);
    return [];
  }
};
