import { GoogleGenAI, Type } from "@google/genai";
import type { CodeBundle } from "../types";

// Initialize the AI client once using the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are an expert web developer specializing in creating single-page applications. Your task is to generate the complete HTML, CSS, and JavaScript code for a web application based on the user's description.

**Instructions:**
1. Analyze the user's request carefully.
2. Generate clean, modern, and responsive code.
3. Use vanilla JavaScript. Do not use any frameworks like React, Vue, or Angular.
4. Place all CSS in the 'css' field and all JavaScript in the 'javascript' field. Do not use inline styles or scripts in the HTML.
5. In the HTML, include a <link rel="stylesheet" href="style.css"> and a <script src="script.js" defer></script>. You will provide the content for these files in the respective JSON fields.
6. The generated application must be fully functional and self-contained within the provided three code blocks.
7. Your entire response MUST be a single, valid JSON object with the structure: { "html": "...", "css": "...", "javascript": "..." }.
8. Do not include any explanations, comments, or markdown formatting outside of the JSON object itself.
`;

const handleError = (error: unknown): never => {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if(error.message.includes('API key not valid')) {
            throw new Error('The configured API key is not valid. Please ensure it is set up correctly.');
        }
        if (error.message.includes('429')) {
             throw new Error('You have exceeded your quota. Please check your billing account or try again later.');
        }
    }
    throw new Error("An error occurred while communicating with the API. Please check the console for details.");
}

export async function generateAppCode(
    prompt: string
): Promise<{ code: CodeBundle; sources?: any[] }> {
  try {
    const model = "gemini-2.5-flash";
    const contents = `User request: "${prompt}"`;
    const config = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            html: { type: Type.STRING },
            css: { type: Type.STRING },
            javascript: { type: Type.STRING },
          },
          required: ["html", "css", "javascript"],
        },
    };
    
    const response = await ai.models.generateContent({ model, contents, config });

    const responseText = response.text.trim();
    const code = JSON.parse(responseText);
    
    if (typeof code.html !== 'string' || typeof code.css !== 'string' || typeof code.javascript !== 'string') {
      throw new Error('Invalid code structure received from API.');
    }

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    return { code, sources };

  } catch (error) {
    handleError(error);
  }
}

export async function getChatResponse(
    prompt: string,
    isThinkingMode: boolean
): Promise<string> {
    try {
        const model = isThinkingMode ? "gemini-2.5-pro" : "gemini-2.5-flash";
        const config = isThinkingMode
            ? { thinkingConfig: { thinkingBudget: 32768 } }
            : undefined;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            ...(config && { config }),
        });

        return response.text;
    } catch (error) {
        handleError(error);
    }
}