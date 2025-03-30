import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Camera, CameraType } from 'expo-camera'; // Ensure correct import
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<typeof Camera>(null); // Fixed type issue

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

  if (hasPermission === null) {
    return <ThemedText>Requesting camera permission...</ThemedText>;
  }
  if (hasPermission === false) {
    return <ThemedText>No access to camera</ThemedText>;
  }

  return (
    <ThemedView style={styles.container}>
      {!photo ? (
        <>
          <Camera
            style={styles.camera}
            ref={cameraRef}
            type={CameraType.back} // Specify camera type
            onCameraReady={() => setCameraReady(true)}
          />
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <ThemedText style={styles.buttonText}>📸 Take Photo</ThemedText>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Image source={{ uri: photo }} style={styles.preview} />
          <ThemedText style={styles.buttonText}>✅ Photo Taken</ThemedText>
          <TouchableOpacity style={styles.button} onPress={() => setPhoto(null)}>
            <ThemedText style={styles.buttonText}>Retake</ThemedText>
          </TouchableOpacity>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  button: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 18 },
  preview: { flex: 1, width: '100%' },
});
