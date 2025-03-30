import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import llamaService from '@/services/llamaService';

// Trail template data for offline mode
const OFFLINE_TRAILS = [
  {
    id: '1',
    name: 'Pine Ridge Trail',
    difficulty: 'Moderate',
    length: '5.2 miles',
    description: 'A scenic trail through pine forests with mountain views.',
  },
  {
    id: '2',
    name: 'Lakeside Loop',
    difficulty: 'Easy',
    length: '2.8 miles',
    description: 'Flat trail circling the lake with several fishing spots.',
  },
  {
    id: '3',
    name: 'Eagle Summit',
    difficulty: 'Hard',
    length: '8.5 miles',
    description: 'Challenging hike to the mountain peak with panoramic views.',
  },
];

type Trail = {
  id: string;
  name: string;
  difficulty: string;
  length: string;
  description: string;
  details?: string;
};

export default function TrailsScreen() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const loadTrails = async () => {
      setIsLoading(true);
      try {
        const available = await llamaService.isBackendAvailable();
        setIsOnline(available);
        
        if (available) {
          // In a real app, you might have a dedicated API endpoint for trail data
          // Here we're using the general Q&A endpoint
          const response = await llamaService.ask(
            "List 5 hiking trails with their names, difficulty levels, lengths, and brief descriptions."
          );
          
          // This is just a simple demo parser for the response
          // In a real app, you'd want to structure this data properly
          const trailText = response.answer;
          const trailEntries = trailText.split(/\d+\.\s/).filter(Boolean);
          
          const parsedTrails = trailEntries.map((entry, index) => {
            // Very basic parsing - would need proper structure in a real app
            const lines = entry.trim().split('\n').filter(Boolean);
            const name = lines[0]?.replace(/^[^:]+:\s*/, '') || `Trail ${index + 1}`;
            
            let difficulty = 'Unknown';
            let length = 'Unknown';
            let description = '';
            
            lines.forEach(line => {
              if (line.toLowerCase().includes('difficulty')) {
                difficulty = line.split(':')[1]?.trim() || difficulty;
              } else if (line.toLowerCase().includes('length') || line.toLowerCase().includes('distance')) {
                length = line.split(':')[1]?.trim() || length;
              } else if (!line.includes(':')) {
                description += line + ' ';
              }
            });
            
            return {
              id: (index + 1).toString(),
              name,
              difficulty,
              length,
              description: description.trim(),
            };
          });
          
          setTrails(parsedTrails.length > 0 ? parsedTrails : OFFLINE_TRAILS);
        } else {
          // Use offline data
          setTrails(OFFLINE_TRAILS);
        }
      } catch (error) {
        console.error('Error loading trails:', error);
        setTrails(OFFLINE_TRAILS);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTrails();
  }, []);

  const fetchTrailDetails = async (trail: Trail) => {
    setSelectedTrail(trail);
    setIsLoadingDetails(true);
    
    try {
      if (isOnline) {
        // Get detailed information about the trail
        const response = await llamaService.ask(
          `Provide detailed information about the "${trail.name}" hiking trail. Include terrain, wildlife, best seasons to visit, and safety tips.`
        );
        
        // Update the selected trail with details
        setSelectedTrail({
          ...trail,
          details: response.answer,
        });
      } else {
        // Offline fallback
        setSelectedTrail({
          ...trail,
          details: "Detailed information is not available in offline mode. Please connect to the internet to access more details about this trail."
        });
      }
    } catch (error) {
      console.error('Error fetching trail details:', error);
      setSelectedTrail({
        ...trail,
        details: "Failed to load trail details. Please try again later."
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const renderTrailItem = ({ item }: { item: Trail }) => (
    <Pressable 
      style={[styles.trailItem, selectedTrail?.id === item.id && styles.selectedTrail]} 
      onPress={() => fetchTrailDetails(item)}
    >
      <ThemedText type="subtitle">{item.name}</ThemedText>
      <View style={styles.trailInfo}>
        <ThemedText style={styles.difficultyLabel}>
          Difficulty: 
          <ThemedText style={[
            styles.difficultyValue,
            item.difficulty.toLowerCase() === 'easy' && styles.easyDifficulty,
            item.difficulty.toLowerCase() === 'moderate' && styles.moderateDifficulty,
            item.difficulty.toLowerCase() === 'hard' && styles.hardDifficulty,
          ]}>
            {` ${item.difficulty}`}
          </ThemedText>
        </ThemedText>
        <ThemedText>Length: {item.length}</ThemedText>
      </View>
      <ThemedText>{item.description}</ThemedText>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Hiking Trails' }} />
      
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
      
      <View style={styles.content}>
        <ThemedText type="title">Hiking Trails</ThemedText>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <ThemedText style={styles.loadingText}>Loading trails...</ThemedText>
          </View>
        ) : (
          <FlatList
            data={trails}
            renderItem={renderTrailItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.trailList}
          />
        )}
      </View>
      
      {selectedTrail && (
        <View style={styles.detailsContainer}>
          <ThemedText type="subtitle">{selectedTrail.name} Details</ThemedText>
          
          {isLoadingDetails ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#0a7ea4" />
              <ThemedText>Loading details...</ThemedText>
            </View>
          ) : (
            <ScrollView style={styles.detailsContent}>
              <ThemedText>{selectedTrail.details}</ThemedText>
            </ScrollView>
          )}
          
          <Pressable 
            style={styles.closeButton}
            onPress={() => setSelectedTrail(null)}
          >
            <ThemedText style={styles.closeButtonText}>Close</ThemedText>
          </Pressable>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 10,
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
  content: {
    flex: 1,
    padding: 20,
  },
  trailList: {
    paddingBottom: 20,
  },
  trailItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  selectedTrail: {
    borderLeftColor: '#28a745',
    backgroundColor: '#e8f5e9',
  },
  trailInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  difficultyLabel: {
    fontWeight: '500',
  },
  difficultyValue: {
    fontWeight: 'normal',
  },
  easyDifficulty: {
    color: '#28a745',
  },
  moderateDifficulty: {
    color: '#fd7e14',
  },
  hardDifficulty: {
    color: '#dc3545',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '60%',
  },
  detailsContent: {
    marginTop: 10,
    maxHeight: '80%',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
