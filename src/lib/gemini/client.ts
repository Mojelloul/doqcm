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
      
      // Nettoyer le texte pour extraire le JSON
      let cleanedText = text.trim();
      
      // Supprimer les marqueurs de code blocks et backticks
      cleanedText = cleanedText.replace(/```json\s*/g, '');
      cleanedText = cleanedText.replace(/```\s*/g, '');
      cleanedText = cleanedText.replace(/`/g, '');
      
      // Extraire uniquement la partie JSON du texte
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("No JSON found in response:", text);
        throw new Error("No JSON found in the response");
      }
      
      const jsonString = jsonMatch[0];
      
      // Nettoyer les caractères problématiques
      const sanitizedJson = jsonString
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      try {
        return JSON.parse(sanitizedJson) as T;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Attempted to parse:", sanitizedJson);
        throw new Error(`Invalid JSON format: ${parseError}`);
      }
    } catch (error) {
      console.error("Error generating or parsing JSON with Gemini:", error);
      throw error;
    }
  }

  // Méthode spécifique pour générer un QCM
  async generateQCM(text: string, title: string, summary: string, numberOfQuestions: number = 10) {
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
}

Return ONLY the JSON object, no additional text, markdown, or code blocks.`;

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