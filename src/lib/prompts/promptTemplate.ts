export const qcmPromptTemplate = (text: string, title: string, summary: string, numberOfQuestions: number = 3) => `You are an advanced AI specialized in text analysis and quiz generation.  

### Instructions:  
1. **Analyze the given text:**  
   - Detect the **language** of the text.  
   - Extract the **title** if available.  
   - Summarize the text or highlight key points.  

2. **Generate a Multiple-Choice Quiz (MCQ) based on the text:**  
   - The **questions and answers must be in the same language as the text** (French text → French questions, English text → English questions, etc.).  
   - Create exactly **${numberOfQuestions}** questions.  
   - Each question must be clear and relevant to the text.  
   - Provide **three answer choices (A, B, C)** per question.  
   - Only **one answer** should be correct.  

3. **Output format (JSON):**  
   - The result must be returned in a structured JSON format as follows:  

\`\`\`json
{
  "qcm": [
    {
      "question": "Question text in the detected language",
      "choices": {
        "A": "Option 1",
        "B": "Option 2",
        "C": "Option 3"
      },
      "correct_answer": "A",
      "justification": "Explanation or reference to the text"
    },
    {
      "question": "Question text in the detected language",
      "choices": {
        "A": "Option 1",
        "B": "Option 2",
        "C": "Option 3"
      },
      "correct_answer": "B",
      "justification": "Explanation or reference to the text"
    }
  ]
}
\`\`\`

Important Notes:
- The AI must automatically detect the language of the provided text and generate the questions accordingly.
- The instruction must always remain in English, regardless of the text language.
- The justification should explain why the correct answer is valid, using an extract from the text or a short clarification.

Input:
Here is the full text to analyze and transform into a quiz:
[${text}]

title:
[${title}]

summary:
[${summary}]`;

export type QCMQuestion = {
  question: string;
  choices: {
    A: string;
    B: string;
    C: string;
  };
  correct_answer: "A" | "B" | "C";
  justification: string;
};

export type QCMResponse = {
  qcm: QCMQuestion[];
}; 