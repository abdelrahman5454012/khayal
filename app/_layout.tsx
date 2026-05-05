import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold, Cairo_900Black } from '@expo-google-fonts/cairo';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auction/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="horse/[id]"   options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="race/[id]"    options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="bet/[raceId]"    options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="race/live/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="notifications"  options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="wallet"         options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="search"         options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="auth/login"     options={{ animation: 'fade' }} />
        <Stack.Screen name="auth/register"  options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="auth/otp"       options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="auth/verify"    options={{ animation: 'slide_from_right' }} />
      </Stack>
    </View>
  );
}
