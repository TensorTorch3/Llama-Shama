import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { Camera } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import llamaService from '@/services/llamaService';

export default function InjuryScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [injuryType, setInjuryType] = useState<string>('general');
  const cameraRef = useRef<Camera>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (cameraRef.current && cameraReady) {
      const result = await cameraRef.current.takePictureAsync();
      setPhoto(result.uri);
    }
  };

  const analyzeInjury = async () => {
    if (!photo) return;
    
    setIsAnalyzing(true);
    try {
      // Get the current date for context
      const currentDate = new Date().toLocaleDateString();
      
      // Determine prompt based on injury type
      let prompt = `Analyze this injury photo taken on ${currentDate}. `;
      
      switch(injuryType) {
        case 'cut':
          prompt += 'The image shows a cut or laceration. Assess severity, recommend treatment steps, and indicate if medical attention is needed.';
          break;
        case 'burn':
          prompt += 'The image shows a burn. Identify likely burn degree, recommend immediate treatment, and indicate if medical attention is needed.';
          break;
        case 'rash':
          prompt += 'The image shows a skin rash or irritation. Suggest possible causes, recommend relief measures, and indicate if medical attention is needed.';
          break;
        case 'swelling':
          prompt += 'The image shows swelling or inflammation. Suggest possible causes, recommend immediate treatment options, and indicate if medical attention is needed.';
          break;
        default:
          prompt += 'Identify the type of injury shown, assess severity, recommend immediate first aid steps, and indicate if medical attention is needed.';
      }
      
      // Always add disclaimer
      prompt += ' Include a disclaimer about limitations of AI medical advice.';
      
      // Get assessment from LlamaService
      const response = await llamaService.ask(prompt);
      
      setResult(response.answer);
    } catch (error) {
      console.error('Error analyzing injury photo:', error);
      setResult('Failed to analyze injury. Please try again or refer to the First Aid guide for general guidance.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (hasPermission === null) {
    return <ThemedText>Requesting camera permission...</ThemedText>;
  }
  if (hasPermission === false) {
    return (
      <ThemedView style={styles.permissionContainer}>
        <Stack.Screen options={{ title: 'Injury Scanner' }} />
        <ThemedText>No access to camera</ThemedText>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/first-aid')}>
          <ThemedText style={styles.buttonText}>Go to First Aid Guide</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: photo ? 'Injury Analysis' : 'Injury Scanner' }} />
      
      {!photo ? (
        <>
          <Camera
            style={styles.camera}
            ref={cameraRef}
            onCameraReady={() => setCameraReady(true)}
          />
          <View style={styles.injuryTypesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                style={[styles.injuryTypeButton, injuryType === 'general' && styles.selectedInjuryType]} 
                onPress={() => setInjuryType('general')}>
                <ThemedText style={styles.injuryTypeText}>General</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.injuryTypeButton, injuryType === 'cut' && styles.selectedInjuryType]} 
                onPress={() => setInjuryType('cut')}>
                <ThemedText style={styles.injuryTypeText}>Cut/Wound</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.injuryTypeButton, injuryType === 'burn' && styles.selectedInjuryType]} 
                onPress={() => setInjuryType('burn')}>
                <ThemedText style={styles.injuryTypeText}>Burn</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.injuryTypeButton, injuryType === 'rash' && styles.selectedInjuryType]} 
                onPress={() => setInjuryType('rash')}>
                <ThemedText style={styles.injuryTypeText}>Rash</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.injuryTypeButton, injuryType === 'swelling' && styles.selectedInjuryType]} 
                onPress={() => setInjuryType('swelling')}>
                <ThemedText style={styles.injuryTypeText}>Swelling</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
          
          <View style={styles.controls}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ThemedText style={styles.buttonText}>Back</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePhoto}
              disabled={!cameraReady}
            >
              <ThemedText style={styles.buttonText}>📸 Capture Injury</ThemedText>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <ThemedView style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.preview} />
          
          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ce2029" />
              <ThemedText style={styles.loadingText}>Analyzing injury...</ThemedText>
            </View>
          ) : result ? (
            <ScrollView style={styles.resultContainer}>
              <ThemedText type="subtitle" style={styles.resultTitle}>Medical Analysis:</ThemedText>
              <ThemedText style={styles.resultText}>{result}</ThemedText>
              
              <View style={styles.warningBox}>
                <ThemedText style={styles.warningText}>
                  ⚠️ This is not professional medical advice. For serious injuries, seek immediate medical help.
                </ThemedText>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]} 
                  onPress={() => {
                    setPhoto(null);
                    setResult(null);
                  }}
                >
                  <ThemedText style={styles.buttonText}>Take Another Photo</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={() => router.push('/first-aid')}
                >
                  <ThemedText style={styles.buttonText}>First Aid Guide</ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.buttonContainer}>
              <ThemedText style={styles.photoTakenText}>✅ Photo Captured</ThemedText>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]} 
                  onPress={() => setPhoto(null)}
                >
                  <ThemedText style={styles.buttonText}>Retake</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={analyzeInjury}
                >
                  <ThemedText style={styles.buttonText}>Analyze Injury</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  camera: { 
    flex: 1,
  },
  injuryTypesContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    padding: 10,
  },
  injuryTypeButton: {
    backgroundColor: 'rgba(206, 32, 41, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedInjuryType: {
    backgroundColor: '#ce2029',
  },
  injuryTypeText: {
    color: 'white',
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 10,
  },
  captureButton: {
    backgroundColor: '#ce2029',
    padding: 12,
    borderRadius: 10,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16,
  },
  previewContainer: {
    flex: 1,
  },
  preview: { 
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    alignItems: 'center',
  },
  photoTakenText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#ce2029',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  resultContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 20,
    maxHeight: '70%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  resultTitle: {
    color: '#ce2029',
    marginBottom: 10,
  },
  resultText: {
    marginVertical: 10,
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: '#ffecec',
    borderLeftWidth: 4,
    borderLeftColor: '#ce2029',
    padding: 12,
    marginVertical: 15,
    borderRadius: 6,
  },
  warningText: {
    color: '#721c24',
    fontSize: 14,
  }
});
