import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Network from 'expo-network';
import { COLORS } from '@/constants/theme';
import i18n from '@/app/services/i18next';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { ZoomVideoSdkProvider } from '@zoom/react-native-videosdk';
import { useTranslation } from 'react-i18next';

const Overlay = () => {
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <Text style={styles.overlayText}>No Internet Connection</Text>
      <Text style={styles.overlayText}>Reconnecting...</Text>
    </View>
  );
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const { t } = useTranslation();
  const [loaded] = useFonts({
    ElMessiri: require('../assets/fonts/ElMessiri-Regular.ttf'),
    Nunito: require('../assets/fonts/Nunito-Regular.ttf'),
  });
  useEffect(() => {
    const updateNetworkStatus = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsConnected(networkState.isConnected ?? null);
    };
    const interval = setInterval(updateNetworkStatus, 1000);
    updateNetworkStatus(); // initial check
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (loaded) {
      i18n.init();
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  if (!loaded) {
    return null;
  }
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <ZoomVideoSdkProvider
        config={{
          appGroupId: 'group.us.zoom.HaroonZoomVideoSDK',
          domain: 'zoom.us',
          enableLog: true,
        }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: true, title: isConnected === false ? t('NoInternetConnection') : t('HaroonAdvisors') }} />
          <Stack.Screen name="(drawer)" options={{ headerShown: false, title: t('Clientele') }} />
          <Stack.Screen
            name="screens/auth/SignIn"
            options={{
              headerShown: false,
              headerTransparent: Platform.OS === 'ios',
              headerBackVisible: true,
              title: t('SignIn'),
              headerTintColor: colorScheme === 'light' ? COLORS.betabg : COLORS.primary,
            }}
          />
          <Stack.Screen name="screens/auth/CreateAccount" options={{
            headerShown: true,
            headerTransparent: Platform.OS === 'ios',
            headerBackVisible: true,
            headerTintColor: colorScheme === 'light' ? COLORS.betabg : COLORS.primary,
            title: t('CreateAccount')
          }} />
          <Stack.Screen name="screens/Profile" options={{
            headerShown: true, title: t('Profile'),
            headerTransparent: Platform.OS === 'ios',
            headerBackVisible: true,
            headerTintColor: colorScheme === 'light' ? COLORS.betabg : COLORS.primary,
          }} />
          <Stack.Screen name="screens/BecomeLawyer" options={{
            headerShown: true,
            headerTransparent: Platform.OS === 'ios',
            headerBackVisible: true,
            headerTintColor: colorScheme === 'light' ? COLORS.betabg : COLORS.primary,
            title: t('BecomeALawyer')
          }} />
          <Stack.Screen name="screens/OnlineLawyers" options={{ headerShown: true, title: t('OnlineLawyers') }} />
          <Stack.Screen name="screens/SearchLawyers" options={{ headerShown: true, title: t('AllLawyers') }} />
          <Stack.Screen name="screens/AllNotifications" options={{ headerShown: true, title: t('Notifications') }} />
          <Stack.Screen name="screens/LawyerProfile" options={{ headerShown: true, title: t('AllLawyers') }} />
          <Stack.Screen
            name="screens/chat/ChatScreen"
            options={{
              headerShown: true,
              headerTransparent: Platform.OS === 'ios',
              headerBackVisible: true,
              title: t('ChatScreen'),
              headerTintColor: colorScheme === 'light' ? COLORS.betabg : COLORS.primary,
            }}
          />
          <Stack.Screen
            name="screens/chat/WebViewScreen"
            options={{
              headerShown: false,
              headerTransparent: Platform.OS === 'ios',
              headerBackVisible: true,
              title: t('LiveSession'),
              headerTintColor: Platform.OS === 'ios' ? COLORS.primary : COLORS.primary,
            }}
          />
          <Stack.Screen
            name="screens/chat/CallScreen"
            options={{
              headerShown: true,
              headerTransparent: Platform.OS === 'ios',
              headerBackVisible: true,
              title: t('LiveSession'),
              headerTintColor: Platform.OS === 'ios' ? COLORS.primary : COLORS.primary,
            }}
          />
          <Stack.Screen name="screens/PrivacyPolicy" options={{ headerShown: true, title: t('PrivacyPolicy') }} />
          <Stack.Screen name="screens/Terms&Use" options={{ headerShown: true, title: t('TermsUse') }} />
          <Stack.Screen name="screens/Lawyers" options={{ headerShown: true, title: t('Lawyers') }} />
          <Stack.Screen name="screens/DeleteAccount" options={{ headerShown: true, title: t('DeleteAccount') }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        {isConnected === false && <Overlay />}
      </ZoomVideoSdkProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});