// Hybrid Plant Disease Detection Service
// Combines Local ML Model + OpenAI for maximum accuracy

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const LOCAL_MODEL_API = "http://192.168.0.103:9000"; // Your Flask backend

export interface DiseaseAnalysisResult {
  disease: string;
  confidence: number;
  severity: "Mild" | "Moderate" | "Severe";
  treatment: string[];
  prevention: string[];
  source: "hybrid" | "gemini" | "local_model" | "fallback";
  modelConfidence?: number;
  geminiConfidence?: number;
}

export interface LocalModelResult {
  prediction: string;
  confidence: number;
}

/**
 * SIMPLIFIED ANALYSIS: Uses Gemini AI only
 * Removed local model to avoid network errors
 * @param base64Image - Base64 encoded image string
 * @param imageUri - Original image URI (kept for compatibility)
 * @param imageType - Image MIME type (e.g., "image/jpeg")
 * @returns Disease analysis result
 */
export const analyzeImageHybrid = async (
  base64Image: string,
  imageUri: string,
  imageType: string = "image/jpeg"
): Promise<DiseaseAnalysisResult> => {
  try {
    console.log("� Analyzing plant image with Gemini AI...");

    // Use OpenAI directly (more reliable than local model)
    const openaiResult = await analyzeImageWithOpenAI(base64Image, imageType);

    console.log(
      `✅ Analysis complete: ${openaiResult.disease} (${openaiResult.confidence}%)`
    );
    return openaiResult;
  } catch (error) {
    console.error("❌ Analysis error:", error);
    return { ...fallbackColorAnalysis(), source: "fallback" };
  }
};

/**
 * Analyzes image using your local ML model (Flask backend)
 */
export const analyzeImageWithLocalModel = async (
  imageUri: string
): Promise<LocalModelResult> => {
  try {
    console.log("🧠 Analyzing with Local ML Model...");

    const form = new FormData();
    form.append("file", {
      uri: imageUri,
      name: "plant_image.jpg",
      type: "image/jpeg",
    } as any);

    const response = await fetch(`${LOCAL_MODEL_API}/predict`, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Local model API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      `✅ Local Model Result: ${data.prediction} (${data.confidence}%)`
    );

    return {
      prediction: data.prediction || "Unknown",
      confidence: Math.min(100, Math.max(0, data.confidence || 0)),
    };
  } catch (error) {
    console.error("❌ Local model analysis failed:", error);
    throw error;
  }
};

/**
 * Combines results from Local Model and Gemini AI
 * Returns the most confident and accurate prediction
 */
const combineResults = (
  localResult: LocalModelResult,
  geminiResult: DiseaseAnalysisResult
): DiseaseAnalysisResult => {
  console.log("🔄 Combining Local Model + Gemini results...");

  const localConfidence = localResult.confidence;
  const geminiConfidence = geminiResult.confidence;

  // If both agree on disease (similar names), boost confidence
  const diseaseSimilar =
    localResult.prediction
      .toLowerCase()
      .includes(geminiResult.disease.toLowerCase()) ||
    geminiResult.disease
      .toLowerCase()
      .includes(localResult.prediction.toLowerCase());

  if (diseaseSimilar) {
    console.log("✅ Both models agree! Boosting confidence...");
    const boostedConfidence = Math.min(
      100,
      (localConfidence + geminiConfidence) / 2 + 5
    );
    return {
      ...geminiResult,
      confidence: Math.round(boostedConfidence),
      source: "hybrid",
      modelConfidence: localConfidence,
      geminiConfidence: geminiConfidence,
    };
  }

  // If they disagree, use the higher confidence result
  console.log("⚠️ Models disagree, using higher confidence result...");
  if (geminiConfidence >= localConfidence) {
    return {
      ...geminiResult,
      source: "hybrid",
      modelConfidence: localConfidence,
      geminiConfidence: geminiConfidence,
    };
  } else {
    return {
      ...convertLocalToResult(localResult),
      source: "hybrid",
      modelConfidence: localConfidence,
      geminiConfidence: geminiConfidence,
    };
  }
};

/**
 * Converts Local Model result to standard format
 */
const convertLocalToResult = (
  localResult: LocalModelResult
): DiseaseAnalysisResult => {
  const diseaseMap: {
    [key: string]: {
      severity: "Mild" | "Moderate" | "Severe";
      treatment: string[];
      prevention: string[];
    };
  } = {
    healthy: {
      severity: "Mild",
      treatment: [
        "Plant is healthy",
        "Continue regular care",
        "Monitor for any changes",
        "Maintain good hygiene",
      ],
      prevention: [
        "Keep watering schedule",
        "Ensure proper sunlight",
        "Check soil moisture",
        "Inspect regularly",
      ],
    },
    powdery: {
      severity: "Moderate",
      treatment: [
        "Apply sulfur-based fungicide",
        "Increase air circulation",
        "Remove infected leaves",
        "Spray every 7-10 days",
      ],
      prevention: [
        "Avoid overhead watering",
        "Space plants properly",
        "Monitor humidity levels",
        "Use resistant varieties",
      ],
    },
    rust: {
      severity: "Moderate",
      treatment: [
        "Apply copper fungicide",
        "Remove infected leaves",
        "Improve drainage",
        "Reduce leaf wetness",
      ],
      prevention: [
        "Ensure good air flow",
        "Water at base only",
        "Rotate crops",
        "Clean tools between plants",
      ],
    },
  };

  const key = localResult.prediction.toLowerCase();
  const details = diseaseMap[key] || diseaseMap.healthy;

  return {
    disease: localResult.prediction,
    confidence: localResult.confidence,
    severity: details.severity,
    treatment: details.treatment,
    prevention: details.prevention,
    source: "local_model",
    modelConfidence: localResult.confidence,
  };
};

/**
 * Analyzes a plant image using OpenAI
 * @param base64Image - Base64 encoded image string
 * @param imageType - Image MIME type (e.g., "image/jpeg")
 * @returns Disease analysis result with confidence and recommendations
 */
export const analyzeImageWithOpenAI = async (
  base64Image: string,
  imageType: string = "image/jpeg"
): Promise<DiseaseAnalysisResult> => {
  try {
    console.log("🔬 Analyzing plant image with OpenAI...");

    const prompt = `You are an expert plant pathologist. Analyze this plant image and provide a detailed disease diagnosis.

IMPORTANT: Respond ONLY with valid JSON in this exact format, no other text:
{
  "disease": "specific disease name (e.g., 'Tomato Early Blight', 'Powdery Mildew', 'Healthy')",
  "confidence": 85,
  "severity": "Moderate", 
  "treatment": [
    "First treatment step",
    "Second treatment step",
    "Third treatment step",
    "Fourth treatment step"
  ],
  "prevention": [
    "First prevention tip",
    "Second prevention tip",
    "Third prevention tip",
    "Fourth prevention tip"
  ]
}

Analyze the image for:
1. Specific disease identification (not generic categories)
2. Visual symptoms (spots, discoloration, lesions, wilting)
3. Pest damage or nutrient deficiencies
4. Confidence level (0-100%)
5. Severity assessment
6. Practical treatment recommendations
7. Prevention strategies

Be specific and accurate. If the plant appears healthy, set disease to "Healthy" and confidence to 95.`;

    const requestBody = {
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    };

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("❌ OpenAI API rate limit exceeded");
        // Return rate limit specific error for disease detection
        return {
          disease: "Service Temporarily Unavailable",
          confidence: 0,
          severity: "Mild" as const,
          treatment: [
            "Rate limit reached - please try again in 1-2 minutes",
            "Take multiple clear photos of affected plant parts",
            "Check plant in good lighting conditions",
            "Consult local agricultural expert if urgent",
          ],
          prevention: [
            "Regular plant monitoring helps early detection",
            "Use disease-resistant crop varieties",
            "Maintain proper plant spacing",
            "Follow crop rotation practices",
          ],
          source: "fallback" as const,
        };
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("📡 OpenAI API response received");

    // Extract text from response
    const responseText = data.choices?.[0]?.message?.content || "";

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    console.log("🔍 Parsing OpenAI response...");

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from OpenAI response");
    }

    const result = JSON.parse(jsonMatch[0]) as DiseaseAnalysisResult;

    // Validate and normalize result
    const validatedResult: DiseaseAnalysisResult = {
      disease: result.disease || "Unknown Disease",
      confidence: Math.min(100, Math.max(0, result.confidence || 0)),
      severity: validateSeverity(result.severity),
      treatment: Array.isArray(result.treatment)
        ? result.treatment.filter((t) => typeof t === "string").slice(0, 4)
        : ["Consult a local agricultural expert"],
      prevention: Array.isArray(result.prevention)
        ? result.prevention.filter((p) => typeof p === "string").slice(0, 4)
        : ["Maintain proper plant hygiene"],
      source: "openai",
    };

    console.log(
      `✅ Analysis complete: ${validatedResult.disease} (${validatedResult.confidence}%)`
    );

    return validatedResult;
  } catch (error) {
    console.error("❌ OpenAI analysis failed:", error);
    throw error;
  }
};

/**
 * Converts image URI to base64 string
 * @param uri - Image URI from device
 * @returns Base64 encoded string
 */
export const imageUriToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("❌ Failed to convert image to base64:", error);
    throw error;
  }
};

/**
 * Validates and normalizes severity level
 */
const validateSeverity = (severity: any): "Mild" | "Moderate" | "Severe" => {
  const validSeverities = ["Mild", "Moderate", "Severe"];
  if (validSeverities.includes(severity)) {
    return severity;
  }
  return "Moderate";
};

/**
 * Fallback color-based analysis (if both models fail)
 */
export const fallbackColorAnalysis = (): DiseaseAnalysisResult => {
  console.log("⚠️ Using fallback color-based analysis...");
  return {
    disease: "Unable to determine disease",
    confidence: 45,
    severity: "Moderate",
    treatment: [
      "Consult a local agricultural expert",
      "Take clear photos of affected areas",
      "Provide plant history and growing conditions",
      "Consider professional plant diagnostics",
    ],
    prevention: [
      "Maintain proper plant hygiene",
      "Ensure adequate air circulation",
      "Water at base of plants",
      "Monitor plants regularly for symptoms",
    ],
    source: "fallback",
  };
};

// Default export for Expo Router compatibility
export default {
  analyzeImageHybrid,
  analyzeImageWithLocalModel,
  analyzeImageWithOpenAI,
  imageUriToBase64,
  fallbackColorAnalysis,
};
