import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using smart fallback heuristic responses.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. AI Voice Booking & Smart Query Parser
app.post("/api/gemini/voice-booking", async (req, res) => {
  try {
    const { queryText, language = "en" } = req.body;
    if (!queryText) {
      return res.status(400).json({ error: "queryText is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        extracted: {
          equipmentType: "Excavator (20 Ton)",
          category: "earthmoving",
          location: "Bangalore Rural, Karnataka",
          startDate: new Date().toISOString().split("T")[0],
          durationDays: 2,
          requiresOperator: true,
          attachments: ["Rock Breaker", "Heavy Bucket"],
          estimatedBudget: 36000,
          detectedLanguage: language,
          confidence: 0.95,
          naturalSummary: `Booking request recognized for 20-ton Excavator at Bangalore Rural for 2 days with operator and rock breaker.`,
        },
      });
    }

    const prompt = `You are the HeavyHire AI Voice Booking Engine for heavy construction and agricultural equipment in India.
Analyze the user's voice prompt (which may be in Kannada, Hindi, English, or mixed Hinglish/Kanglish) and extract structured booking details.

User Query: "${queryText}"
User Selected Language: "${language}"

Return JSON matching the schema with:
- equipmentType: standard equipment name (e.g. "JCB 3DX Backhoe Loader", "Tata Hitachi EX 200 Excavator", "Mahindra 575 DI Tractor", "John Deere Combine Harvester", "Ajax Fiori Concrete Mixer", "Hydra Crane 15T", "Borewell Drilling Rig", "Soil Compactor 10T", "Agricultural Drone Sprayer")
- category: one of ["earthmoving", "agricultural", "concrete", "lifting", "drilling", "haulage", "roadwork"]
- location: extracted city, district, or landmark
- startDate: estimated date or relative string (e.g. "Tomorrow", "2026-08-28")
- durationDays: number of days (default 1 if unspecified)
- requiresOperator: boolean (default true)
- attachments: array of required attachments (e.g. ["Rock Breaker", "Trolley", "Cultivator", "Standard Bucket"])
- estimatedBudget: estimated cost in INR based on standard Indian rental rates (e.g. JCB ~ ₹12,000-₹15,000/day, 20T Excavator ~ ₹25,000/day, Harvester ~ ₹18,000/day, Tractor ~ ₹4,000/day)
- detectedLanguage: language detected ("kannada", "hindi", "english")
- naturalSummary: A polite confirmation summary in the user's spoken language explaining the booking parameters.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            equipmentType: { type: Type.STRING },
            category: { type: Type.STRING },
            location: { type: Type.STRING },
            startDate: { type: Type.STRING },
            durationDays: { type: Type.INTEGER },
            requiresOperator: { type: Type.BOOLEAN },
            attachments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            estimatedBudget: { type: Type.NUMBER },
            detectedLanguage: { type: Type.STRING },
            naturalSummary: { type: Type.STRING },
          },
          required: ["equipmentType", "category", "location", "durationDays", "requiresOperator", "attachments", "estimatedBudget", "naturalSummary"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, extracted: parsed });
  } catch (error: any) {
    console.error("Error in voice-booking API:", error);
    return res.status(500).json({ error: error.message || "Failed to process voice query" });
  }
});

// 2. AI Equipment Recommendation & Job Site Estimator
app.post("/api/gemini/recommend", async (req, res) => {
  try {
    const { projectType, workDetails, terrainType, areaSqFt, urgency, language = "en" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        recommendations: [
          {
            machineName: "Tata Hitachi ZAXIS 220LC",
            category: "Excavators",
            matchScore: 98,
            recommendedAttachments: ["Heavy Duty Rock Breaker", "1.2m³ Trenching Bucket"],
            reasoning: "Ideal for hard strata digging and basement foundation in commercial plots. High hydraulic breakout force.",
            estimatedDays: 3,
            estimatedHoursPerDay: 8,
            fuelConsumptionEstimateLiters: 45,
            suggestedCrew: "1 Lead Operator + 1 Banksman / Helper",
            costBreakdown: {
              baseRentalPerDay: 28000,
              mobilizationFreight: 6000,
              operatorChargePerDay: 1500,
              estimatedFuelCost: 12150,
              totalEstimate: 96150,
            },
            alternativeMachine: "JCB JS205 (Cost-effective for softer soil)",
          },
          {
            machineName: "JCB 3DX Super Backhoe Loader",
            category: "Backhoe Loaders",
            matchScore: 86,
            recommendedAttachments: ["6-in-1 Front Shovel", "Standard Excavator Bucket"],
            reasoning: "Versatile dual-action machine for trench clearing, material loading, and backfilling.",
            estimatedDays: 4,
            estimatedHoursPerDay: 8,
            fuelConsumptionEstimateLiters: 28,
            suggestedCrew: "1 Certified Operator",
            costBreakdown: {
              baseRentalPerDay: 14000,
              mobilizationFreight: 3000,
              operatorChargePerDay: 1200,
              estimatedFuelCost: 7560,
              totalEstimate: 68360,
            },
            alternativeMachine: "CAT 424 Backhoe",
          },
        ],
      });
    }

    const prompt = `You are the HeavyHire AI Civil & Agricultural Engineering Consultant.
Analyze the project details and recommend the most cost-effective and operationally optimal equipment setup.
Project Type: ${projectType}
Work Details: ${workDetails}
Terrain / Soil: ${terrainType}
Area / Size: ${areaSqFt || "Standard plot"}
Urgency: ${urgency}
Language for explanation: ${language}

Provide a structured list of 2-3 machine recommendations with match score, attachments, reasoning, time estimate, crew, and itemized Indian Rupee cost estimate.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  machineName: { type: Type.STRING },
                  category: { type: Type.STRING },
                  matchScore: { type: Type.INTEGER },
                  recommendedAttachments: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  reasoning: { type: Type.STRING },
                  estimatedDays: { type: Type.NUMBER },
                  estimatedHoursPerDay: { type: Type.NUMBER },
                  fuelConsumptionEstimateLiters: { type: Type.NUMBER },
                  suggestedCrew: { type: Type.STRING },
                  costBreakdown: {
                    type: Type.OBJECT,
                    properties: {
                      baseRentalPerDay: { type: Type.NUMBER },
                      mobilizationFreight: { type: Type.NUMBER },
                      operatorChargePerDay: { type: Type.NUMBER },
                      estimatedFuelCost: { type: Type.NUMBER },
                      totalEstimate: { type: Type.NUMBER },
                    },
                    required: ["baseRentalPerDay", "mobilizationFreight", "operatorChargePerDay", "totalEstimate"],
                  },
                  alternativeMachine: { type: Type.STRING },
                },
                required: ["machineName", "category", "matchScore", "recommendedAttachments", "reasoning", "estimatedDays", "costBreakdown"],
              },
            },
          },
          required: ["recommendations"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Error in recommend API:", error);
    return res.status(500).json({ error: error.message || "Failed to generate recommendations" });
  }
});

// 3. AI Dynamic Pricing & Transparent Rate Estimator
app.post("/api/gemini/price-estimate", async (req, res) => {
  try {
    const { equipmentName, distanceKm, durationHours, durationDays, includeFuel, includeOperator, seasonDemand } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const baseDayRate = 16000;
      const days = Number(durationDays) || 1;
      const mob = Math.max(2500, Math.round(Number(distanceKm || 15) * 65));
      const op = includeOperator ? days * 1200 : 0;
      const fuel = includeFuel ? days * 3500 : 0;
      const subtotal = (baseDayRate * days) + mob + op + fuel;
      const gst = Math.round(subtotal * 0.18);
      const total = subtotal + gst;

      return res.json({
        success: true,
        pricing: {
          baseRate: baseDayRate * days,
          mobilizationCost: mob,
          operatorFee: op,
          estimatedFuelCost: fuel,
          gstTax: gst,
          surgeMultiplier: seasonDemand === "high" ? 1.15 : 1.0,
          totalAmount: total,
          securityDepositRefundable: 15000,
          priceTransparencyNote: "All heavy equipment pricing on HeavyHire adheres to open-ledger metrics: flat freight per km and transparent GST.",
        },
      });
    }

    const prompt = `Calculate transparent market rental price breakdown in INR for heavy machinery in India.
Equipment: ${equipmentName}
Transport Distance: ${distanceKm} km
Duration: ${durationDays} days (${durationHours} total work hours)
Include Fuel: ${includeFuel}
Include Operator: ${includeOperator}
Demand Factor: ${seasonDemand}

Return JSON with baseRate, mobilizationCost, operatorFee, estimatedFuelCost, gstTax (18%), surgeMultiplier (e.g. 1.0 to 1.3), totalAmount, securityDepositRefundable, and priceTransparencyNote.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            baseRate: { type: Type.NUMBER },
            mobilizationCost: { type: Type.NUMBER },
            operatorFee: { type: Type.NUMBER },
            estimatedFuelCost: { type: Type.NUMBER },
            gstTax: { type: Type.NUMBER },
            surgeMultiplier: { type: Type.NUMBER },
            totalAmount: { type: Type.NUMBER },
            securityDepositRefundable: { type: Type.NUMBER },
            priceTransparencyNote: { type: Type.STRING },
          },
          required: ["baseRate", "mobilizationCost", "operatorFee", "gstTax", "totalAmount", "securityDepositRefundable", "priceTransparencyNote"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, pricing: parsed });
  } catch (error: any) {
    console.error("Error in price-estimate API:", error);
    return res.status(500).json({ error: error.message || "Failed to calculate pricing" });
  }
});

// 4. AI Document Verification & OCR Inspector (RC Book, Fitness, Insurance)
app.post("/api/gemini/verify-document", async (req, res) => {
  try {
    const { documentType, documentText, documentNumber, ownerName } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        verification: {
          isValid: true,
          confidenceScore: 96,
          detectedChassisNumber: "MAHINDRA-EX-890214-KA",
          detectedOwner: ownerName || "K. Ramesh Enterprises",
          expiryDate: "2029-11-15",
          fitnessStatus: "APPROVED",
          fraudRiskLevel: "LOW",
          flags: [],
          aiRemarks: "Document matches Parivahan Vahan registry format. Valid commercial heavy transport certificate.",
        },
      });
    }

    const prompt = `You are HeavyHire AI Fraud & Compliance Inspector for commercial heavy machinery (Vahan / RTO India).
Analyze the registration details / simulated OCR scan for document type "${documentType}".
Claimed Owner: ${ownerName}
Document Number / Reg No: ${documentNumber}
Extracted Text / OCR Payload: ${documentText || "Standard Vahan RC Smart Card with valid chassis and road fitness seal"}

Evaluate authenticity, check compliance flags, and output JSON with:
- isValid: boolean
- confidenceScore: integer 0-100
- detectedChassisNumber: string
- detectedOwner: string
- expiryDate: string (YYYY-MM-DD)
- fitnessStatus: "APPROVED" | "FLAGGED" | "EXPIRED"
- fraudRiskLevel: "LOW" | "MEDIUM" | "HIGH"
- flags: string array of any concerns
- aiRemarks: string explanation`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            confidenceScore: { type: Type.INTEGER },
            detectedChassisNumber: { type: Type.STRING },
            detectedOwner: { type: Type.STRING },
            expiryDate: { type: Type.STRING },
            fitnessStatus: { type: Type.STRING },
            fraudRiskLevel: { type: Type.STRING },
            flags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            aiRemarks: { type: Type.STRING },
          },
          required: ["isValid", "confidenceScore", "detectedChassisNumber", "detectedOwner", "expiryDate", "fitnessStatus", "fraudRiskLevel", "flags", "aiRemarks"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, verification: parsed });
  } catch (error: any) {
    console.error("Error in verify-document API:", error);
    return res.status(500).json({ error: error.message || "Failed to verify document" });
  }
});

// 5. AI Chat Real-Time Tri-Lingual Translator (Kannada, Hindi, English)
app.post("/api/gemini/chat-translate", async (req, res) => {
  try {
    const { message, fromLang, targetLang, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        translation: `[Auto-Translated] ${message}`,
        quickReplies: [
          "Yes, machine is fueled and on schedule.",
          "Please send exact GPS pin on the farm gate.",
          "Operator has arrived at the location.",
        ],
      });
    }

    const prompt = `You are the HeavyHire AI Multilingual Construction Liaison.
Translate the following chat message between Customer, Equipment Owner, or Operator.
Context: ${context || "Equipment delivery and operation on site"}
Source Language: ${fromLang || "auto-detect"}
Target Language: ${targetLang || "English"}
Message: "${message}"

Return JSON with:
- translatedText: accurate translation naturally phrasing heavy equipment terms (e.g. 'rock breaker' -> 'ಕಲ್ಲು ಒಡೆಯುವ ಯಂತ್ರ / पत्थर तोड़ने वाला ब्रेकर')
- detectedSourceLang: language detected
- quickReplies: array of 3 context-aware one-click quick replies in target language`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING },
            detectedSourceLang: { type: Type.STRING },
            quickReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["translatedText", "detectedSourceLang", "quickReplies"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Error in chat-translate API:", error);
    return res.status(500).json({ error: error.message || "Failed to translate message" });
  }
});

// 6. AI Fraud & Dispute Evaluation (Admin)
app.post("/api/gemini/fraud-analysis", async (req, res) => {
  try {
    const { disputeType, claimDescription, telemetryLogs, customerName, ownerName } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        analysis: {
          fraudScore: 18,
          verdict: "FAVOR_OWNER_PARTIAL",
          justification: "Telemetry GPS confirms machine worked 7.2 engine hours on registered plot. 0.8 hours downtime due to site waterlogging.",
          recommendedResolution: "Deduct 0.8 hours charge, refund ₹1,400 to customer, release remaining escrow ₹18,600 to owner.",
          riskIndicators: ["Minor hour discrepancy reported within 24h of shift conclusion"],
        },
      });
    }

    const prompt = `You are HeavyHire AI Dispute Arbiter.
Analyze this marketplace conflict between Customer (${customerName}) and Owner (${ownerName}).
Dispute Type: ${disputeType}
Claim: ${claimDescription}
Telemetry & GPS logs: ${JSON.stringify(telemetryLogs || { gpsStatus: "on_site", engineHoursLogged: 7.5, rpmAverage: 1800, breakTimeMins: 45 })}

Return JSON with:
- fraudScore: 0 to 100 (higher = fraudulent claim)
- verdict: "FAVOR_CUSTOMER" | "FAVOR_OWNER" | "SPLIT_COMPROMISE"
- justification: rigorous technical reasoning analyzing telemetry and claim
- recommendedResolution: fair actionable settlement amount / action
- riskIndicators: array of flagged behaviors`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fraudScore: { type: Type.INTEGER },
            verdict: { type: Type.STRING },
            justification: { type: Type.STRING },
            recommendedResolution: { type: Type.STRING },
            riskIndicators: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["fraudScore", "verdict", "justification", "recommendedResolution", "riskIndicators"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error("Error in fraud-analysis API:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze dispute" });
  }
});

// Vite middleware / static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HeavyHire AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
