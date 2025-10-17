import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import UserAppointments from '../../../components/UserAppointments';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, api_url } from '../../../constants/theme';
import Toast from 'react-native-simple-toast';
import { useNetworkState } from 'expo-network';
import { SafeAreaView, ScrollView, BackHandler, useColorScheme, StatusBar, View, Text, ActivityIndicator, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import i18next from 'i18next';

const LawyerHome = () => {
    const colorScheme = useColorScheme();
    const [appointmentData, setAppointmentData] = useState([]);
    const [userData, setUserData] = useState();
    const [userType, setUserType] = useState();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterType, setFilterType] = useState('all'); // 'all' or 'next10days'
    const { t } = useTranslation();
    const networkState = useNetworkState();

    const fetchAppointments = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            const userDataJson = JSON.parse(userDataString);
            setUserData(userDataJson.userData);
            setUserType(userDataJson.userType);
            const userId = userDataJson.userData.user.id;
            if (!networkState.isConnected || networkState.type !== 'wifi') {
                const cachedAppointments = await AsyncStorage.getItem('appointments');
                if (cachedAppointments) {
                    setAppointmentData(JSON.parse(cachedAppointments));
                } else {
                    console.log('No internet connection and no cached data available.');
                }
                setLoading(false);
                setRefreshing(false);
            }
            const apiUrl = `${api_url}lawyer/${userId}/new-appointment`;
            console.log('Fetching appointments from:', apiUrl); // Debug log
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Error fetching appointments: ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Fetched Appointments:', data); // Debug log
            setAppointmentData(data.appointments);
            await AsyncStorage.setItem('appointments', JSON.stringify(data.appointments));
        } catch (error) {
            console.log('Error fetching appointments:', error);
            Toast.show('Something went wrong. Please try again later.', Toast.LONG);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                BackHandler.exitApp();
                return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, []),
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAppointments();
    }, []);

    // Filter appointments based on selected filter type
    const getFilteredAppointments = () => {
        if (filterType === 'all') {
            return appointmentData;
        } else if (filterType === 'next10days') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tenDaysLater = new Date(today);
            tenDaysLater.setDate(today.getDate() + 10);

            return appointmentData.filter(appointment => {
                // API returns "Date" field (capital D)
                const appointmentDate = new Date(appointment.Date || appointment.date);
                appointmentDate.setHours(0, 0, 0, 0);
                return appointmentDate >= today && appointmentDate <= tenDaysLater;
            });
        }
        return appointmentData;
    };

    const filteredAppointments = getFilteredAppointments();

    return (
        <SafeAreaView style={[{ flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }]}>
            <StatusBar backgroundColor={COLORS.primary} />

            {/* Filter Buttons */}
            <View style={[styles.filterContainer, { backgroundColor: colorScheme === 'dark' ? COLORS.betabg : '#F5F5F5' }]}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filterType === 'all' && styles.filterButtonActive,
                        { flex: 1 }
                    ]}
                    onPress={() => setFilterType('all')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        filterType === 'all' && styles.filterButtonTextActive,
                        { color: filterType === 'all' ? COLORS.white : (colorScheme === 'dark' ? COLORS.white : COLORS.betabg) }
                    ]}>
                        {t('AllAppointments')}
                    </Text>
                    {filterType === 'all' && appointmentData.length > 0 && (
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>{appointmentData.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filterType === 'next10days' && styles.filterButtonActive,
                        { flex: 1, marginLeft: 10 }
                    ]}
                    onPress={() => setFilterType('next10days')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        filterType === 'next10days' && styles.filterButtonTextActive,
                        { color: filterType === 'next10days' ? COLORS.white : (colorScheme === 'dark' ? COLORS.white : COLORS.betabg) }
                    ]}>
                        {t('Next10Days')}
                    </Text>
                    {filterType === 'next10days' && filteredAppointments.length > 0 && (
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>{filteredAppointments.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} />
                ) : (
                    filteredAppointments.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 150, marginHorizontal: 20, paddingHorizontal: 25, paddingVertical: 25, backgroundColor: colorScheme === 'dark' ? COLORS.betabg : COLORS.white, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.primary }}>
                            <FontAwesome style={{ marginBottom: 10 }} color={COLORS.primary} size={100} name="calendar" />
                            <Text style={{ ...FONTS.h5, color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: 'center' }}>
                                {filterType === 'all' ? t('NoAppointmentsYet') : t('NoAppointmentsInNext10Days')}
                            </Text>
                            <Text style={{ ...FONTS.font, color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: 'center' }}>
                                {filterType === 'all' ? t('NoClientsConnected') : t('TryViewingAllAppointments')}
                            </Text>
                        </View>
                    ) : (
                        <UserAppointments
                            title={filterType === 'all' ? t('AllAppointments') : t('Next10Days')}
                            appointmentData={filteredAppointments}
                            userData={userData}
                            userType={userType}
                            onRefresh={fetchAppointments}
                        />
                    )
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default LawyerHome;

const styles = StyleSheet.create({
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 12,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary + '20',
    },
    filterButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: SIZES.radius,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary + '40',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        position: 'relative',
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    filterButtonTextActive: {
        color: COLORS.white,
        fontWeight: '700',
    },
    badgeContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 8,
        minWidth: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
    },
});