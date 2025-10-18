import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Network from 'expo-network';
import { COLORS } from '@/constants/theme';
import i18n, { initializeI18next } from '@/app/services/i18next';
import { ActivityIndicator, Dimensions, Platform, StyleSheet, Text, View, Image } from 'react-native';
import { ZoomVideoSdkProvider } from '@zoom/react-native-videosdk';

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
  const [appReady, setAppReady] = useState(false);

  // Load fonts
  const [loaded] = useFonts({
    ElMessiri: require('../assets/fonts/ElMessiri-Regular.ttf'),
    Nunito: require('../assets/fonts/Nunito-Regular.ttf'),
  });

  // Network status watcher
  useEffect(() => {
    const updateNetworkStatus = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsConnected(networkState.isConnected ?? null);
    };
    const interval = setInterval(updateNetworkStatus, 1000);
    updateNetworkStatus();
    return () => clearInterval(interval);
  }, []);

  // Once fonts are loaded, init i18n and mark app ready
  // Once fonts load → init translations → mark ready
  useEffect(() => {
    if (loaded) {
      initializeI18next()
        .then(() => {
          setAppReady(true);
        })
        .catch((error) => {
          console.error('Failed to initialize i18n:', error);
          // Still mark app as ready even if i18n fails (fallback to default language)
          setAppReady(true);
        });
    }
  }, [loaded]);

  // Hide native splash only when app is fully ready
  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);


  if (!appReady) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={"#082e08"} style={{ marginTop: 15 }} />
      </View>
    );
  }
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>


        <StatusBar style="auto" />
        <ZoomVideoSdkProvider
          config={{
            appGroupId: 'group.us.zoom.HaroonZoomVideoSDK',
            domain: 'zoom.us',
            enableLog: true,
          }}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, title: isConnected === false ? i18n.t('NoInternetConnection') : i18n.t('HaroonAdvisors') }} />
            <Stack.Screen name="(drawer)" options={{ headerShown: false, title: i18n.t('Clientele') }} />
            <Stack.Screen
              name="screens/auth/SignIn"
              options={{
                headerShown: false,
                headerTransparent: Platform.OS === 'ios',
                headerBackVisible: true,
                title: i18n.t('SignIn'),
                headerTintColor: colorScheme === 'light' ? COLORS.betabg : COLORS.primary,
              }}
            />
            <Stack.Screen name="screens/auth/CreateAccount" options={{
              headerShown: true,
              headerTransparent: Platform.OS === 'ios',
              headerBackVisible: true,
              headerTintColor: colorScheme === 'light' ? COLORS.betabg : COLORS.primary,
              title: i18n.t('CreateAccount')
            }} />
            <Stack.Screen name="screens/Profile" options={{
              headerShown: true, title: i18n.t('Profile'),
              headerTransparent: Platform.OS === 'ios',
              headerBackVisible: true,
              headerTintColor: colorScheme === 'light' ? COLORS.betabg : COLORS.primary,
            }} />
            <Stack.Screen name="screens/BecomeLawyer" options={{
              headerShown: true,
              headerTransparent: Platform.OS === 'ios',
              headerBackVisible: true,
              headerTintColor: colorScheme === 'light' ? COLORS.betabg : COLORS.primary,
              title: i18n.t('BecomeALawyer')
            }} />
            <Stack.Screen name="screens/OnlineLawyers" options={{ headerShown: true, title: i18n.t('OnlineLawyers') }} />
            <Stack.Screen name="screens/SearchLawyers" options={{ headerShown: true, title: i18n.t('AllLawyers') }} />
            <Stack.Screen name="screens/AllNotifications" options={{ headerShown: true, title: i18n.t('Notifications') }} />
            <Stack.Screen name="screens/LawyerProfile" options={{ headerShown: true, title: i18n.t('AllLawyers') }} />
            <Stack.Screen
              name="screens/chat/ChatScreen"
              options={{
                headerShown: true,
                headerTransparent: Platform.OS === 'ios',
                headerBackVisible: true,
                title: i18n.t('ChatScreen'),
                headerTintColor: colorScheme === 'light' ? COLORS.betabg : COLORS.primary,
              }}
            />
            <Stack.Screen
              name="screens/chat/WebViewScreen"
              options={{
                headerShown: false,
                headerTransparent: Platform.OS === 'ios',
                headerBackVisible: true,
                title: i18n.t('LiveSession'),
                headerTintColor: Platform.OS === 'ios' ? COLORS.primary : COLORS.primary,
              }}
            />
            <Stack.Screen
              name="screens/chat/CallScreen"
              options={{
                headerShown: true,
                headerTransparent: Platform.OS === 'ios',
                headerBackVisible: true,
                title: i18n.t('LiveSession'),
                headerTintColor: Platform.OS === 'ios' ? COLORS.primary : COLORS.primary,
              }}
            />
            <Stack.Screen name="screens/PrivacyPolicy" options={{ headerShown: true, title: i18n.t('PrivacyPolicy') }} />
            <Stack.Screen name="screens/Terms&Use" options={{ headerShown: true, title: i18n.t('TermsUse') }} />
            <Stack.Screen name="screens/Lawyers" options={{ headerShown: true, title: i18n.t('Lawyers') }} />
            <Stack.Screen name="screens/DeleteAccount" options={{ headerShown: true, title: i18n.t('DeleteAccount') }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          {isConnected === false && <Overlay />}
        </ZoomVideoSdkProvider>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff', // match splash background
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
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