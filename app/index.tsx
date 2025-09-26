import React, { useEffect, useState } from 'react';
import { View, Alert, Image, StyleSheet, useColorScheme, AppState } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { IMAGES } from '@/constants/theme';
import { usePushNotifications } from "../usePushNotifications";
import * as Notifications from 'expo-notifications';
import { api_url } from '../constants/theme';
import axios from "axios";

const HomeScreen = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const { expoPushToken, notification } = usePushNotifications();
  const notidata = JSON.stringify(notification, undefined, 2);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  useEffect(() => {
    checkNetworkStatus();
    fetchSavedLanguageAndCheckLogin();

    // Add AppState listener to detect app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove(); // Clean up the listener
    };
  }, []);

  const checkNetworkStatus = async () => {
    const networkState = await Network.getNetworkStateAsync();
    setIsConnected(networkState.isConnected ?? null);
  };

  const handleAppStateChange = async (nextAppState) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { userData: savedUserData } = JSON.parse(userData);
        const identifier = savedUserData?.user?.phone || savedUserData?.user?.email;
        if (!identifier) {
          Alert.alert('No phone or email found in saved user data');
          return;
        }
        const is_online = nextAppState === 'active' ? 1 : 0;
        await axios.post(`${api_url}toggle-status`, {
          identifier,
          is_online,
        });
      }
    } catch (error) {
      console.log('Failed to send app state request:', error);
    }
  };

  const fetchSavedLanguageAndCheckLogin = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { userType, userData: savedUserData } = JSON.parse(userData);

        // Check network status before navigating
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected) {
          Alert.alert('No Internet', 'Please connect to the internet to proceed.');
          return;
        }

        if (userType == 'lawyer') {
          router.push({
            pathname: '/(drawer)/lawyerele/LawyerHome'
          });
        } else {
          router.push({
            pathname: '/(drawer)/clientele/Home'
          });
        }
      }
    } catch (error) {
      console.log('Error during initialization:', error);
    }
  };

  const clearAsyncStorageAndReload = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Success', 'AsyncStorage cleared. Reloading app...', [
        {
          text: 'OK',
          onPress: () => {
            router.push('/');
          },
        },
      ]);
    } catch (error) {
      console.log('Error clearing AsyncStorage:', error);
    }
  };

  if (isConnected === false) {
    return (
      <View style={styles.noInternetContainer}>
        <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.image} />
        <ThemedButton
          title="Retry"
          onPress={async () => {
            const networkState = await Network.getNetworkStateAsync();
            setIsConnected(networkState.isConnected ?? null);
          }}
        />
        <ThemedButton title="Clear AsyncStorage" onPress={clearAsyncStorageAndReload} />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Image style={{ width: '80%', height: 150, resizeMode: "contain", alignSelf: 'center' }} source={colorScheme === "dark" ? IMAGES.appLogo : IMAGES.darkappLogo} />
      <ThemedButton title="Welcome to Haroon Advisors!" type='primary' onPress={() => router.push('/screens/auth/SignIn')} />
    </ThemedView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 10,
    padding: 10,
  },
  noInternetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});