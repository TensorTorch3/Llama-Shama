import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Link } from 'expo-router';

export default function Trips() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trip Planning</Text>
      
      <View style={styles.buttonContainer}>
        <Link href="/new-trips" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>New Trip</Text>
          </Pressable>
        </Link>
        
        <Link href="/trails" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Hiking Trails</Text>
          </Pressable>
        </Link>

        <Link href = "/info" asChild>
            <Pressable style = {styles.button}>
                <Text style = {styles.buttonText}>Info</Text>
            </Pressable>
        </Link>

        <Link href = "/help" asChild>
            <Pressable style = {styles.button}>
                <Text style = {styles.buttonText}>Help</Text>
            </Pressable>
        </Link>

      </View>
      
      <View style={styles.tripInfoContainer}>
        <Text style={styles.subtitle}>Current Trip</Text>
        <Text style={styles.tripDetail}>• Trip Name: Family Vacation</Text>
        <Text style={styles.tripDetail}>• Destination: Grand Canyon</Text>
        <Text style={styles.tripDetail}>• Dates: June 15 - June 22</Text>
        <Text style={styles.tripDetail}>• Activities: Hiking, Sightseeing, Camping</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tripInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tripDetail: {
    marginTop: 10,
    fontSize: 16,
  }
});