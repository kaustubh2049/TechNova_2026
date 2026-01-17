import { useStations } from "@/providers/stations-provider";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertTriangle,
  Bot,
  Droplets,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotScreen() {
  const { getAnalytics } = useStations();
  const analytics = useMemo(() => getAnalytics(), [getAnalytics]);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "assistant",
      content:
        "Hi! 👋 I'm your AI groundwater assistant. I can help you understand water levels, analyze trends, and provide insights about groundwater conditions. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const suggestions = [
    { text: "What is the average water level?", icon: Droplets },
    { text: "Show me recharge trends", icon: TrendingUp },
    { text: "Which regions are critical?", icon: AlertTriangle },
    { text: "Give me a summary", icon: Sparkles },
  ];

  const answer = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes("average") && (q.includes("level") || q.includes("water"))) {
      return `Current average water level across stations is ${analytics.avgWaterLevel.toFixed(1)} m.`;
    }
    if (q.includes("recharge")) {
      return `There are ${analytics.rechargeEvents} recharge events counted across the network.`;
    }
    if (q.includes("critical")) {
      return `${analytics.criticalStations} stations are in critical status right now.`;
    }
    if (q.includes("regions") || q.includes("state")) {
      const top = analytics.regionalData
        .map((r) => `${r.state}: ${r.avgLevel.toFixed(1)}m (${r.status})`)
        .join("; ");
      return `Regional overview — ${top}.`;
    }
    return "I can answer about average water levels, recharge events, critical stations, and regional summaries. Try asking: 'What is the average water level?'";
  };

  const callModel = async (history: Message[]): Promise<string> => {
    const endpoint = "https://openrouter.ai/api/v1/chat/completions";
    const apiKey =
      "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";
    const model = "deepseek/deepseek-chat-v3.1:free";

    const system = `You are an assistant focused on groundwater, water resources, and sustainability. Answer concisely and helpfully.
Context (analytics summary): avgWaterLevel=${analytics.avgWaterLevel.toFixed(1)} m, rechargeEvents=${analytics.rechargeEvents}, criticalStations=${analytics.criticalStations}. Regions: ${analytics.regionalData.map((r) => r.state + ":" + r.avgLevel.toFixed(1) + "m(" + r.status + ")").join(", ")}.`;

    const orMessages = [
      { role: "system", content: system },
      ...history.map((m) => ({ role: m.role, content: m.content }) as any),
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Title": "SIH Groundwater Assistant",
      },
      body: JSON.stringify({
        model,
        messages: orMessages,
        temperature: 0.3,
        max_tokens: 512,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`OpenRouter error ${res.status}: ${text}`);
    }
    const json = await res.json().catch(async () => {
      const text = await res.text();
      throw new Error(`Invalid JSON: ${text?.slice(0, 200)}`);
    });
    const content: string | undefined = json?.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content");
    return content.trim();
  };

  const callModelWithRetry = async (history: Message[]): Promise<string> => {
    try {
      return await callModel(history);
    } catch (e1) {
      await new Promise((r) => setTimeout(r, 800));
      try {
        return await callModel(history);
      } catch (e2) {
        throw e2;
      }
    }
  };

  const onSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsSending(true);
    try {
      setLastError(null);
      const history = [...messages, userMsg].slice(-10);
      const modelReply = await callModelWithRetry(history);
      const reply: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: modelReply,
      };
      setMessages((prev) => [...prev, reply]);
    } catch (e) {
      const errMsg = (e as any)?.message
        ? String((e as any).message)
        : "Unknown error";
      setLastError(errMsg);
      const fallbackText = `${answer(text)}\n\n(Note: Live AI reply unavailable. Error: ${errMsg})`;
      const fallback: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: fallbackText,
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 0,
        }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Bot size={32} color="#ffffff" strokeWidth={2} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>AI Water Assistant</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.headerSubtitle}>
                  Online • Ready to help
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsRow}
          >
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setInput(s.text)}
                style={styles.suggestionChip}
                activeOpacity={0.7}
              >
                <s.icon size={14} color="#3b82f6" strokeWidth={2.5} />
                <Text style={styles.suggestionText}>{s.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>

        {/* Messages Area with Gradient Background */}
        <LinearGradient
          colors={["#f8fafc", "#e0f2fe"]}
          style={styles.chatContainer}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.chat}
            contentContainerStyle={{
              paddingVertical: 16,
              paddingHorizontal: 16,
            }}
          >
            {lastError && (
              <Animated.View
                style={[styles.errorBanner, { opacity: fadeAnim }]}
              >
                <AlertTriangle size={16} color="#991b1b" />
                <Text style={styles.errorText}>{lastError}</Text>
              </Animated.View>
            )}

            {messages.map((m, index) => (
              <Animated.View
                key={m.id}
                style={[
                  styles.row,
                  m.role === "user"
                    ? { justifyContent: "flex-end" }
                    : { justifyContent: "flex-start" },
                  { opacity: fadeAnim },
                ]}
              >
                {m.role === "assistant" && (
                  <View style={styles.avatarBot}>
                    <Bot size={14} color="#3b82f6" strokeWidth={2.5} />
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    m.role === "user"
                      ? styles.bubbleUser
                      : styles.bubbleAssistant,
                  ]}
                >
                  <Text
                    style={
                      m.role === "user" ? styles.userText : styles.assistantText
                    }
                  >
                    {m.content}
                  </Text>
                </View>
                {m.role === "user" && (
                  <View style={styles.avatarUser}>
                    <Text style={styles.avatarText}>U</Text>
                  </View>
                )}
              </Animated.View>
            ))}

            {isSending && (
              <View style={[styles.row, { justifyContent: "flex-start" }]}>
                <View style={styles.avatarBot}>
                  <Bot size={14} color="#3b82f6" strokeWidth={2.5} />
                </View>
                <View style={[styles.bubble, styles.bubbleAssistant]}>
                  <Text style={styles.assistantText}>●●●</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </LinearGradient>

        {/* Enhanced Input Area */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about water levels, trends, or get insights..."
            placeholderTextColor="#94a3b8"
            multiline
            onSubmitEditing={onSend}
            editable={!isSending}
          />
          <TouchableOpacity
            onPress={onSend}
            style={[styles.sendBtn, isSending && { opacity: 0.5 }]}
            disabled={isSending}
            activeOpacity={0.7}
          >
            <Send size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  chatContainer: {
    flex: 1,
  },
  chat: {
    flex: 1,
  },
  suggestionsRow: {
    paddingVertical: 12,
    gap: 8,
    alignItems: "center",
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionText: {
    color: "#3b82f6",
    fontSize: 13,
    fontWeight: "600",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorText: {
    flex: 1,
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  bubble: {
    maxWidth: "75%",
    marginVertical: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bubbleUser: {
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  avatarBot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarUser: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  userText: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 20,
  },
  assistantText: {
    color: "#0f172a",
    fontSize: 15,
    lineHeight: 22,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: "#f8fafc",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    color: "#0f172a",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sendBtn: {
    marginLeft: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
