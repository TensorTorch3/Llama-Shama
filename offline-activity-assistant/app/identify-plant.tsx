import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Stack, Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useBackendStatus } from '@/hooks/useBackendStatus';

export default function IdentifyPlant() {
  const [plantDescription, setPlantDescription] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isOnline } = useBackendStatus();

  const identifyPlant = async () => {
    if (!plantDescription.trim()) {
      console.log("Plant description is empty. Aborting API call.");
      return;
    }

    setIsLoading(true);
    console.log("Starting plant identification...");
    
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama2",
          messages: [{
            role: "user",
            content: `Please identify this plant and provide details: ${plantDescription}. 
            Include information about:
            1. Likely species or family
            2. Key identifying features
            3. Typical habitat
            4. Any potential hazards
            5. Level of confidence in identification`
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const result = data.message?.content || "No valid response received";
      console.log("Received response:", result);
      setResult(result);
    } catch (error) {
      console.error('Error:', error);
      setResult("Error connecting to plant identification service. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Plant Identification' }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Plant Identification</ThemedText>

        </View>

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
          Describe the plant you want to identify. Include details about the leaves,
          flowers, height, location, and any other notable features.
        </ThemedText>

        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Describe the plant here..."
          value={plantDescription}
          onChangeText={setPlantDescription}
        />

        <Pressable
          style={[
            styles.button,
            isLoading ? styles.loadingButton : null
          ]}
          onPress={() => {
            console.log("Identify Plant button pressed");
            identifyPlant();
          }}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Identifying...' : 'Identify Plant'}
          </ThemedText>
        </Pressable>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <ThemedText style={styles.loadingText}>
              Analyzing plant description...
            </ThemedText>
          </View>
        )}

        {result && !isLoading && (
          <View style={styles.resultContainer}>
            <ThemedText type="subtitle">Identification Result:</ThemedText>
            <ThemedText style={styles.resultText}>{result}</ThemedText>
          </View>
        )}

        <ThemedText style={styles.disclaimer}>
          Note: Plant identification is based on text descriptions only and might not be 100% accurate.
          Never consume or touch plants based solely on this identification.
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cameraButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  loadingButton: {
    backgroundColor: '#cccccc',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  resultContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  resultText: {
    marginTop: 8,
    lineHeight: 24,
  },
  disclaimer: {
    marginTop: 20,
    fontStyle: 'italic',
    opacity: 0.7,
  },
});