import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash";

export async function expandShorthand(text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Expand this medical shorthand into clear, professional medical notes. Keep it concise.
Shorthand: ${text}
Expanded:`,
  });
  return response.text?.trim() || text;
}

export async function triage(symptoms: string, vitals: any): Promise<{ severity: string; reason: string }> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Triage this patient based on symptoms and vitals.
Symptoms: ${symptoms}
Vitals: ${JSON.stringify(vitals)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, description: "One of: LOW, MEDIUM, HIGH, CRITICAL" },
          reason: { type: Type.STRING, description: "Brief justification for the severity level" }
        },
        required: ["severity", "reason"]
      } as Schema
    }
  });

  if (response.text) {
    try {
      return JSON.parse(response.text);
    } catch (e) {
      // fallback
    }
  }
  return { severity: "MEDIUM", reason: "AI fallback" };
}

export async function differentialDiagnosis(symptoms: string, age: number, gender: string): Promise<string[]> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Provide a differential diagnosis for a ${age} year old ${gender} with the following symptoms: ${symptoms}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnoses: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["diagnoses"]
      } as Schema
    }
  });

  if (response.text) {
    try {
      return JSON.parse(response.text).diagnoses;
    } catch (e) {
      // fallback
    }
  }
  return ["Unable to generate diagnosis at this time."];
}

export async function checkDrugInteractions(medicines: string[]): Promise<{ warning: string }[]> {
  if (!medicines || medicines.length < 2) return [];

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Check for serious drug interactions between these medicines: ${medicines.join(", ")}. If there are no severe interactions, return an empty array. If there are severe/moderate interactions, describe them briefly.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          warnings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                warning: { type: Type.STRING }
              },
              required: ["warning"]
            }
          }
        },
        required: ["warnings"]
      } as Schema
    }
  });

  if (response.text) {
    try {
      return JSON.parse(response.text).warnings;
    } catch (e) {
      // fallback
    }
  }
  return [];
}
