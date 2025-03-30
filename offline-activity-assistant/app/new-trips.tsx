import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  activities: string;
  notes: string;
}

export default function NewTrip() {
  const router = useRouter();
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activities, setActivities] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    if (!tripName.trim()) {
      Alert.alert('Error', 'Trip name is required');
      return false;
    }
    
    if (!destination.trim()) {
      Alert.alert('Error', 'Destination is required');
      return false;
    }
    
    if (!startDate.trim()) {
      Alert.alert('Error', 'Start date is required');
      return false;
    }
    
    return true;
  };

  const saveTrip = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Generate a unique ID for the trip
      const id = Date.now().toString();
      
      const newTrip: Trip = {
        id,
        name: tripName,
        destination,
        startDate,
        endDate,
        activities,
        notes
      };
      
      // Get existing trips from storage
      const tripsJson = await AsyncStorage.getItem('trips');
      const trips: Trip[] = tripsJson ? JSON.parse(tripsJson) : [];
      
      // Add the new trip
      trips.push(newTrip);
      
      // Save back to storage
      await AsyncStorage.setItem('trips', JSON.stringify(trips));
      
      Alert.alert(
        'Success', 
        'Trip saved successfully!',
        [{ text: 'OK', onPress: () => router.push('/trips') }]
      );
    } catch (error) {
      console.error('Error saving trip:', error);
      Alert.alert('Error', 'Failed to save trip. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'New Trip' }} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Plan a New Trip</ThemedText>
        
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Trip Name *</ThemedText>
          <TextInput
            style={styles.input}
            value={tripName}
            onChangeText={setTripName}
            placeholder="Enter trip name"
          />
        </View>
        
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Destination *</ThemedText>
          <TextInput
            style={styles.input}
            value={destination}
            onChangeText={setDestination}
            placeholder="Where are you going?"
          />
        </View>
        
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Start Date *</ThemedText>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="MM/DD/YYYY"
          />
        </View>
        
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>End Date</ThemedText>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="MM/DD/YYYY"
          />
        </View>
        
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Activities</ThemedText>
          <TextInput
            style={styles.input}
            value={activities}
            onChangeText={setActivities}
            placeholder="What will you do? (e.g., Hiking, Swimming)"
          />
        </View>
        
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Notes</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional information about your trip"
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Pressable 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </Pressable>
          
          <Pressable 
            style={[styles.saveButton, isSubmitting && styles.disabledButton]}
            onPress={saveTrip}
            disabled={isSubmitting}
          >
            <ThemedText style={styles.saveButtonText}>
              {isSubmitting ? 'Saving...' : 'Save Trip'}
            </ThemedText>
          </Pressable>
        </View>
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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#0a7ea4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});
