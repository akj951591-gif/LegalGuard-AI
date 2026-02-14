
import { GoogleGenAI, Type } from "@google/genai";
import { LegalAnalysis, CaseSubmission } from "../types";

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLegalProblem = async (submission: CaseSubmission): Promise<LegalAnalysis> => {
  // Use gemini-3-pro-preview for complex reasoning and structured JSON output.
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze the following legal problem and provide a structured response. 
    User Case Type: ${submission.type}
    Description: ${submission.description}
    Urgency: ${submission.urgency}
    
    The response must strictly follow the JSON structure provided in the schema. 
    Ensure the legal provisions mention specific relevant sections (like IPC/BNS or specific Acts). 
    Include immediate steps for protection and evidence gathering. 
    
    IMPORTANT: In the 'policeRights' section, YOU MUST ALWAYS INCLUDE AND EXPLAIN:
    1. Right to know the grounds of arrest immediately (Art 22(1)).
    2. The 24-hour rule: Production before a Magistrate within 24 hours (excluding travel time).
    3. Right to an Arrest Memo: It must be prepared, signed by at least one witness (family/neighbor), and counter-signed by the arrestee.
    4. Women's Protections: Specifically the law (Sec 46(4) CrPC / BNSS) stating no woman can be arrested after sunset and before sunrise, except in exceptional circumstances with a female officer and prior permission from a Judicial Magistrate.
    5. Right to consult a legal practitioner of choice.
    6. Protection against police harassment and custodial violence.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A brief summary of the legal situation." },
          immediateSteps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Step-by-step actions the user should take RIGHT NOW."
          },
          legalProvisions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                section: { type: Type.STRING, description: "The specific section/article number." },
                description: { type: Type.STRING, description: "Detailed description of the law." }
              },
              required: ["section", "description"]
            },
            description: "Relevant legal articles and sections."
          },
          keyPersonnel: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of officers or legal experts to contact."
          },
          documentChecklist: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of evidence/documents to prepare."
          },
          policeRights: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Rights against police harassment and custodial conditions."
          }
        },
        required: ["summary", "immediateSteps", "legalProvisions", "keyPersonnel", "documentChecklist", "policeRights"]
      }
    }
  });

  // response.text is a property, not a method.
  const jsonStr = response.text || "{}";
  return JSON.parse(jsonStr) as LegalAnalysis;
};

export const askLegalQuestion = async (question: string, history: { role: string, text: string }[]): Promise<string> => {
  const contents = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.text }]
  }));
  
  contents.push({ role: 'user', parts: [{ text: question }] });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents,
    config: {
      systemInstruction: "You are a specialized legal assistant focusing on Indian Law. Your goal is to provide helpful, conversational, and accurate legal information. Always emphasize that this is not official legal advice and recommend consulting a professional lawyer. Use bullet points for clarity when listing steps or laws.",
    }
  });

  return response.text || "I'm sorry, I couldn't process that request.";
};

export const lookupLegalSection = async (query: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide a detailed explanation of the legal section or term: "${query}". 
    Include:
    1. Full title of the section/article.
    2. Act it belongs to (e.g., IPC, BNS, Constitution).
    3. Simplified meaning.
    4. Punishments or penalties associated.
    5. Notable legal conditions or exceptions.
    Use Markdown formatting for readability.`,
    config: {
      systemInstruction: "You are a legal encyclopedia. Provide concise, accurate, and structured information about legal codes and sections.",
    }
  });

  return response.text || "No information found for this section.";
};

export const findNearbyPoliceStations = async (latitude: number, longitude: number) => {
  // Maps grounding is only supported in Gemini 2.5 series models.
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Find the 5 closest police stations to my current location. For each, provide the name, address, and if available, the contact phone number and email ID. Explain that these are locations where an FIR can be filed (mention Zero FIR). List them clearly in Markdown format.",
    config: {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude,
            longitude
          }
        }
      }
    },
  });

  return {
    text: response.text || "I couldn't find any police stations nearby.",
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
