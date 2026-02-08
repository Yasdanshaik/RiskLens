
import { GoogleGenAI, Modality, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const SYSTEM_INSTRUCTION = `
You are RiskLens, a patient and expert financial mentor for first-time digital users, students, and low-income individuals.
Your goal is to:
1. Explain financial concepts (UPI, loans, insurance, credit scores) in simple, jargon-free language.
2. Provide reasoning for decisions (e.g., 'Why is this loan risky for you?').
3. Use analogies related to daily life.
4. Always highlight hidden costs and long-term consequences.
5. If using Google Search, provide up-to-date interest rates or policy changes.
6. Be empathetic and non-judgmental about the user's financial situation.
7. Use Markdown for formatting.
`;

export type ChatMode = 'fast' | 'search' | 'pro' | 'deep';

export async function chatWithMentor(message: string, mode: ChatMode = 'pro') {
  const ai = getGeminiClient();
  
  let modelName = 'gemini-3-pro-preview';
  let config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
  };

  switch (mode) {
    case 'fast':
      modelName = 'gemini-2.5-flash-lite-latest';
      break;
    case 'search':
      modelName = 'gemini-3-flash-preview';
      config.tools = [{ googleSearch: {} }];
      break;
    case 'deep':
      modelName = 'gemini-3-pro-preview';
      config.thinkingConfig = { thinkingBudget: 32768 };
      break;
    case 'pro':
    default:
      modelName = 'gemini-3-pro-preview';
      break;
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: message,
    config: config,
  });

  return response;
}

export async function analyzeScam(content: string, base64Image?: string) {
  const ai = getGeminiClient();
  
  const parts: any[] = [{ text: `Analyze this content for potential scams, fraud, or phishing: "${content}". 
    
    CRITICAL INSTRUCTIONS:
    Provide the response in this EXACT Markdown format with these headers:
    
    # RISK LEVEL: [DANGER | CAUTION | LIKELY SAFE]
    
    # TACTICS DETECTED:
    [List specific psychological triggers like 'False Urgency', 'Greed Appeal', or 'Fear Factor']
    
    # RED FLAGS:
    - [Specific technical or contextual indicators of fraud]
    
    # REASONING:
    [Explain WHY this is or is not a scam in simple terms for a first-time user. Focus on how it tries to manipulate them.]
    
    # NEXT STEPS:
    [Clear, actionable advice for the user to stay safe.]` }];

  if (base64Image) {
    parts.unshift({
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg"
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts },
    config: {
      systemInstruction: "You are a cyber-security and financial fraud expert. Your task is to identify scams and explain the psychological manipulation used (urgency, fear, etc.). Use your deep reasoning to uncover subtle patterns. Always cross-reference with Google Search for recent scam alerts.",
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response;
}

export async function analyzeTransaction(description: string) {
  const ai = getGeminiClient();
  
  const prompt = `Analyze this financial transaction description for potential fraud or safety risks: "${description}".
  
  Consider:
  - Is it a peer-to-peer payment for a business transaction?
  - Does it mention "Friends and Family" or unprotected methods?
  - Is it an "Advance Fee" situation?
  - Are there signs of a "Recovery Scam"?
  
  Format the output exactly like this:
  # RISK LEVEL: [HIGH | MEDIUM | LOW]
  # TRANSACTION SAFETY:
  [Summarize the safety of this transaction]
  # CONCERNS:
  - [List points of concern]
  # ADVICE:
  [Provide clear guidance on whether to proceed or how to protect themselves]`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a financial fraud investigator. You specialize in identifying transaction-level scams like marketplace fraud, investment scams, and fake refunds. Provide a detailed, reasoning-based safety check.",
      tools: [{ googleSearch: {} }]
    }
  });
  return response;
}

export async function analyzeFinancialDocument(base64Image: string, prompt: string) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: `${prompt}. Focus on identifying hidden fees, interest rates, and the 'fine print' that might harm a first-time user.` }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    }
  });
  return response.text;
}

export const audioUtils = {
  encode: (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },
  decode: (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  },
  decodeAudioData: async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
};