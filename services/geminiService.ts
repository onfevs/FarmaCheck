
import { GoogleGenAI, Type } from "@google/genai";
import { MedicineResult } from "../types";

interface CacheEntry {
  results: MedicineResult[];
  timestamp: number;
}

const MAX_CACHE_SIZE = 200;
const CACHE_TTL = 15 * 60 * 1000; 
const lruCache = new Map<string, CacheEntry>();

/**
 * Estrategia de invalidación activa:
 * Compara los resultados nuevos con los existentes. Si detecta discrepancias 
 * significativas de precio (>5%) o cambios en la disponibilidad, actualiza la entrada.
 */
const updateCacheEntryWithValidation = (key: string, newResults: MedicineResult[]) => {
  const existing = lruCache.get(key);
  let hasSignificantChange = false;

  if (existing) {
    hasSignificantChange = newResults.some(newRes => {
      const oldRes = existing.results.find(r => r.storeName === newRes.storeName && r.name === newRes.name);
      if (!oldRes) return true; // Nueva oferta detectada
      const diff = Math.abs(newRes.price - oldRes.price) / oldRes.price;
      return diff > 0.05; // Cambio de precio mayor al 5%
    });
  }

  // Si hay cambios significativos o es una entrada nueva, actualizamos el timestamp y los datos
  if (!existing || hasSignificantChange) {
    lruCache.delete(key);
    lruCache.set(key, { results: newResults, timestamp: Date.now() });
    if (hasSignificantChange) console.debug(`[FarmaCheck] Caché invalidada/actualizada por cambios en mercado para: ${key}`);
  } else {
    // Si no hay cambios, solo refrescamos la posición en LRU
    lruCache.delete(key);
    lruCache.set(key, existing);
  }

  if (lruCache.size > MAX_CACHE_SIZE) {
    const oldestKey = lruCache.keys().next().value;
    if (oldestKey !== undefined) lruCache.delete(oldestKey);
  }
};

/**
 * Fetch mediante IA con prompt ultra-específico para farmacias colombianas.
 */
export const fetchMedicinesFromAI = async (query: string): Promise<MedicineResult[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prompt refinado para asegurar Deep Linking y cobertura de las farmacias solicitadas
  const prompt = `PRODUCTO: "${query}" en Colombia (Prioridad Manizales y Nacional).
FARMACIAS OBLIGATORIAS: Condrogas, Droguería Alemana, Cruz Verde, Farmatodo, La Rebaja, Farmacenter, Farmacias Pasteur, Farmalisto.
FARMACIAS OPCIONALES: Colsubsidio, Multidrogas, Botica Natural.

REQUISITOS TÉCNICOS:
1. Generar entre 12 y 15 resultados reales y diversos.
2. Las URLs DEBEN ser enlaces DIRECTOS a la ficha del producto (Deep Links). NO enviar a homepages ni a buscadores internos.
3. El precio debe ser el valor actual en Pesos Colombianos (COP).
4. El nombre debe incluir la marca o genérico y su concentración.

FORMATO DE RESPUESTA: JSON Array.
ESQUEMA: [{name, presentation, price, storeName, url}]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              presentation: { type: Type.STRING },
              price: { type: Type.NUMBER },
              storeName: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["name", "presentation", "price", "storeName", "url"]
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    return parsed.map((r: any, index: number) => ({
      ...r,
      id: `fc-${Date.now()}-${index}`,
      currency: 'COP'
    }));
  } catch (error) {
    console.error("AI Fetch Error:", error);
    return [];
  }
};

export const searchMedicines = async (query: string, forceRefresh = false): Promise<MedicineResult[]> => {
  const key = query.toLowerCase().trim();
  const now = Date.now();
  
  if (!forceRefresh) {
    const cached = lruCache.get(key);
    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      return cached.results;
    }
  }

  const results = await fetchMedicinesFromAI(query);
  if (results.length > 0) {
    updateCacheEntryWithValidation(key, results);
  }
  return results;
};

export const chatWithPharmacist = async (message: string, history: {role: string, content: string}[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })), { role: 'user', parts: [{ text: message }] }],
      config: { 
        systemInstruction: "Eres el experto farmacéutico de FarmaCheck. Brinda consejos breves sobre medicamentos, dosis comunes y comparativas de ahorro. Siempre aclara que no reemplazas a un médico." 
      }
    });
    return response.text || "";
  } catch {
    return "Lo siento, el servicio de asesoría está saturado en este momento.";
  }
};
