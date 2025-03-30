import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Collapsible } from '@/components/Collapsible';
import llamaService from '@/services/llamaService';
import { useBackendStatus } from '@/hooks/useBackendStatus';

export default function Info() {
  const [parkInfo, setParkInfo] = useState<string | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<string | null>(null);
  const [safetyInfo, setSafetyInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOnline } = useBackendStatus();

  useEffect(() => {
    const loadInfo = async () => {
      setIsLoading(true);
      
      try {
        if (isOnline) {
          // Load park info
          const parkResponse = await llamaService.ask(
            "Provide information about national parks in the United States. Include the top 3 most visited parks, their main attractions, and best time to visit."
          );
          setParkInfo(parkResponse.answer);
          
          // Load weather info
          const weatherResponse = await llamaService.ask(
            "Provide general information about how to check weather conditions before hiking and why it's important. Include tips for different weather conditions."
          );
          setWeatherInfo(weatherResponse.answer);
          
          // Load safety info
          const safetyResponse = await llamaService.ask(
            "Provide general hiking safety tips and best practices for outdoor enthusiasts. Include information about equipment, preparation, and emergency situations."
          );
          setSafetyInfo(safetyResponse.answer);
        } else {
          // Use offline fallback content
          setParkInfo("Information about national parks is not available offline. Please connect to the internet to access detailed park information.");
          setWeatherInfo("Information about weather conditions is not available offline. When online, this section provides tips on checking weather before outdoor activities.");
          setSafetyInfo("Basic safety tips: Always tell someone your plans, carry enough water, pack a first aid kit, and be aware of your surroundings. More detailed information is available when online.");
        }
      } catch (error) {
        console.error('Error loading info:', error);
        setParkInfo("Failed to load park information. Please try again later.");
        setWeatherInfo("Failed to load weather information. Please try again later.");
        setSafetyInfo("Failed to load safety information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInfo();
  }, [isOnline]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Outdoor Information' }} />
      
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
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading information...</ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <ThemedText type="title">Outdoor Information</ThemedText>
          
          <Collapsible title="National Parks">
            <ThemedText style={styles.infoText}>
              {parkInfo}
            </ThemedText>
          </Collapsible>
          
          <Collapsible title="Weather Considerations">
            <ThemedText style={styles.infoText}>
              {weatherInfo}
            </ThemedText>
          </Collapsible>
          
          <Collapsible title="Hiking Safety Tips">
            <ThemedText style={styles.infoText}>
              {safetyInfo}
            </ThemedText>
          </Collapsible>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  infoText: {
    lineHeight: 22,
  },
});