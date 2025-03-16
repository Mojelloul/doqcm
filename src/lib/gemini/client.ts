import { GoogleGenerativeAI } from "@google/generative-ai";
import { defaultConfig, GeminiConfig } from "./config";

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(config: Partial<GeminiConfig> = {}) {
    const finalConfig = { ...defaultConfig, ...config };
    this.genAI = new GoogleGenerativeAI(finalConfig.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: finalConfig.model });
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating text with Gemini:", error);
      throw error;
    }
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    try {
      const text = await this.generateText(prompt);
      // Extraire uniquement la partie JSON du texte
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in the response");
      }
      return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
      console.error("Error generating or parsing JSON with Gemini:", error);
      throw error;
    }
  }

  // Méthode spécifique pour générer un QCM
  async generateQCM(text: string, title: string, summary: string, numberOfQuestions: number = 3) {
    const prompt = `You are an advanced AI specialized in text analysis and quiz generation.

### Instructions:
1. Analyze the given text and generate a Multiple-Choice Quiz (MCQ).
2. Create exactly ${numberOfQuestions} questions.
3. Each question must have three answer choices (A, B, C).
4. Only one answer should be correct.
5. The language of the questions and answers should match the text language.

Text to analyze:
${text}

Title: ${title}

Summary: ${summary}

Please return the result in the following JSON format:
{
  "qcm": [
    {
      "question": "Question text",
      "choices": {
        "A": "Option 1",
        "B": "Option 2",
        "C": "Option 3"
      },
      "correct_answer": "A",
      "justification": "Explanation why this is correct"
    }
  ]
}`;

    return this.generateJSON<{
      qcm: Array<{
        question: string;
        choices: { A: string; B: string; C: string };
        correct_answer: "A" | "B" | "C";
        justification: string;
      }>;
    }>(prompt);
  }
} 