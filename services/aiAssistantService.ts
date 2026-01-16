// AI Agricultural Assistant Service
// Uses OpenAI API for intelligent farming guidance

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Rate limiting to prevent 429 errors
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 30000; // 30 seconds between requests for free tier

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: number;
  type?: "text" | "suggestion";
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  confidence?: number;
}

/**
 * Send a message to the AI Agricultural Assistant
 * @param message - User's question or query
 * @param context - Optional context about the farm/crop
 * @returns AI response with suggestions
 */
export const sendMessageToAI = async (
  message: string,
  context?: {
    cropType?: string;
    region?: string;
    season?: string;
    soilType?: string;
  }
): Promise<AIResponse> => {
  try {
    console.log("🤖 Sending message to AI Assistant...");

    // Check if API key is properly configured
    if (!OPENAI_API_KEY || OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
      console.warn("⚠️ OpenAI API key not configured, using fallback response");
      return getFallbackResponse(message);
    }

    // For demo purposes, use fallback responses to avoid rate limits
    console.log("🤖 Using smart fallback responses to avoid rate limits");
    return getFallbackResponse(message);
    const currentTime = Date.now();
    const timeSinceLastRequest = currentTime - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(
        `⏱️ Rate limiting: waiting ${waitTime}ms before next request`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    lastRequestTime = Date.now();

    const systemPrompt = `You are KrishiMitra, an expert agricultural assistant for Indian farmers. Provide clear, practical farming advice.

IMPORTANT GUIDELINES:
- Give direct, actionable answers only
- Use bullet points for multiple suggestions  
- Keep responses under 200 words
- Focus on immediate, practical solutions
- No introductory phrases or context repetition
- Format suggestions as: • [specific action]`;

    const userPrompt = context
      ? `Farm Context: ${context.cropType || ""} ${context.season || ""} ${
          context.region || ""
        }
      
Question: ${message}`
      : message;

    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
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
      console.error(
        `❌ OpenAI API error: ${response.status} ${response.statusText}`
      );
      if (response.status === 401) {
        console.error("❌ API key is invalid or unauthorized");
      } else if (response.status === 429) {
        console.error("❌ API rate limit exceeded - too many requests");
        // Return a specific rate limit message
        return {
          message:
            "🚦 **OpenAI Free Tier Rate Limit**\n\nYou've reached the free tier limit (3 requests/minute). Try these instead:\n\n• Wait 1-2 minutes before asking again\n• Use shorter, specific questions\n• Consider upgrading to OpenAI Plus for higher limits\n\nHere's some general farming advice:",
          suggestions: [
            "Water early morning or evening",
            "Check soil moisture before watering",
            "Remove diseased plant parts",
            "Use neem oil for pest control",
          ],
          confidence: 70,
        };
      }
      return getFallbackResponse(message);
    }

    const data = await response.json();
    console.log("📡 AI response received");

    const responseText = data.choices?.[0]?.message?.content || "";

    if (!responseText) {
      throw new Error("No response from AI");
    }

    console.log("✅ AI response processed");

    // Extract suggestions if present
    const suggestions = extractSuggestions(responseText);

    return {
      message: responseText,
      suggestions,
      confidence: 85,
    };
  } catch (error) {
    console.error("❌ AI Assistant error:", error);
    return getFallbackResponse(message);
  }
};

/**
 * Get quick farming tips based on season and crop
 */
export const getSeasonalTips = async (
  cropType: string,
  season: string
): Promise<string[]> => {
  try {
    console.log(`🌾 Getting seasonal tips for ${cropType} in ${season}...`);

    const prompt = `As an agricultural expert, provide 5 specific, actionable tips for growing ${cropType} during ${season} season in India. 
Format as a numbered list with brief, practical advice.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return parseNumberedList(responseText);
  } catch (error) {
    console.error("❌ Failed to get seasonal tips:", error);
    return getDefaultTips(cropType, season);
  }
};

/**
 * Get pest management advice
 */
export const getPestAdvice = async (
  pestName: string,
  cropType: string
): Promise<string> => {
  try {
    console.log(`🐛 Getting pest management advice for ${pestName}...`);

    const prompt = `As a pest management expert, provide practical advice for controlling ${pestName} on ${cropType} crops in India.
Include:
1. Identification signs
2. Prevention methods
3. Organic control methods
4. Chemical options (if needed)
5. When to seek professional help

Keep it concise and actionable.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Unable to fetch pest advice"
    );
  } catch (error) {
    console.error("❌ Failed to get pest advice:", error);
    return "Please consult a local agricultural expert for pest management.";
  }
};

/**
 * Get irrigation recommendations
 */
export const getIrrigationAdvice = async (
  cropType: string,
  soilType: string,
  season: string
): Promise<string> => {
  try {
    console.log(`💧 Getting irrigation advice...`);

    const prompt = `As an irrigation expert, provide specific irrigation recommendations for:
- Crop: ${cropType}
- Soil Type: ${soilType}
- Season: ${season}

Include:
1. Optimal watering frequency
2. Water quantity per irrigation
3. Best time of day to irrigate
4. Signs of over/under watering
5. Water conservation tips

Keep it practical and region-specific for India.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Unable to fetch irrigation advice"
    );
  } catch (error) {
    console.error("❌ Failed to get irrigation advice:", error);
    return "Please consult local water management resources for irrigation guidance.";
  }
};

/**
 * Extract suggestions from response text
 */
const extractSuggestions = (text: string): string[] => {
  const suggestions: string[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    // Look for numbered items or bullet points
    if (/^[\d\-•*]\s/.test(line.trim())) {
      const suggestion = line.replace(/^[\d\-•*]\s*\.?\s*/, "").trim();
      if (suggestion.length > 0 && suggestion.length < 200) {
        suggestions.push(suggestion);
      }
    }
  }

  return suggestions.slice(0, 3); // Return max 3 suggestions
};

/**
 * Parse numbered list from response
 */
const parseNumberedList = (text: string): string[] => {
  const items: string[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    if (/^\d+[\.\)]\s/.test(line.trim())) {
      const item = line.replace(/^\d+[\.\)]\s*/, "").trim();
      if (item.length > 0) {
        items.push(item);
      }
    }
  }

  return items;
};

/**
 * Default tips if API fails
 */
const getDefaultTips = (cropType: string, season: string): string[] => {
  return [
    `Prepare soil with adequate organic matter before ${season} planting`,
    `Monitor weather patterns and adjust irrigation accordingly`,
    `Use quality seeds suited for ${season} conditions`,
    `Implement crop rotation to maintain soil health`,
    `Regular pest and disease monitoring is essential`,
  ];
};

/**
 * Generate conversation suggestions based on context
 */
export const generateSuggestions = (context?: {
  cropType?: string;
  hasIssue?: boolean;
}): string[] => {
  const baseSuggestions = [
    "What's the best irrigation schedule?",
    "How to prevent common pests?",
    "Soil health tips",
    "Fertilizer recommendations",
    "Weather-based farming advice",
  ];

  if (context?.cropType) {
    return [
      `Best practices for ${context.cropType}`,
      `${context.cropType} pest management`,
      `Seasonal care for ${context.cropType}`,
      ...baseSuggestions,
    ];
  }

  if (context?.hasIssue) {
    return [
      "Identify plant disease",
      "Pest control methods",
      "Soil problem solutions",
      "Water management help",
      ...baseSuggestions,
    ];
  }

  return baseSuggestions;
};

/**
 * Fallback response when Gemini API is not available
 */
const getFallbackResponse = (message: string): AIResponse => {
  const lowerMessage = message.toLowerCase();

  // Common agricultural questions and responses
  if (
    lowerMessage.includes("pest") ||
    lowerMessage.includes("insect") ||
    lowerMessage.includes("bug")
  ) {
    return {
      message:
        "🐛 For pest management:\n\n• Use neem oil spray (organic solution)\n• Check plants regularly for early detection\n• Maintain crop rotation to break pest cycles\n• Consider beneficial insects like ladybugs\n• Apply organic pesticides in the evening\n\nConsult your local agricultural officer for specific pesticide recommendations.",
      suggestions: [
        "How to make neem oil spray?",
        "Best time to spray pesticides",
        "Organic pest control methods",
      ],
      confidence: 75,
    };
  }

  if (lowerMessage.includes("irrigation") || lowerMessage.includes("water")) {
    return {
      message:
        "💧 Irrigation best practices:\n\n• Water early morning (6-8 AM) to reduce evaporation\n• Use drip irrigation for water efficiency\n• Check soil moisture before watering\n• Mulch around plants to retain moisture\n• Water deeply but less frequently\n\nAdjust watering based on crop type and season.",
      suggestions: [
        "How to check soil moisture?",
        "Drip irrigation setup",
        "Water requirements for different crops",
      ],
      confidence: 75,
    };
  }

  if (
    lowerMessage.includes("soil") ||
    lowerMessage.includes("fertilizer") ||
    lowerMessage.includes("nutrient")
  ) {
    return {
      message:
        "🌱 Soil health tips:\n\n• Test soil pH regularly (6.0-7.0 is ideal for most crops)\n• Add organic compost to improve soil structure\n• Rotate crops to maintain soil nutrients\n• Use balanced NPK fertilizers based on soil test\n• Avoid over-fertilization which can harm crops\n\nGet soil testing done at your local agricultural lab.",
      suggestions: [
        "How to make compost?",
        "Soil pH testing methods",
        "NPK fertilizer application",
      ],
      confidence: 75,
    };
  }

  if (
    lowerMessage.includes("crop") ||
    lowerMessage.includes("seed") ||
    lowerMessage.includes("plant")
  ) {
    return {
      message:
        "🌾 Crop management advice:\n\n• Choose varieties suitable for your region and season\n• Follow recommended spacing between plants\n• Monitor weather conditions for planting time\n• Use quality certified seeds from reliable sources\n• Practice crop rotation for better soil health\n\nConsult local agricultural extension officer for region-specific advice.",
      suggestions: [
        "Best crops for current season",
        "Seed treatment methods",
        "Crop spacing guidelines",
      ],
      confidence: 75,
    };
  }

  if (
    lowerMessage.includes("weather") ||
    lowerMessage.includes("rain") ||
    lowerMessage.includes("temperature")
  ) {
    return {
      message:
        "🌤️ Weather-related farming tips:\n\n• Check weather forecast regularly for planning\n• Protect crops during extreme weather events\n• Adjust irrigation based on rainfall predictions\n• Use shade nets during hot weather\n• Harvest before heavy rains if crops are ready\n\nUse weather apps and listen to agricultural weather bulletins.",
      suggestions: [
        "Weather protection methods",
        "Best weather apps for farmers",
        "Monsoon preparation tips",
      ],
      confidence: 75,
    };
  }

  // General farming advice
  return {
    message:
      "🙏 नमस्ते! I'm here to help with farming questions.\n\nI can provide guidance on:\n• Pest and disease management\n• Irrigation and water management\n• Soil health and fertilizers\n• Crop selection and planning\n• Weather-related farming advice\n\nNote: AI service is temporarily unavailable. Please ask specific questions for detailed guidance.",
    suggestions: [
      "Pest control methods",
      "Irrigation tips",
      "Soil testing",
      "Crop recommendations",
    ],
    confidence: 80,
  };
};
