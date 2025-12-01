import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExamConfig, GeneratedQuestion, QuestionType, FileData } from "../types";

// Note: Initialization moved inside the function to prevent startup crashes if process.env is undefined in browser

const mcqSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      questionText: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      correctOptionIndex: { 
        type: Type.INTEGER, 
        description: "Zero-based index of the correct option (0=K, 1=Kh, 2=G, 3=Gh)" 
      },
      reference: {
        type: Type.STRING,
        description: "The specific topic, paragraph, or text snippet from the document that this question is based on."
      }
    },
    required: ["id", "questionText", "options", "correctOptionIndex", "reference"],
  },
};

const creativeSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      stemContext: { 
        type: Type.STRING, 
        description: "The context/scenario (Uddipok). Must be detailed (4-6 sentences) and engaging." 
      },
      diagramSvg: {
        type: Type.STRING,
        description: "Optional. If the question requires a visual diagram (Geometry, Physics circuit, Bar chart), provide valid, simple SVG code string here (start with <svg>). Use black strokes, white fill, and ensure it fits a 300px width. If no diagram needed, leave empty."
      },
      stems: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "The 4 sub-questions (K, Kh, G, Gh)",
      },
      correctAnswer: {
        type: Type.STRING,
        description: "Brief key points or outline for the answer"
      },
      reference: {
        type: Type.STRING,
        description: "The specific topic/page from the document used. Mention if it is from Beginning, Middle, or End."
      }
    },
    required: ["id", "stemContext", "stems", "correctAnswer", "reference"],
  },
};

export const generateQuestions = async (
  config: ExamConfig,
  textContext: string,
  fileData: FileData | null
): Promise<GeneratedQuestion[]> => {
  // Initialize AI client here to avoid global process.env access crashes
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const isMcq = config.questionType === QuestionType.MCQ;
  
  const systemInstruction = `
    You are an expert Bengali school teacher. Your task is to generate exam questions in Bengali based strictly on the provided content.
    
    CRITICAL INSTRUCTIONS:
    1. **Full Coverage**: You MUST distribute questions evenly across the ENTIRE document.
       - Questions 1-${Math.floor(config.questionCount * 0.3)}: From the BEGINNING sections.
       - Questions ${Math.floor(config.questionCount * 0.3) + 1}-${Math.floor(config.questionCount * 0.7)}: From the MIDDLE sections.
       - Questions ${Math.floor(config.questionCount * 0.7) + 1}-${config.questionCount}: From the ENDING sections.
    
    2. **Context (Uddipok) Quality**:
       - For Creative Questions, the 'stemContext' MUST be detailed, substantial, and at least 80-120 words long. 
       - It should tell a story, describe a scenario, or set up a complex problem. DO NOT write short 1-line contexts.
    
    3. **Visuals/Diagrams**:
       - If a question involves Geometry, Science diagrams, or Charts (as found in the source or relevant to the topic), you MUST generate a simple **SVG code** for it in the 'diagramSvg' field.
       - The SVG should be black and white, clear, and scalable.
    
    Rules:
    - Language: Bengali (Bangla).
    - Quantity: Generate exactly ${config.questionCount} questions.
    - Type: ${isMcq 
      ? "MCQ. Provide 'questionText' and 'options' (text only, no labels like 'k)')." 
      : "Creative (Srijonshil). Provide 'stemContext', 'stems' (text only, no labels like 'k)'), and optionally 'diagramSvg'."
    }
    
    Marks Distribution for Creative:
    (K) Knowledge [1 mark]
    (Kh) Comprehension [2 marks]
    (G) Application [3 marks]
    (Gh) Higher Order [4 marks]

    Return the response as a valid JSON array matching the schema.
  `;

  const parts: any[] = [];

  // Add file if present
  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.base64,
        mimeType: fileData.mimeType,
      },
    });
  }

  // Add text prompt
  const userPrompt = `
    Context/Topic Content: ${textContext || "Use the attached document content."}
    
    Please generate ${config.questionCount} ${isMcq ? "MCQ" : "Creative"} questions based on this.
    REMEMBER: Cover the start, middle, and end of the document. Write long, detailed Uddipoks. Draw diagrams (SVG) where needed.
  `;
  parts.push({ text: userPrompt });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: isMcq ? mcqSchema : creativeSchema,
        temperature: 0.5, // Lower temperature for more structured adherence
        thinkingConfig: { thinkingBudget: 1024 }, // Enable thinking for better coverage planning
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedQuestion[];
    }
    throw new Error("No data returned from Gemini");
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
};