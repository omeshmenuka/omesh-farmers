
import { GoogleGenAI } from "@google/genai";
import { MOCK_FARMERS } from '../constants';

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// System instruction to guide the AI
const SYSTEM_INSTRUCTION = `
You are the "Riga Harvest AI Assistant". Your goal is to help users find local sustainable food in Latvia.
You have access to the following farmers data (context):
${JSON.stringify(MOCK_FARMERS.map(f => ({ name: f.name, location: f.address, products: f.products.map(p => p.name).join(', ') })))}

1. Answer questions about these specific farmers.
2. If asked about seasonal produce in Latvia, give general advice based on the month (e.g., Strawberries in June/July, Mushrooms in August/September).
3. Be friendly, concise, and helpful.
4. If asked to translate, provide translations in English, Latvian, or Russian.
`;

export const sendMessageToAI = async (message: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "I'm sorry, I cannot connect to the AI service right now (Missing API Key).";
  }

  try {
    // Using gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    
    // .text is a property, not a method.
    return response.text || "I didn't catch that. Could you try again?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to the local network. Please try again later.";
  }
};

export const translateText = async (text: string, targetLang: string): Promise<string> => {
   if (!process.env.API_KEY) return text;

   try {
     const response = await ai.models.generateContent({
       model: 'gemini-3-flash-preview',
       contents: `Translate the following text to ${targetLang}: "${text}"`,
     });
     // .text is a property, not a method.
     return response.text || text;
   } catch (e) {
     return text;
   }
};
