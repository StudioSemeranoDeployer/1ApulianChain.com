import { GoogleGenAI, Chat } from "@google/genai";
import { Product } from '../types';

const API_KEY = process.env.API_KEY || '';

class GeminiService {
  private ai: GoogleGenAI;
  private model: string = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  /**
   * Creates a chat session contextually aware of the specific product.
   */
  public createProductChat(product: Product): Chat {
    const systemInstruction = `
      You are the "ApulianChain Concierge", an AI assistant dedicated to the luxury agricultural products of Puglia, Italy.
      
      You are currently assisting a user who is viewing a verified product on the blockchain.
      
      Product Details:
      - Name: ${product.name}
      - Type: ${product.type}
      - Producer: ${product.producer}
      - Origin: ${product.origin}
      - Year: ${product.harvestYear}
      - Sustainability Score: ${product.sustainabilityScore}/100
      
      Your goal is to:
      1. Answer questions about this specific product's journey, authenticity, and quality.
      2. Suggest food pairings and recipes typical of the Apulian region that go well with this product.
      3. Explain the cultural significance of the product.
      
      Tone: Elegant, knowledgeable, warm, and trustworthy. Use formatting like bullet points for recipes.
      Keep responses concise but informative.
    `;

    return this.ai.chats.create({
      model: this.model,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });
  }

  /**
   * Sends a message to the chat session.
   */
  public async sendMessage(chat: Chat, message: string): Promise<string> {
    try {
      const response = await chat.sendMessage({ message });
      return response.text || "I apologize, I couldn't generate a response at this moment.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having trouble connecting to the Apulian knowledge base right now. Please try again.";
    }
  }
}

export const geminiService = new GeminiService();
