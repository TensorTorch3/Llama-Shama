import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Platform, Text } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
//import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const trailPoints = [
  { id: '1', title: 'Pine Ridge Trailhead', description: 'Starting point', coordinate: { latitude: 37.7749, longitude: -122.4194 } },
  { id: '2', title: 'Lakeside Loop', description: 'Scenic viewpoint', coordinate: { latitude: 37.7850, longitude: -122.4100 } },
  { id: '3', title: 'Eagle Summit', description: 'Mountain peak', coordinate: { latitude: 37.7700, longitude: -122.4300 } },
];

const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [LeafletComponents, setLeafletComponents] = useState<any>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        setIsLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === 'granted');
        
        if (status === 'granted') {
          try {
            const location = await Location.getCurrentPositionAsync({});
            setMapRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          } catch (error) {
            console.error('Error getting location:', error);
            setLocationError("Couldn't get your current location. Using default location.");
          }
        }
      } catch (error) {
        console.error('Error requesting location permissions:', error);
        setLocationError("Couldn't request location permissions.");
      } finally {
        setIsLoading(false);
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      /*import('react-leaflet').then((module) => {
        setLeafletComponents({
          MapContainer: module.MapContainer,
          TileLayer: module.TileLayer,
          Marker: module.Marker,
          Popup: module.Popup,
        });
      });*/
    }
  }, []);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (locationError) {
    return <Text>{locationError}</Text>;
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Map' }} />
      {Platform.OS === 'web' && LeafletComponents ? (
        <LeafletComponents.MapContainer
          center={[mapRegion.latitude, mapRegion.longitude]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <LeafletComponents.TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {trailPoints.map(marker => (
            <LeafletComponents.Marker key={marker.id} position={[marker.coordinate.latitude, marker.coordinate.longitude]}>
              <LeafletComponents.Popup>
                <strong>{marker.title}</strong><br />{marker.description}
              </LeafletComponents.Popup>
            </LeafletComponents.Marker>
          ))}
        </LeafletComponents.MapContainer>
      ) : (
        <MapView
          style={{ flex: 1 }}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
        >
          {trailPoints.map(marker => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
            />
          ))}
        </MapView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});