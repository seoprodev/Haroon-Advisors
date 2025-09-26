import 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import { Appearance, Image, Text, TouchableOpacity } from 'react-native';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

export default function Layout() {
  const router = useRouter();
  const colorScheme = Appearance.getColorScheme();
  const [userType, setUserType] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const getUserType = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem('userData');
        if (storedUserType) {
          const parsedUserType = JSON.parse(storedUserType);
          setUserType(parsedUserType.userType);
        }
      } catch (error) {
        console.log('Error getting userType from AsyncStorage:', error);
      }
    };
    getUserType();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={CustomDrawerContent}
        screenOptions={{
          drawerActiveBackgroundColor: COLORS.primary,
          drawerPosition: i18next.language === 'ar' ? 'right' : 'left',
          headerShadowVisible: false,
          drawerActiveTintColor: COLORS.white,
          headerTitle: () => (
            <Image
              source={
                colorScheme === 'light'
                  ? require('@/assets/images/global/darker-logo.png')
                  : require('@/assets/images/global/lighter-logo.png')
              }
              style={{ width: 100, height: 50, resizeMode: 'contain', marginBottom: 10 }}
            />
          ),
          headerTitleAlign: 'center',
          headerRight: () => (
            <ThemedView style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={{ marginRight: 10 }}
                onPress={() => {
                  router.push('/screens/SearchLawyers');
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={24}
                  color={colorScheme === 'light' ? COLORS.betabg : COLORS.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginRight: 10 }}
                onPress={() => {
                  router.push('/screens/AllNotifications');
                }}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={colorScheme === 'light' ? COLORS.betabg : COLORS.primary}
                />
              </TouchableOpacity>
            </ThemedView>
          ),
        }}
      >
        <Drawer.Screen
          name="lawyerele"
          options={{
            drawerLabel: () => (
              <Text style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                {t('Home')}
              </Text>
            ),
            drawerItemStyle: userType === 'client' || (userType !== 'client' && userType !== 'lawyer')
              ? { display: 'none' }
              : undefined,
            drawerIcon: ({ size, color }) => (
              <Ionicons
                name="home-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="clientele"
          options={{
            drawerLabel: () => (
              <Text style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                {t('Home')}
              </Text>
            ),
            drawerItemStyle: userType === 'lawyer' || (userType !== 'client' && userType !== 'lawyer')
              ? { display: 'none' }
              : undefined,
            drawerIcon: ({ size, color }) => (
              <Ionicons
                name="home-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}