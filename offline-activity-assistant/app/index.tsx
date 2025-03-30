import { View, Text, Pressable, StyleSheet, Platform, Linking } from 'react-native';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';

export default function Home() {
  const [isButtonHovered, setButtonHovered] = useState(false);
  const phoneNumber = 'tel:+14425150724';
  const router = useRouter();
  
  const handlePress = () => {
    alert('handlePress function called!');
    console.log('handlePress function called!');
    router.push('/emergency');
    Linking.openURL(phoneNumber);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offline Activity Assistant</Text>
      <View style={styles.buttonGrid}>
        <Link href="/trips" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Trips</Text>
          </Pressable>
        </Link>
        <Link href="/identify-plant" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Plant Identification</Text>
          </Pressable>
        </Link>
      </View>
      <View style={styles.buttonGrid}>
        <Link href="/first-aid" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>First Aid</Text>
          </Pressable>
        </Link>
        <Link href="/injury-scan" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Scan Injury</Text>
          </Pressable>
        </Link>
      </View>
      
      <Pressable style={styles.emergencyButton} onPress={Linking.openURL(phoneNumber)}>
        <Link href="/emergency" asChild>
          <Text style={styles.emergencyButtonText}>EMERGENCY ASSISTANCE</Text>
        </Link>
      </Pressable>
      
      <View style={styles.emergencyShortcuts}>
        <Link href="/emergency?type=bleeding" asChild>
          <Pressable style={styles.shortcutButton}>
            <Text style={styles.shortcutText}>Bleeding</Text>
          </Pressable>
        </Link>
        <Link href="/emergency?type=cpr" asChild>
          <Pressable style={styles.shortcutButton}>
            <Text style={styles.shortcutText}>CPR</Text>
          </Pressable>
        </Link>
        <Link href="/emergency?type=burns" asChild>
          <Pressable style={styles.shortcutButton}>
            <Text style={styles.shortcutText}>Burns</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 40,
    color: 'white'
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#3182ce',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    minWidth: 150,
    alignItems: 'center',
    elevation: 4,
  },
  buttonHovered: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  emergencyButton: { 
    paddingVertical: 18, 
    paddingHorizontal: 45, 
    backgroundColor: '#e53e3e', 
    borderRadius: 12,
    elevation: 6,
  },
  emergencyButtonText: { 
    color: "white", 
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center"
  },
  emergencyShortcuts: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  shortcutButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#fb923c',
    borderRadius: 12,
    elevation: 4,
    gap: 10,
  },
  shortcutButtonHovered: {
    backgroundColor: '#f97316',
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 3,
  },
  shortcutText: {
    color: 'white',
    fontWeight: '600',
  },
});