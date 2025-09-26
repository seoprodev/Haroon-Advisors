import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar, useColorScheme, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const AllNotifications = () => {
  const colorScheme = useColorScheme();
  const [notifications, setNotifications] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsString = await AsyncStorage.getItem('notifications');
        if (notificationsString) {
          const notificationsJson = JSON.parse(notificationsString);
          setNotifications(notificationsJson);
        } else {
          console.info('Notifications not available');
        }
      } catch (error) {
        console.info('Error fetching notifications:', error.message);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }]}>
      <StatusBar backgroundColor={COLORS.primary} />
      <ScrollView contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}>
        <ThemedText style={{ textAlign: i18next.language === 'ar' ? 'right' : 'left' }} type="title">{t('Notifications')}</ThemedText>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.black, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                {notification.message}
              </Text>
            </View>
          ))
        ) : (
          <ThemedText style={{ textAlign: i18next.language === 'ar' ? 'right' : 'left' }} type="subtitle">{t('nonewnotification')}</ThemedText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllNotifications;