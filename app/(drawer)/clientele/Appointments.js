import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import UserAppointments from '@/components/UserAppointments';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, api_url } from '../../../constants/theme';
import { ThemedButton } from "@/components/ThemedButton";
import { SafeAreaView, ScrollView, BackHandler, useColorScheme, StatusBar, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';

const Appointments = () => {
    const colorScheme = useColorScheme();
    const [appointmentData, setAppointmentData] = useState([]);
    const [userData, setUserData] = useState();
    const [userType, setUserType] = useState();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { t } = useTranslation();

    const fetchAppointments = useCallback(async () => {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (!userDataString) throw new Error('No user data found');
            const userDataJson = JSON.parse(userDataString);
            setUserData(userDataJson.userData);
            setUserType(userDataJson.userType);
            const userId = userDataJson.userData.user.id;
            const apiUrl = `${api_url}user/${userId}/appointments`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Error fetching appointments: ${response.statusText}`);
            const data = await response.json();
            setAppointmentData(data.appointments);
        } catch (error) {
            console.log('Error fetching appointments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                BackHandler.exitApp();
                return true;
            };
            fetchAppointments();
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [fetchAppointments])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAppointments();
    }, []);

    return (
        <SafeAreaView style={[{ flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }]}>
            <StatusBar backgroundColor={COLORS.primary} />
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} />
                ) : (
                    appointmentData.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 150, marginHorizontal: 20, paddingHorizontal: 25, paddingVertical: 25, backgroundColor: colorScheme === 'dark' ? COLORS.betabg : COLORS.white, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.primary }}>
                            <FontAwesome style={{ marginBottom: 10 }} color={COLORS.primary} size={100} name="calendar" />
                            <Text style={{ ...FONTS.h5, color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: 'center' }}>{t('NoAppointmentsYet')}</Text>
                            <Text style={{ ...FONTS.font, color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: 'center' }}>{t('ConsiderAppointment')}</Text>
                            <View style={{ width: '100%', marginTop: 30 }}>
                                <ThemedButton title={t('GetaConsultant')} type='primary' onPress={() => router.push('/(drawer)/clientele/Home')} />
                            </View>
                        </View>
                    ) : (
                        <UserAppointments title={t('NewAppointments')} appointmentData={appointmentData} userData={userData} userType={userType} onRefresh={fetchAppointments} />
                    )
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Appointments;