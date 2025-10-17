import React, { useEffect, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS, api_url } from '../../../constants/theme';
import { useTranslation } from 'react-i18next';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useColorScheme,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import i18next from 'i18next';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const Schedules = () => {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const { t } = useTranslation();

    const [userData, setUserData] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [startTime, setStartTime] = useState('9:00 AM');
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);


    console.log('Schedules State:', schedules);


    // Day mapping: day_id to day name
    const dayMapping = {
        1: { en: 'Saturday', ar: 'السبت' },
        2: { en: 'Friday', ar: 'الجمعة' },
        3: { en: 'Monday', ar: 'الإثنين' },
        4: { en: 'Tuesday', ar: 'الثلاثاء' },
        5: { en: 'Wednesday', ar: 'الأربعاء' },
        6: { en: 'Thursday', ar: 'الخميس' },
        7: { en: 'Sunday', ar: 'الأحد' }
    };

    // Generate time slots from 12:00 AM to 10:00 PM (last slot 10-11 PM)
    const allTimeSlots = [
        '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
        '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
        '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
    ];

    // Calculate end time (start time + 1 hour)
    const calculateEndTime = (start) => {
        const index = allTimeSlots.indexOf(start);
        if (index === -1 || index === allTimeSlots.length - 1) {
            return '11:00 PM'; // For 10:00 PM start time
        }
        return allTimeSlots[index + 1];
    };

    useEffect(() => {
        const getUserData = async () => {
            try {
                const userDataJson = await AsyncStorage.getItem('userData');
                if (userDataJson) {
                    const userData = JSON.parse(userDataJson);
                    setUserData(userData);
                    fetchSchedules(userData.userData.user.id);
                }
            } catch (error) {
                console.log('Error fetching user data:', error);
            }
        };

        getUserData();
    }, []);

    const fetchSchedules = async (lawyerId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${api_url}lawyer/${lawyerId}/schedules`);

            if (response.data && response.data.schedules) {
                // Group schedules by day_id
                const groupedSchedules = {};
                response.data.schedules.forEach(schedule => {
                    const dayId = schedule.day_id;
                    if (!groupedSchedules[dayId]) {
                        groupedSchedules[dayId] = [];
                    }
                    groupedSchedules[dayId].push(schedule);
                });

                // Sort schedules within each day by start time
                Object.keys(groupedSchedules).forEach(dayId => {
                    groupedSchedules[dayId].sort((a, b) => {
                        const timeA = a['Start Time'];
                        const timeB = b['Start Time'];
                        return allTimeSlots.indexOf(timeA) - allTimeSlots.indexOf(timeB);
                    });
                });

                setSchedules(groupedSchedules);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            Alert.alert(t('Error'), t('FailedToLoadSchedules'));
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        if (userData) {
            setRefreshing(true);
            await fetchSchedules(userData.userData.user.id);
            setRefreshing(false);
        }
    };

    const openAddModal = (dayId, dayName) => {
        // Get existing schedules for this day
        const daySchedules = schedules[dayId] || [];

        // Get used start times for this day
        const usedTimes = daySchedules.map(schedule => schedule['Start Time']);

        // Filter out used time slots
        const available = allTimeSlots.filter(time => !usedTimes.includes(time));

        if (available.length === 0) {
            Alert.alert(t('NoSlotsAvailable'), t('AllTimeSlotsBooked'));
            return;
        }

        setAvailableTimeSlots(available);
        setSelectedDay({ id: dayId, name: dayName });
        setStartTime(available[0]); // Set first available slot as default
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedDay(null);
        setStartTime('9:00 AM');
        setAvailableTimeSlots([]);
    };

    const createSchedule = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('jwtToken');
            const endTime = calculateEndTime(startTime);

            const requestData = {
                lawyer_id: userData.userData.user.id,
                day_id: selectedDay.id,
                name: selectedDay.name,
                start_time: startTime,
                end_time: endTime,
                status: 1
            };

            await axios.post(`${api_url}lawyer/schedule`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            Alert.alert(t('Success'), t('ScheduleCreatedSuccessfully'));
            closeModal();
            await fetchSchedules(userData.userData.user.id);
        } catch (error) {
            console.error('Error creating schedule:', error);
            Alert.alert(t('Error'), t('FailedToCreateSchedule'));
        } finally {
            setLoading(false);
        }
    };

    const deleteSchedule = async (scheduleId) => {
        Alert.alert(
            t('ConfirmDelete'),
            t('AreYouSureDeleteSchedule'),
            [
                {
                    text: t('Cancel'),
                    style: 'cancel'
                },
                {
                    text: t('Delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const token = await AsyncStorage.getItem('jwtToken');

                            await axios.post(`${api_url}lawyer/deleteschedule/${scheduleId}`, {

                            });

                            Alert.alert(t('Success'), t('ScheduleDeletedSuccessfully'));
                            await fetchSchedules(userData.userData.user.id);
                        } catch (error) {
                            console.error('Error deleting schedule:', error);
                            Alert.alert(t('Error'), t('FailedToDeleteSchedule'));
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const getSchedulesForDay = (dayId) => {
        return schedules[dayId] || [];
    };

    const renderScheduleItem = (schedule, isDark) => {
        return (
            <View
                key={schedule.ID}
                style={[
                    styles.scheduleChip,
                    {
                        backgroundColor: isDark ? '#1a2642' : COLORS.primayLight,
                        borderColor: COLORS.primary
                    }
                ]}
            >
                <View style={styles.chipContent}>
                    <Text style={[
                        FONTS.fontSm,
                        { color: COLORS.primary, fontWeight: 'bold', flex: 1 }
                    ]}>
                        {schedule['Start Time']} - {schedule['End Time']}
                    </Text>
                    <TouchableOpacity
                        style={styles.deleteIconButton}
                        onPress={() => deleteSchedule(schedule.ID)}
                    >
                        <Text style={{ color: COLORS.danger, fontSize: 20, fontWeight: 'bold', lineHeight: 24 }}>×</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderDaySchedule = (dayId) => {
        const daySchedules = getSchedulesForDay(dayId);
        const dayName = i18next.language === 'ar' ? dayMapping[dayId].ar : dayMapping[dayId].en;
        const isDark = colorScheme === 'dark';

        return (
            <View
                key={dayId}
                style={[
                    styles.dayCard,
                    {
                        backgroundColor: isDark ? '#2c3f6d' : COLORS.white,
                        borderColor: isDark ? COLORS.darkBorder : COLORS.borderColor
                    }
                ]}
            >
                <View style={[
                    styles.dayHeader,
                    { flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row' }
                ]}>
                    <Text style={[
                        FONTS.h6,
                        {
                            color: isDark ? COLORS.white : COLORS.title,
                            flex: 1
                        }
                    ]}>
                        {dayName}
                    </Text>
                    <View style={[
                        styles.scheduleBadge,
                        { backgroundColor: daySchedules.length > 0 ? COLORS.primary : COLORS.textLight }
                    ]}>
                        <Text style={[FONTS.fontXs, { color: COLORS.white }]}>
                            {daySchedules.length}
                        </Text>
                    </View>
                </View>

                <View style={styles.scheduleContent}>
                    {daySchedules.length > 0 && (
                        <View style={styles.schedulesGrid}>
                            {daySchedules.map(schedule => renderScheduleItem(schedule, isDark))}
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: COLORS.primary }]}
                        onPress={() => openAddModal(dayId, dayName)}
                    >
                        <Text style={[FONTS.fontSm, { color: COLORS.white }]}>
                            + {t('Add')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white
        }}>
            <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
                <ThemedText style={{ textAlign: 'center', paddingVertical: 15 }} type="subtitle">
                    {t('WeeklySchedule')}
                </ThemedText>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ padding: 12 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {[1, 2, 3, 4, 5, 6, 7].map(dayId => renderDaySchedule(dayId))}
                </ScrollView>
            )}

            {/* Add Schedule Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={[
                        styles.modalContent,
                        { backgroundColor: colorScheme === 'dark' ? '#2c3f6d' : COLORS.white }
                    ]}>
                        <Text style={[
                            FONTS.h4,
                            {
                                color: colorScheme === 'dark' ? COLORS.white : COLORS.title,
                                marginBottom: 10,
                                textAlign: 'center'
                            }
                        ]}>
                            {t('AddSchedule')}
                        </Text>

                        {selectedDay && (
                            <Text style={[
                                FONTS.h5,
                                {
                                    color: COLORS.primary,
                                    marginBottom: 15,
                                    textAlign: 'center'
                                }
                            ]}>
                                {selectedDay.name}
                            </Text>
                        )}

                        <View style={[
                            styles.infoBox,
                            { backgroundColor: colorScheme === 'dark' ? '#1a2642' : COLORS.primayLight }
                        ]}>
                            <Text style={[
                                FONTS.fontSm,
                                {
                                    color: colorScheme === 'dark' ? COLORS.white : COLORS.title,
                                    textAlign: 'center'
                                }
                            ]}>
                                ℹ️ {t('ScheduleWillBeOneHour')}
                            </Text>
                        </View>

                        <View style={styles.pickerContainer}>
                            <Text style={[
                                FONTS.font,
                                { color: colorScheme === 'dark' ? COLORS.white : COLORS.title, marginBottom: 8 }
                            ]}>
                                {t('SelectStartTime')}
                            </Text>
                            <View style={[
                                styles.picker,
                                {
                                    backgroundColor: colorScheme === 'dark' ? '#1a2642' : COLORS.light,
                                    borderColor: colorScheme === 'dark' ? COLORS.darkBorder : COLORS.borderColor
                                }
                            ]}>
                                <Picker
                                    selectedValue={startTime}
                                    onValueChange={(value) => setStartTime(value)}
                                    style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.title }}
                                >
                                    {availableTimeSlots.map(time => (
                                        <Picker.Item
                                            key={time}
                                            label={`${time} - ${calculateEndTime(time)}`}
                                            value={time}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: COLORS.danger }]}
                                onPress={closeModal}
                            >
                                <Text style={[FONTS.font, { color: COLORS.white }]}>
                                    {t('Cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
                                onPress={createSchedule}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Text style={[FONTS.font, { color: COLORS.white }]}>
                                        {t('Create')}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayCard: {
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    dayHeader: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    scheduleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        minWidth: 24,
        alignItems: 'center',
    },
    scheduleContent: {
        gap: 8,
    },
    schedulesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    scheduleChip: {
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    chipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    deleteIconButton: {
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 2,
    },
    addButton: {
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    infoBox: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    pickerContainer: {
        marginBottom: 20,
    },
    picker: {
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Schedules;
