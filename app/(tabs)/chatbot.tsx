import { useStations } from "@/providers/stations-provider";
import { Send } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  const [messages, setMessages] = useState<Message[]>([
    { id: "m0", role: "assistant", content: "Hi! I'm your groundwater assistant. Ask me about water levels, recharge events, or critical stations." },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const suggestions = [
    "What is the average water level?",
    "How many recharge events today?",
    "Which regions are critical?",
    "Give me a groundwater summary",
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
      const top = analytics.regionalData.map(r => `${r.state}: ${r.avgLevel.toFixed(1)}m (${r.status})`).join("; ");
      return `Regional overview — ${top}.`;
    }
    return "I can answer about average water levels, recharge events, critical stations, and regional summaries. Try asking: 'What is the average water level?'";
  };

  const callModel = async (history: Message[]): Promise<string> => {
    const endpoint = "https://openrouter.ai/api/v1/chat/completions";
    const apiKey = "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";
    const model = "deepseek/deepseek-chat-v3.1:free";

    const system = `You are an assistant focused on groundwater, water resources, and sustainability. Answer concisely and helpfully.
Context (analytics summary): avgWaterLevel=${analytics.avgWaterLevel.toFixed(1)} m, rechargeEvents=${analytics.rechargeEvents}, criticalStations=${analytics.criticalStations}. Regions: ${analytics.regionalData.map(r => r.state + ':' + r.avgLevel.toFixed(1) + 'm(' + r.status + ')').join(', ')}.`;

    const orMessages = [
      { role: "system", content: system },
      ...history.map(m => ({ role: m.role, content: m.content } as any)),
    ];

    // Timeout + abort controller
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        // These headers are allowed on native. On web, actual Referer is set by browser and cannot be overridden.
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
      // quick retry once
      await new Promise(r => setTimeout(r, 800));
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
    const userMsg: Message = { id: String(Date.now()), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);

    setIsSending(true);
    try {
      setLastError(null);
      const history = [...messages, userMsg].slice(-10); // keep last 10 turns
      const modelReply = await callModelWithRetry(history);
      const reply: Message = { id: String(Date.now() + 1), role: "assistant", content: modelReply };
      setMessages(prev => [...prev, reply]);
    } catch (e) {
      const errMsg = (e as any)?.message ? String((e as any).message) : "Unknown error";
      setLastError(errMsg);
      const fallbackText = `${answer(text)}\n\n(Note: Live AI reply unavailable. Error: ${errMsg})`;
      const fallback: Message = { id: String(Date.now() + 1), role: "assistant", content: fallbackText };
      setMessages(prev => [...prev, fallback]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Water Assistant</Text>
        <Text style={styles.headerSubtitle}>Ask about groundwater and resources</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsRow}
        >
          {suggestions.map((s, i) => (
            <TouchableOpacity key={i} onPress={() => setInput(s)} style={styles.suggestionChip} activeOpacity={0.85}>
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView style={styles.chat} contentContainerStyle={{ paddingVertical: 12 }}>
        {lastError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>AI request issue: {lastError}</Text>
          </View>
        ) : null}
        {messages.map(m => (
          <View key={m.id} style={[styles.row, m.role === 'user' ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
            {m.role === 'assistant' ? <View style={styles.avatarAssistant}><Text style={styles.avatarText}>AI</Text></View> : null}
            <View style={[styles.bubble, m.role === 'user' ? styles.user : styles.assistant]}>
              <Text style={m.role === 'user' ? styles.userText : styles.assistantText}>{m.content}</Text>
            </View>
            {m.role === 'user' ? <View style={styles.avatarUser}><Text style={styles.avatarText}>U</Text></View> : null}
          </View>
        ))}
        {isSending ? (
          <View style={[styles.row, { justifyContent: 'flex-start' }]}>
            <View style={styles.avatarAssistant}><Text style={styles.avatarText}>AI</Text></View>
            <View style={[styles.bubble, styles.assistant]}>
              <Text style={styles.assistantText}>Typing…</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }] }>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about water levels, recharge, critical stations..."
          style={styles.input}
          placeholderTextColor="#94a3b8"
          returnKeyType="send"
          onSubmitEditing={() => !isSending && onSend()}
          blurOnSubmit={false}
          multiline
          numberOfLines={1}
        />
        <TouchableOpacity disabled={isSending} onPress={onSend} style={[styles.sendBtn, isSending && { opacity: 0.6 }]} activeOpacity={0.85}>
          <Send size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748b",
  },
  chat: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
  },
  suggestionsRow: {
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  suggestionChip: {
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  suggestionText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 12,
  },
  bubble: {
    maxWidth: '85%',
    marginVertical: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingVertical: 2,
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: '#1d4ed8',
  },
  assistant: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
  },
  avatarAssistant: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  avatarUser: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  avatarText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#0f172a',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#0f172a',
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: '#1d4ed8',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
  },
});


