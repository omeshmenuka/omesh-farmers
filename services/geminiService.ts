import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { MOCK_FARMERS } from '../constants';

// Initialize the API
const apiKey = process.env.API_KEY || ''; // Ensure this is available in your environment
const ai = new GoogleGenAI({ apiKey });

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

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const sendMessageToAI = async (message: string): Promise<string> => {
  if (!apiKey) {
    return "I'm sorry, I cannot connect to the AI service right now (Missing API Key).";
  }

  try {
    const chat = getChatSession();
    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "I didn't catch that. Could you try again?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to the local network. Please try again later.";
  }
};

export const translateText = async (text: string, targetLang: string): Promise<string> => {
   if (!apiKey) return text;

   try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: `Translate the following text to ${targetLang}: "${text}"`,
     });
     return response.text || text;
   } catch (e) {
     return text;
   }
};
