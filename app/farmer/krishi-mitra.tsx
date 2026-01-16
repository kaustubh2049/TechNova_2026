import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  Send,
  MessageCircle,
  Lightbulb,
  Leaf,
  Droplets,
  Bug,
  Zap,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  sendMessageToAI,
  generateSuggestions,
  ChatMessage,
  AIResponse,
} from "@/services/aiAssistantService";

// Helper function to clean and format AI responses
const cleanAIResponse = (text: string): string => {
  // Remove system prompts, context, and formatting artifacts
  let cleaned = text
    .replace(/Context:\s*\n[\s\S]*?(?=\n\n|User Question:|$)/gi, "") // Remove context blocks
    .replace(/User Question:[\s\S]*?(?=\n\n|$)/gi, "") // Remove user question echoes
    .replace(/You are an? [^.]*?\./gi, "") // Remove "You are an expert..." prompts
    .replace(/As an? [^,]*?, /gi, "") // Remove "As an expert," beginnings
    .replace(/\*\*([^*]+)\*\*/g, "• $1") // Convert **bold** to bullet points
    .replace(/^\s*[\-•]\s*/gm, "• ") // Normalize bullet points
    .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
    .replace(/^[\s\n]+|[\s\n]+$/g, "") // Trim whitespace
    .replace(
      /\b(Here are some?|Here's what|Some suggestions?|You can try)([^:]*:)/gi,
      ""
    ) // Remove generic intros
    .replace(/^\s*•\s*$/gm, "") // Remove empty bullet points
    .trim();

  return cleaned;
};

// Extract actionable suggestions from response
const extractSuggestionsFromText = (text: string): string[] => {
  const suggestions: string[] = [];

  // Look for bullet points or numbered lists
  const bulletMatches = text.match(/•\s*([^\n•]+)/g);
  if (bulletMatches) {
    bulletMatches.slice(0, 3).forEach((match) => {
      const suggestion = match.replace(/^•\s*/, "").trim();
      if (suggestion.length > 10 && suggestion.length < 80) {
        suggestions.push(suggestion);
      }
    });
  }

  return suggestions;
};

const { width } = Dimensions.get("window");

export default function KrishiMitraScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "🌾 नमस्ते! Welcome to KrishiMitra\n\nI'm your AI farming assistant. I can help you with:\n\n• Crop care & disease management\n• Pest control strategies\n• Irrigation & water management\n• Soil health & fertilization\n• Weather-based farming tips\n\nHow can I assist you today?",
      sender: "assistant",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setSuggestions(generateSuggestions());
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: inputText,
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await sendMessageToAI(inputText);

      // Clean the AI response and extract suggestions
      const cleanedMessage = cleanAIResponse(response.message);
      const extractedSuggestions = extractSuggestionsFromText(cleanedMessage);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        text: cleanedMessage,
        sender: "assistant",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update suggestions - prefer extracted suggestions from response
      if (extractedSuggestions.length > 0) {
        setSuggestions(extractedSuggestions);
      } else if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "assistant",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* KrishiMitra Header */}
      <LinearGradient colors={["#1A73E8", "#1565D8"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Leaf size={28} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>KrishiMitra</Text>
            <Text style={styles.headerSubtitle}>
              Your AI Agricultural Guide
            </Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={40}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.sender === "user"
                  ? styles.userMessageWrapper
                  : styles.assistantMessageWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.sender === "user"
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === "user"
                      ? styles.userText
                      : styles.assistantText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1A73E8" />
              <Text style={styles.loadingText}>KrishiMitra is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Suggestions */}
        {suggestions.length > 0 && !loading && messages.length === 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
            style={styles.suggestionsContainer}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Lightbulb size={8} color="#1A73E8" />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask KrishiMitra anything..."
              placeholderTextColor="#64748b"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!loading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || loading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || loading}
            >
              <Send size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.characterCount}>{inputText.length}/500</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingBottom: 80, // Add space above bottom navbar
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 12,
  },
  messageWrapper: {
    marginVertical: 6,
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  userMessageWrapper: {
    justifyContent: "flex-end",
    marginLeft: 40,
  },
  assistantMessageWrapper: {
    justifyContent: "flex-start",
    marginRight: 20,
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginVertical: 2,
  },
  userBubble: {
    backgroundColor: "#1A73E8",
    borderBottomRightRadius: 6,
    shadowColor: "#1A73E8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  assistantBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#e8f4f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  userText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  assistantText: {
    color: "#2d3748",
    fontWeight: "400",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 14,
  },
  suggestionsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
    paddingVertical: 2,
    marginBottom: 5,
    maxHeight: 30,
  },
  suggestionsScroll: {
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7fafc",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginHorizontal: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  suggestionText: {
    fontSize: 9,
    color: "#1A73E8",
    fontWeight: "600",
    marginLeft: 2,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 20,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    fontSize: 14,
    color: "#1e293b",
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A73E8",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  characterCount: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
    textAlign: "right",
  },
});
