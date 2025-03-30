import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import llamaService from '@/services/llamaService';
import { useBackendStatus } from '@/hooks/useBackendStatus';

export default function Help() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isOnline } = useBackendStatus();

  const askQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const response = await llamaService.ask(question);
      setAnswer(response.answer);
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('Sorry, there was an error processing your question. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Help & Information' }} />

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Ask Me Anything</ThemedText>

        <View style={styles.statusContainer}>
          <ThemedText>Status: </ThemedText>
          <View style={[
            styles.statusIndicator,
            isOnline ? styles.onlineStatus : styles.offlineStatus
          ]} />
          <ThemedText>
            {isOnline ? ' Connected to Llama' : ' Offline Mode'}
          </ThemedText>
        </View>

        <ThemedText style={styles.description}>
          Ask any question about outdoor activities, hiking, first aid, natural hazards, or other outdoor information.
        </ThemedText>

        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Type your question here..."
          value={question}
          onChangeText={setQuestion}
        />

        <Pressable
          style={[styles.button, !question.trim() ? styles.disabledButton : null]}
          onPress={askQuestion}
          disabled={!question.trim() || isLoading}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Processing...' : 'Ask Question'}
          </ThemedText>
        </Pressable>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <ThemedText style={styles.loadingText}>Thinking...</ThemedText>
          </View>
        )}

        {answer && !isLoading && (
          <View style={styles.answerContainer}>
            <ThemedText type="subtitle">Answer:</ThemedText>
            <ThemedText style={styles.answerText}>{answer}</ThemedText>
          </View>
        )}

        <ThemedText style={styles.disclaimer}>
          This assistant uses AI to provide information. While it strives for accuracy, 
          always verify critical information from official sources.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  onlineStatus: {
    backgroundColor: '#4CAF50',
  },
  offlineStatus: {
    backgroundColor: '#F44336',
  },
  description: {
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0a7ea4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  answerContainer: {
    marginTop: 20,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  answerText: {
    marginTop: 8,
    lineHeight: 24,
  },
  disclaimer: {
    marginTop: 20,
    fontStyle: 'italic',
    opacity: 0.7,
  },
});