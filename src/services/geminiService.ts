
import { GoogleGenAI, Type } from "@google/genai";
import { QuoteResult, Vehicle, MaintenancePrediction, FinancialReport } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Instructions updated to Spanish
const SYSTEM_INSTRUCTION = `Eres FleetTech AI, un experto en operaciones logísticas. 
Tu objetivo es optimizar el rendimiento de la flota, reducir costos y garantizar la seguridad.
Prioriza insights accionables basados en datos. Responde SIEMPRE en español.`;

// 🔒 RATE LIMITING & CACHE
// Previene abuso de API y reduce costos
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const requestQueue: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 5;
let cooldownUntil = 0;

const isAiAvailable = (): boolean => {
  if (!ai || !apiKey) return false;
  if (Date.now() < cooldownUntil) return false;
  return true;
};

const recordRateLimit = (): void => {
  // Cooldown defensivo: evita spamear el endpoint si el proveedor nos rate-limitea.
  cooldownUntil = Math.max(cooldownUntil, Date.now() + 60_000);
};

const isRateLimitError = (error: unknown): boolean => {
  const anyErr = error as any;
  const status = anyErr?.status ?? anyErr?.response?.status;
  if (status === 429) return true;

  const msg = String(anyErr?.message ?? '');
  return msg.includes('429') || msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('quota');
};

const checkRateLimit = (): boolean => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Limpiar requests antiguos
  while (requestQueue.length > 0 && requestQueue[0] < oneMinuteAgo) {
    requestQueue.shift();
  }
  
  if (requestQueue.length >= MAX_REQUESTS_PER_MINUTE) {
    console.warn('🚨 Gemini API rate limit alcanzado. Espera 1 minuto.');
    return false;
  }
  
  requestQueue.push(now);
  return true;
};

const getCachedResponse = (key: string): any | null => {
  const cached = responseCache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    responseCache.delete(key);
    return null;
  }
  
  return cached.data;
};

const setCachedResponse = (key: string, data: any): void => {
  responseCache.set(key, { data, timestamp: Date.now() });
};

export const generateSmartQuote = async (description: string, distance: string): Promise<QuoteResult> => {
  if (!apiKey || !ai) {
    return {
      estimatedPrice: "$0 - $0",
      vehicleType: "IA no configurada",
      timeEstimate: "N/A",
      logisticsAdvice: ["Configura VITE_GEMINI_API_KEY para habilitar IA."],
      confidenceScore: 0
    };
  }

  // 🔒 Verificar cache primero
  const cacheKey = `quote-${description}-${distance}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    console.log('✅ Respuesta desde cache');
    return cached;
  }
  
  // 🔒 Verificar rate limit / cooldown
  if (!isAiAvailable() || !checkRateLimit()) {
    return {
      estimatedPrice: "$0 - $0",
      vehicleType: "Rate limit excedido",
      timeEstimate: "N/A",
      logisticsAdvice: ["Demasiadas solicitudes. Intenta en 1 minuto."],
      confidenceScore: 0
    };
  }
  
  try {
    const model = "gemini-1.5-flash-001";
    
    const prompt = `
      Analiza esta solicitud de carga:
      Items/Descripción: ${description}
      Distancia Aproximada: ${distance}

      Proporciona una estimación estructurada en español.
      Para el precio, usa formato CLP (Pesos Chilenos) o USD si es internacional.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedPrice: { type: Type.STRING, description: "Rango de precio estimado (ej: $150.000 - $200.000 CLP)" },
            vehicleType: { type: Type.STRING, description: "Tipo de vehículo recomendado en español" },
            timeEstimate: { type: Type.STRING, description: "Duración estimada en español" },
            logisticsAdvice: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 puntos de consejo profesional en español para optimizar esta ruta"
            },
            confidenceScore: { type: Type.NUMBER, description: "Puntaje de confianza 0-100" }
          },
          required: ["estimatedPrice", "vehicleType", "timeEstimate", "logisticsAdvice", "confidenceScore"]
        }
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text) as QuoteResult;
      // 🔒 Guardar en cache
      setCachedResponse(cacheKey, result);
      return result;
    }
    throw new Error("No response text generated");

  } catch (error) {
    if (isRateLimitError(error)) {
      recordRateLimit();
    }
    console.error("Gemini Quote Error:", error);
    return {
      estimatedPrice: "$0 - $0",
      vehicleType: "Error",
      timeEstimate: "N/A",
      logisticsAdvice: [`Error: ${error instanceof Error ? error.message : String(error)}`],
      confidenceScore: 0
    };
  }
};

export const analyzeFleetHealth = async (vehicles: Vehicle[]): Promise<string> => {
  if (!apiKey || !ai) {
    return "IA no configurada (falta VITE_GEMINI_API_KEY).";
  }

  try {
    const vehicleSummary = vehicles.map(v => `${v.model} (${v.status}): ${v.mileage}km, Combustible: ${v.fuelLevel}%`).join('; ');
    const cacheKey = `fleet-health-${vehicleSummary}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached as string;

    if (!isAiAvailable() || !checkRateLimit()) {
      return "IA temporalmente limitada (rate limit).";
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-001",
      contents: `Analiza esta instantánea del estado de la flota: [${vehicleSummary}]. 
      Proporciona un resumen ejecutivo de 2 oraciones en español sobre la preparación operativa y una recomendación de mantenimiento específica.`,
      config: {
        systemInstruction: "Eres un asistente de gerente de flota. Sé conciso, profesional y responde en español."
      }
    });

    const text = response.text || "Análisis de flota no disponible.";
    setCachedResponse(cacheKey, text);
    return text;
  } catch (error) {
    if (isRateLimitError(error)) {
      recordRateLimit();
    }
    return "Sistemas de análisis AI fuera de línea.";
  }
};

export const analyzeRouteRisks = async (origin: string, destination: string): Promise<string> => {
  if (!apiKey || !ai) {
    return "IA no configurada (falta VITE_GEMINI_API_KEY).";
  }

  try {
    const cacheKey = `route-risk-${origin}-${destination}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached as string;

    if (!isAiAvailable() || !checkRateLimit()) {
      return "Análisis de ruta temporalmente limitado (rate limit).";
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-001",
      contents: `Analiza la ruta desde ${origin} hasta ${destination} para un vehículo de carga pesada en el sur de Chile. 
      Identifica riesgos potenciales como condiciones climáticas, patrones de tráfico o desafíos del terreno.
      Proporciona una evaluación de riesgo concisa de 1 oración en español.`,
    });

    const text = response.text || "Análisis de riesgo de ruta no disponible.";
    setCachedResponse(cacheKey, text);
    return text;
  } catch (error) {
    if (isRateLimitError(error)) {
      recordRateLimit();
    }
    console.error("Route Analysis Error:", error);
    return "Análisis de ruta temporalmente no disponible.";
  }
};

// NEW: Predictive Maintenance Logic
export const predictMaintenance = async (vehicle: Vehicle): Promise<MaintenancePrediction> => {
  if (!apiKey || !ai) {
    return {
      healthScore: 50,
      predictedFailure: "IA no configurada",
      urgency: "Medium",
      recommendedAction: "Configura VITE_GEMINI_API_KEY para habilitar IA",
      estimatedCost: "$0 CLP"
    };
  }

  try {
    const cacheKey = `predict-maintenance-${vehicle.id}-${vehicle.model}-${vehicle.mileage}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached as MaintenancePrediction;

    if (!isAiAvailable() || !checkRateLimit()) {
      return {
        healthScore: 50,
        predictedFailure: "Rate limit",
        urgency: "Medium",
        recommendedAction: "Espera un momento y vuelve a intentar",
        estimatedCost: "$0 CLP"
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-001",
      contents: `Realiza un diagnóstico predictivo para un ${vehicle.model} con ${vehicle.mileage}km. Último servicio fue hace 6 meses.
      Basado en patrones de desgaste estándar para este kilometraje, ¿qué es probable que falle pronto?`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.NUMBER, description: "Salud general del vehículo 0-100" },
            predictedFailure: { type: Type.STRING, description: "Componente con mayor riesgo de falla (ej: Frenos, Transmisión)" },
            urgency: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
            recommendedAction: { type: Type.STRING, description: "Acción recomendada breve" },
            estimatedCost: { type: Type.STRING, description: "Costo estimado en CLP" }
          },
          required: ["healthScore", "predictedFailure", "urgency", "recommendedAction", "estimatedCost"]
        }
      }
    });
    const parsed = JSON.parse(response.text!) as MaintenancePrediction;
    setCachedResponse(cacheKey, parsed);
    return parsed;
  } catch (error) {
    if (isRateLimitError(error)) {
      recordRateLimit();
    }
    console.error(error);
    return {
      healthScore: 50,
      predictedFailure: "Error en análisis",
      urgency: "Medium",
      recommendedAction: "Revisión manual requerida",
      estimatedCost: "$0 CLP"
    };
  }
};

// NEW: Financial Analysis Logic
export const analyzeFinancials = async (routesData: any[]): Promise<FinancialReport> => {
  if (!apiKey || !ai) {
    return {
      topDriver: "N/A",
      mostProfitableRoute: "N/A",
      costSavingOpportunity: "IA no configurada",
      efficiencyTrend: "Estable",
      netProfitMargin: "0%"
    };
  }

  try {
    const dataStr = JSON.stringify(routesData);

    const cacheKey = `financials-${dataStr}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached as FinancialReport;

    if (!isAiAvailable() || !checkRateLimit()) {
      return {
        topDriver: "N/A",
        mostProfitableRoute: "N/A",
        costSavingOpportunity: "IA temporalmente limitada (rate limit)",
        efficiencyTrend: "Estable",
        netProfitMargin: "0%"
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-001",
      contents: `Analiza estos datos financieros de rutas recientes: ${dataStr}. Identifica qué conductor y ruta generaron mejor margen.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                topDriver: { type: Type.STRING, description: "Nombre del conductor más rentable" },
                mostProfitableRoute: { type: Type.STRING, description: "Ruta con mejor margen" },
                costSavingOpportunity: { type: Type.STRING, description: "Dónde se puede ahorrar dinero" },
                efficiencyTrend: { type: Type.STRING, description: "Tendencia general (Positiva/Negativa)" },
                netProfitMargin: { type: Type.STRING, description: "Margen promedio %" }
            }
        }
      }
    });
    const parsed = JSON.parse(response.text!) as FinancialReport;
    setCachedResponse(cacheKey, parsed);
    return parsed;
  } catch (error) {
     if (isRateLimitError(error)) {
       recordRateLimit();
     }
     return {
         topDriver: "N/A",
         mostProfitableRoute: "N/A",
         costSavingOpportunity: "Datos insuficientes",
         efficiencyTrend: "Estable",
         netProfitMargin: "0%"
     };
  }
};
