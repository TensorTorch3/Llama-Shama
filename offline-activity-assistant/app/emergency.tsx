import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import llamaService, { Message } from '@/services/llamaService';
import { useBackendStatus } from '@/hooks/useBackendStatus';

export default function Emergency() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "What emergency are you facing? I can provide first aid and emergency guidance." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isOnline } = useBackendStatus();

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Sending emergency message:", text);
      
      // Create system message for emergency context
      const systemMessage: Message = {
        role: 'system',
        content: 'You are an emergency medical assistant. Provide clear, concise first aid guidance. Always prioritize life-threatening conditions first.'
      };
      
      // Get all conversation history including the new message
      const allMessages = [
        systemMessage,
        ...messages,
        userMessage
      ];
      
      let response;
      if (type) {
        // If emergency type is specified, use emergency endpoint
        response = await llamaService.emergency(text, type);
      } else {
        // Otherwise use normal chat
        response = await llamaService.chat(allMessages);
      }

      console.log("Received emergency response:", response);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response.answer,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting emergency response:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm having trouble accessing emergency info right now. Please try again, or consult a real first aid guide.",
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  useEffect(() => {
    if (type) {
      sendMessage(`I need emergency guidance for: ${type}`);
    }
  }, [type]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>🚑 Emergency Assistant</Text>
        <View style={[
          styles.statusIndicator, 
          isOnline ? styles.onlineStatus : styles.offlineStatus
        ]} />
      </View>

      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.map((msg, i) => (
          <View key={i} style={[styles.bubble, msg.role === "user" ? styles.userBubble : styles.assistantBubble]}>
            <Text>{msg.content}</Text>
          </View>
        ))}
        {isLoading && <ActivityIndicator size="small" color="#007bff" />}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type an emergency..."
          style={styles.input}
        />
        <Pressable 
          style={[styles.sendButton, !input.trim() ? styles.disabledButton : null]} 
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    right: 0,
  },
  onlineStatus: {
    backgroundColor: '#4CAF50',
  },
  offlineStatus: {
    backgroundColor: '#F44336',
  },
  messages: { flex: 1 },
  bubble: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: "#E0F7FA",
    alignSelf: "flex-end",
  },
  assistantBubble: {
    backgroundColor: "#FFEBEE",
    alignSelf: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 8,
    marginTop: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
