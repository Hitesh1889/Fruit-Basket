import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BasketModel, HintResponse } from "../types";
import { BASKET_CAPACITY } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const getHintFromAI = async (baskets: BasketModel[]): Promise<HintResponse | null> => {
  try {
    const ai = getClient();
    
    // Construct a text representation of the board
    const boardState = baskets.map((b, index) => {
        return `Basket ${index} (Capacity ${b.capacity}): [${b.fruits.join(', ')}]`;
    }).join('\n');

    const prompt = `
      You are an expert puzzle solver for a "Fruit Sort" game.
      
      Rules:
      1. You can move a stack of matching fruits from the top of one basket to another.
      2. You can only move fruits to an empty basket OR on top of a matching fruit type.
      3. Baskets have a maximum capacity of ${BASKET_CAPACITY}.
      4. When moving, you move as many identical top fruits as possible to fill the destination.
      5. The goal is to sort all fruits so each basket contains only one type of fruit.
      
      Current Board State:
      ${boardState}
      
      Analyze the board and provide the BEST SINGLE NEXT MOVE to help solve the puzzle.
      If no move is possible, explain why.
      
      Return a JSON object with:
      - fromBasketIndex: number (index of source basket)
      - toBasketIndex: number (index of destination basket)
      - explanation: string (short reason for the move)
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        fromBasketIndex: { type: Type.INTEGER, description: "Index of the source basket (0-based)" },
        toBasketIndex: { type: Type.INTEGER, description: "Index of the destination basket (0-based)" },
        explanation: { type: Type.STRING, description: "Reasoning for the move" },
      },
      required: ["fromBasketIndex", "toBasketIndex", "explanation"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as HintResponse;

  } catch (error) {
    console.error("Error fetching hint from Gemini:", error);
    return null;
  }
};