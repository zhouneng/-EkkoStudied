
import { GoogleGenAI } from "@google/genai";
import { AgentRole, LayoutElement } from "../types";
import { AGENTS } from "../constants";

// Configuration state
let clientConfig = {
    apiKey: process.env.API_KEY || '',
    baseUrl: '',
    apiMode: 'official' as 'official' | 'custom'
};

let modelConfig = {
    reasoning: 'gemini-3-flash-preview',
    fast: 'gemini-3-flash-preview',
    image: 'gemini-2.5-flash-image'
};

export const configureClient = (apiKey: string, baseUrl: string, apiMode: 'official' | 'custom') => {
    clientConfig = { apiKey, baseUrl, apiMode };
};

export const configureModels = (config: { reasoning: string; fast: string; image: string }) => {
    modelConfig = config;
};

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const createGeminiClient = () => {
    const key = clientConfig.apiKey || process.env.API_KEY; 
    
    if (!key) {
        console.error("API_KEY is missing from environment variables or configuration");
        throw new Error("API Key missing");
    }

    if (clientConfig.apiMode === 'custom' && clientConfig.baseUrl) {
        return new GoogleGenAI({ apiKey: key, httpOptions: { baseUrl: clientConfig.baseUrl } });
    }
    
    return new GoogleGenAI({ apiKey: key });
};

export async function* streamAgentAnalysis(
  agent: AgentRole,
  images: { data: string; mimeType: string }[],
  previousContext: string = "",
  overrideInstruction?: string
): AsyncGenerator<string, void, unknown> {
  const ai = createGeminiClient();
  const agentConfig = AGENTS[agent];
  
  const systemInstruction = overrideInstruction || agentConfig.systemInstruction;
  let prompt = "Analyze the input based on your role.";
  if (previousContext) {
      prompt += `\n\nContext from previous agents:\n${previousContext}`;
  }

  const parts: any[] = [];
  
  // Add images to content parts
  images.forEach(img => {
      parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  });
  
  // Add prompt text
  parts.push({ text: prompt });

  const responseStream = await ai.models.generateContentStream({
    model: modelConfig.reasoning || 'gemini-3-flash-preview',
    contents: { parts },
    config: {
        systemInstruction: systemInstruction,
    }
  });

  for await (const chunk of responseStream) {
      if (chunk.text) {
          yield chunk.text;
      }
  }
}

export const analyzeImageWithAgent = async (
  base64Image: string,
  agent: AgentRole,
  previousContext: string = ""
): Promise<string> => {
    let text = "";
    // Wrap single image in array for backward compatibility helper
    const stream = streamAgentAnalysis(agent, [{ data: base64Image, mimeType: 'image/jpeg' }], previousContext);
    for await (const chunk of stream) {
        text += chunk;
    }
    return text;
};

export const generateImageFromPrompt = async (
    prompt: string,
    aspectRatio: string,
    referenceImage?: string | null,
    referenceMimeType: string = "image/jpeg"
): Promise<string | null> => {
    const ai = createGeminiClient();
    const model = modelConfig.image || 'gemini-2.5-flash-image';

    const parts: any[] = [{ text: prompt }];

    if (referenceImage) {
         parts.unshift({
             inlineData: {
                 mimeType: referenceMimeType,
                 data: referenceImage
             }
         });
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: parts },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio as any, 
                }
            }
        });

        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data;
                }
            }
        }
    } catch (e) {
        console.error("Image generation failed", e);
        throw e;
    }

    return null;
};

export async function* streamConsistencyCheck(
    originalImage: string,
    generatedImage: string
): AsyncGenerator<string, void, unknown> {
    const ai = createGeminiClient();
    const prompt = `Compare the generated image (second image) with the original image (first image). 
    Identify discrepancies in subject appearance, lighting, composition, and details.
    Provide a quality score and specific improvement suggestions.`;

    const responseStream = await ai.models.generateContentStream({
        model: modelConfig.reasoning || 'gemini-3-flash-preview',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: originalImage } },
                { inlineData: { mimeType: 'image/png', data: generatedImage } },
                { text: prompt }
            ]
        },
        config: {
            systemInstruction: AGENTS[AgentRole.CRITIC].systemInstruction
        }
    });

    for await (const chunk of responseStream) {
        if (chunk.text) yield chunk.text;
    }
}

export const refinePromptWithFeedback = async (
    originalPrompt: string,
    feedback: string,
    referenceImage: string | null,
    mimeType: string = "image/jpeg"
): Promise<string> => {
    const ai = createGeminiClient();
    
    let parts: any[] = [];
    if (referenceImage) {
        parts.push({ inlineData: { mimeType, data: referenceImage } });
    }
    parts.push({ text: `Original Prompt: ${originalPrompt}\n\nFeedback/Request: ${feedback}\n\nRefined Prompt:` });

    const response = await ai.models.generateContent({
        model: modelConfig.fast || 'gemini-3-flash-preview',
        contents: { parts },
        config: {
            systemInstruction: "You are an expert prompt engineer. Refine the prompt based on the user feedback or analysis. Output ONLY the refined prompt text."
        }
    });

    return response.text || originalPrompt;
};

export const detectLayout = async (image: string, mimeType: string = "image/jpeg"): Promise<LayoutElement[]> => {
     const ai = createGeminiClient();
     
     const prompt = `Analyze the layout of this image. Identify key elements (buttons, text blocks, images, navigation, hero sections, etc.).
     Return a JSON array of objects with the following schema:
     {
        "box_2d": [ymin, xmin, ymax, xmax],
        "label": "element name",
        "hierarchy": "Primary" | "Secondary" | "Tertiary"
     }
     Output ONLY valid JSON.`;

     const response = await ai.models.generateContent({
         model: modelConfig.reasoning || 'gemini-3-flash-preview',
         contents: {
             parts: [
                 { inlineData: { mimeType, data: image } },
                 { text: prompt }
             ]
         },
         config: {
             responseMimeType: "application/json"
         }
     });

     try {
         const text = response.text;
         if (!text) return [];
         const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
         return JSON.parse(jsonStr) as LayoutElement[];
     } catch (e) {
         console.error("Layout detection failed to parse JSON", e);
         return [];
     }
};

export const translatePrompt = async (text: string, targetLang: 'CN' | 'EN'): Promise<string> => {
    const ai = createGeminiClient();
    const prompt = targetLang === 'CN' 
        ? `Translate the following prompt to Chinese (Professional/Technical style): ${text}`
        : `Translate the following to English (Midjourney prompt style): ${text}`;
        
    const response = await ai.models.generateContent({
        model: modelConfig.fast || 'gemini-3-flash-preview',
        contents: { parts: [{ text: prompt }] }
    });
    
    return response.text || text;
};

export const executeSmartAnalysis = async (
    originalImage: string, 
    generatedImage: string, 
    prompt: string
): Promise<string> => {
    const ai = createGeminiClient();
    const instruction = `You are an AI assistant helping a user optimize their image generation workflow.
    The user has provided the original reference image, the generated image, and the prompt used.
    Analyze the difference and suggest what command the user should run next.
    Short, concise suggestion.`;
    
    const response = await ai.models.generateContent({
        model: modelConfig.fast || 'gemini-3-flash-preview',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: originalImage } },
                { inlineData: { mimeType: 'image/png', data: generatedImage } },
                { text: `Prompt used: ${prompt}` }
            ]
        },
        config: { systemInstruction: instruction }
    });

    return response.text || "Try refining the prompt.";
};
