import Toast from 'react-native-simple-toast';
import React, { useState, useEffect, useCallback } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SIZES, api_url, lawyerprefix, prefix } from '../../../constants/theme';
import { ThemedButton } from "@/components/ThemedButton";
import { View, Text, Image, ScrollView, SafeAreaView, useColorScheme, TouchableOpacity, ActivityIndicator, RefreshControl, BackHandler } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, useFocusEffect } from 'expo-router';

const Chat = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const onlineStatusStyle = {
    position: 'absolute',
    bottom: 5,
    left: 5,
    height: 15,
    width: 15,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colorScheme === 'dark' ? COLORS.white : COLORS.background,
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      fetchUserData();
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [fetchUserData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData().then(() => setRefreshing(false));
  };
  const fetchUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userDataJson = JSON.parse(userDataString);
        const userId = userDataJson.userData.user.id;
        const userType = userDataJson.userType;
        setUserType(userType);
        fetchLawyers(userId, userType);
      }
    } catch (error) {
      Toast.show('Please connect to internet');
      setLoading(false);
    }
  };
  const fetchLawyers = async (userId, userType) => {
    try {
      setLoading(true); // Ensure loading state is true before fetching data
      const prefixToUse = userType === 'lawyer' ? lawyerprefix : prefix;
      const response = await fetch(api_url + prefixToUse + 'chatlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (!result.appointments) {
        throw new Error('Invalid response format: Missing "appointments" key');
      }
      const lawyerMap = {};
      const now = new Date().getTime(); // Current timestamp
      result.appointments.forEach((appointment) => {
        const lawyerId = appointment.lawyer?.id?.toString();
        if (!lawyerId) return; // Skip if lawyer data is missing
        const appointmentDate = new Date(appointment.date).getTime();
        // If lawyer is not in the map, add the first appointment
        if (!lawyerMap[lawyerId]) {
          lawyerMap[lawyerId] = {
            id: lawyerId,
            name: appointment.lawyer?.name || 'Unknown Lawyer',
            img: { uri: appointment.lawyer?.image || 'default_image_url' },
            appDate: appointment.date, // Temporarily store any date
            duration: appointment.duration,
            date: appointment.date,
            appointment_start_time: appointment.appointment_start_time,
            is_online: appointment.lawyer?.is_online,
          };
        }
        // Prioritize upcoming appointments
        const existingDate = new Date(lawyerMap[lawyerId].date).getTime();
        if (appointmentDate >= now) {
          // If the current appointment is in the future and earlier than the stored one, replace it
          if (existingDate < now || appointmentDate < existingDate) {
            lawyerMap[lawyerId].date = appointment.date;
            lawyerMap[lawyerId].appDate = appointment.date; // Update to show the upcoming date
            lawyerMap[lawyerId].duration = appointment.duration; // Update to show the upcoming date
            lawyerMap[lawyerId].appointment_start_time = appointment.appointment_start_time;
          }
        } else {
          // If no future appointment exists, store the most recent past appointment
          if (existingDate < now && appointmentDate > existingDate) {
            lawyerMap[lawyerId].date = appointment.date;
            lawyerMap[lawyerId].appDate = appointment.date; // Fallback to most recent past appointment
            lawyerMap[lawyerId].duration = appointment.duration;
            lawyerMap[lawyerId].appointment_start_time = appointment.appointment_start_time;
          }
        }
      });
      // Convert object back to an array and sort by date in descending order
      const transformedData = Object.values(lawyerMap).sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllUsers(transformedData);
      setFilteredUsers(transformedData);
    } catch (error) {
      Toast.show('Please connect to internet');
    } finally {
      setLoading(false);
    }
  };
  const createChatList = async (data) => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userDataJson = JSON.parse(userDataString);
        const userData = userDataJson.userData;
        const userType = userDataJson.userType;
        const serializedUserData = encodeURIComponent(JSON.stringify(userData));
        const serializedData = encodeURIComponent(JSON.stringify(data || {}));
        router.push({
          pathname: '/screens/chat/ChatScreen',
          params: { userData: serializedUserData, data: serializedData, userType },
        });
      }
    } catch (error) {
      Toast.show('Please connect to internet');
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 10 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          </View>
        ) : (
          filteredUsers.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 100, paddingHorizontal: 25, paddingVertical: 25, backgroundColor: colorScheme === 'dark' ? COLORS.betabg : COLORS.white, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.primary }}>
              <FontAwesome style={{ marginBottom: 10 }} color={COLORS.primary} size={100} name="comments" />
              <Text style={{ ...FONTS.h5, color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: 'center' }}>{t('NoLawyersConnected')}</Text>
              <Text style={{ ...FONTS.font, color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: 'center' }}>{t('ConsiderAppointment')}</Text>
              <View style={{ width: '100%', marginTop: 30 }}>
                <ThemedButton title={t('GetaConsultant')} type='primary' onPress={() => router.push('/(drawer)/clientele/Home')} />
              </View>
            </View>
          ) : (
            filteredUsers.map((data, index) => {
              const appointmentDate = new Date(data.appDate);
              const now = new Date();
              const isPastAppointment = appointmentDate < now;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    createChatList(data);
                  }}
                  // onPress={() => {
                  //   if (!isPastAppointment) {
                  //     createChatList(data);
                  //   }
                  // }}
                  // disabled={isPastAppointment}
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    alignItems: 'center',
                    borderColor: COLORS.primary,
                    opacity: isPastAppointment ? 0.8 : 1,
                  }}
                >
                  <Image style={{ height: 60, width: 60, borderRadius: 50 }} source={data.img} />
                  <View style={[onlineStatusStyle, { backgroundColor: data.is_online === 1 ? COLORS.online : 'red' }]} />

                  <View style={{ flex: 1, paddingLeft: 10, paddingRight: 15 }}>
                    <Text style={[FONTS.h6, { marginBottom: 2, color: colorScheme === 'dark' ? COLORS.white : COLORS.black, textAlign: 'right' }]}>{data.name}</Text>

                    <Text style={[FONTS.h6, { marginBottom: 2, color: isPastAppointment ? 'red' : (colorScheme === 'dark' ? COLORS.white : COLORS.betabg), textAlign: 'right' }]}>
                      {isPastAppointment
                        ? t('AppointmentExpired')  // You can define this in your translation file
                        : `${t('UpcomingAppointment')}: ${data.appDate}`}
                    </Text>

                    <Text style={[FONTS.h6, { marginBottom: 2, color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: 'right' }]}>
                      {t('DurationMinutes')}: {data.duration}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Chat;