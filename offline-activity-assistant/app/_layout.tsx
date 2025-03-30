import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// This layout serves as the root navigation container
export default function RootLayout() {
  // Initialize router and ensure it's ready before navigation
  useEffect(() => {
    // Router initialization code if needed
    console.log('Router initialized');
  }, []);

  return (
    <SafeAreaProvider>
      <Stack 
        screenOptions={{
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
    </SafeAreaProvider>
  );
}
