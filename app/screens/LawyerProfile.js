import React, { useEffect, useState } from 'react';
import Toast from 'react-native-simple-toast';
import SelectDropdown from 'react-native-select-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Chip from '../../components/Chip';
import { Calendar } from 'react-native-calendars';
import { SIZES, COLORS, FONTS, api_url } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { useTheme, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import TelrView from './TelrView';
import axios from 'axios';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, useColorScheme, Image, Modal, ActivityIndicator, TouchableOpacity, BackHandler, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedView } from "@/components/ThemedView";
import i18next from 'i18next';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

const LawyerProfile = () => {
    const [webViewVisible, setWebViewVisible] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState('');
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const [selectedDate, setSelectedDate] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const route = useRoute();
    const lawyerData = route.params;
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);
    const minDate = new Date().toISOString().split('T')[0];
    const [userData, setUserData] = useState();
    const [userType, setUserType] = useState();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [dayName, setDayName] = useState(null);
    const durationOptions = ["15 minutes", "30 minutes", "1 hour"];
    const [selectedDuration, setSelectedDuration] = useState("1 hour");
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const enabledDays = schedules.map(schedule => schedule.Day);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        getUserData();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (router.canGoBack()) {
                    router.back();
                } else {
                    router.push('/(drawer)/clientele/Home');
                }
                return true; // Prevent default back action
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );

    const getUserData = async () => {
        try {
            const userDataJson = await AsyncStorage.getItem('userData');
            if (userDataJson) {
                const userData = JSON.parse(userDataJson);
                setUserData(userData.userData);
                setUserType(userData.userType);
            }
        } catch (error) {
            console.log('Error fetching user data:', error);
        }
    };

    const isDayEnabled = (date) => {
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        return enabledDays.includes(dayName);
    };

    const markedDates = {};

    for (let i = 0; i < 365; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const formattedDate = date.toISOString().split('T')[0];

        markedDates[formattedDate] = {
            disabled: !isDayEnabled(formattedDate),
            selected: formattedDate === selectedDate, // Highlight selected date
            selectedColor: COLORS.primary, // Change background color
            selectedTextColor: COLORS.white, // Change text color
        };
    }

    const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const d = new Date(day.dateString);
        const nameOfDay = days[d.getDay()];
        setDayName(nameOfDay);
        // setShowTimePicker(true);
    };

    const fetchSchedules = async () => {
        setLoading(true); // Start loading before fetching
        try {
            const response = await fetch(`${api_url}lawyer/${lawyerData.id}/schedules`);
            const { schedules } = await response.json();


            console.log('Fetched schedules:', schedules); // Debug log
            if (response.ok) {
                setSchedules(schedules);
            } else {
                Toast.show('This lawyer has no schedule', Toast.LONG);
            }
        } catch (error) {
            console.log('Error fetching schedules:', error);
        } finally {
            setLoading(false); // Stop loading after fetching
        }
    };

    const onModalOpen = () => {
        fetchSchedules();
        // Set current date as default selected date
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
    };

    const getAvailableTimeSlots = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const d = new Date(selectedDate);
        const dayName = days[d.getDay()];
        if (!selectedDate) {
            return null;
        }
        const selectedDaySchedules = schedules.filter(schedule => schedule.Day.toLowerCase() === dayName.toLowerCase());
        if (selectedDaySchedules.length === 0) {
            return [];
        }

        // Generate time slots based on selected duration
        const timeSlots = [];

        selectedDaySchedules.forEach(schedule => {
            const startTime = schedule["Start Time"];
            const endTime = schedule["End Time"];

            // Parse time (format: "HH:MM AM/PM")
            const parseTime = (timeStr) => {
                const [time, period] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);

                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;

                return { hours, minutes };
            };

            const formatTime = (hours, minutes) => {
                const period = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00 ${period}`;
            };

            // Format time for display without seconds
            const formatTimeForDisplay = (timeStr) => {
                return timeStr.replace(/:00 /, ' ');
            };

            const start = parseTime(startTime);
            const end = parseTime(endTime);

            // Convert to minutes for easier calculation
            const startMinutes = start.hours * 60 + start.minutes;
            const endMinutes = end.hours * 60 + end.minutes;

            // Determine slot duration based on selected duration
            let slotDuration = 60; // default
            if (selectedDuration === "15 minutes") {
                slotDuration = 15;
            } else if (selectedDuration === "30 minutes") {
                slotDuration = 30;
            }

            // Generate slots
            for (let time = startMinutes; time < endMinutes; time += slotDuration) {
                const slotHours = Math.floor(time / 60);
                const slotMinutes = time % 60;
                const slotEndTime = time + slotDuration;
                const slotEndHours = Math.floor(slotEndTime / 60);
                const slotEndMinutes = slotEndTime % 60;

                const slotStart = formatTime(slotHours, slotMinutes);
                const slotEnd = formatTime(slotEndHours, slotEndMinutes);

                timeSlots.push({
                    scheduleID: schedule["ID"],
                    startTime: slotStart,
                    endTime: slotEnd,
                    displayText: `${formatTimeForDisplay(slotStart)} - ${formatTimeForDisplay(slotEnd)}`
                });
            }
        });

        return timeSlots;
    };

    const scheduleNotifications = async (appointmentDetails) => {
        // 1. Immediate notification
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Appointment Confirmed 📅',
                body: `With ${appointmentDetails.lawyer_name} at ${appointmentDetails.appointment_start_time} on ${appointmentDetails.date}`,
                data: { appointmentId: '123' }, // optional
            },
            trigger: null, // triggers immediately
        });

        // 2. 10 minutes before notification
        const appointmentDateTime = new Date(`${appointmentDetails.date} ${appointmentDetails.appointment_start_time}`);
        const notificationTime = new Date(appointmentDateTime.getTime() - 10 * 60000); // minus 10 mins

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Upcoming Appointment ⏰',
                body: `Your appointment with ${appointmentDetails.lawyer_name} starts in 10 minutes.`,
            },
            trigger: notificationTime,
        });
    };

    const createAppointment = async () => {
        if (!selectedTimeSlot) {
            Toast.show('Please select a time slot', Toast.LONG);
            return;
        }

        try {
            let amount = 0;
            let duration = 0;
            if (selectedDuration === "15 minutes") {
                amount = lawyerData.fee;
                duration = 15;
            } else if (selectedDuration === "30 minutes") {
                amount = lawyerData.fee_half_hour;
                duration = 30;
            } else if (selectedDuration === "1 hour") {
                amount = lawyerData.fee_hour;
                duration = 60;
            }

            const appointmentRequestBody = {
                user_id: userData.user.id,
                lawyer_id: lawyerData.id,
                lawyer_name: lawyerData.name,
                // department_id: lawyerData.department_id,
                date: selectedDate,
                appointment_start_time: selectedTimeSlot.startTime,
                fee: amount,
                duration: duration,
                schedule_id: selectedTimeSlot.scheduleID,
                fname: userData.user.name,
                lname: userData.user.lname,
                email: userData.user.email,
                phone: userData.user.phone,
            };

            console.log('Appointment Request Body:', appointmentRequestBody); // Debug log

            const token = await AsyncStorage.getItem('jwtToken');
            const response = await axios.post(`${api_url}telr-payment-form`, appointmentRequestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const { url } = response.data;
            setPaymentUrl(url);
            setWebViewVisible(true);
            setModalVisible(false);
        } catch (error) {
            console.log('Error creating appointment:', error);
            console.log('Error creating appointment:', error.message);
            console.log('Error creating appointment response:', error.response);
            if (error.response) {
                Toast.show('Failed to create appointment: ' + (error.response.data.error || 'Server error occurred.'), Toast.LONG);
            } else if (error.request) {
                Toast.show('Failed to create appointment: No response received from the server.', Toast.LONG);
            } else {
                Toast.show('Failed to create appointment: ' + error.message, Toast.LONG);
            }
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={[GlobalStyleSheet.container, { backgroundColor: COLORS.primary }]}>
                    <ThemedView
                        style={{
                            alignItems: 'flex-start',
                            paddingTop: 30,
                            paddingBottom: 20,
                            flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row', // Ensure RTL behavior
                            gap: 10
                        }}
                        backgroundColor='transparent'
                    >
                        <ThemedView
                            style={{
                                width: '30%',
                                borderRadius: 5,
                                borderWidth: 2,
                                padding: 3
                            }}
                            backgroundColor='white'
                        >
                            <Image
                                style={{
                                    height: 100,
                                    width: '100%',
                                    borderRadius: 5,
                                    resizeMode: 'contain'
                                }}
                                source={{ uri: lawyerData.image }}
                            />
                        </ThemedView>
                        <ThemedView
                            style={{
                                width: '70%',
                                alignItems: i18next.language === 'ar' ? 'flex-end' : 'flex-start', // Adjust alignment dynamically 
                            }}
                            backgroundColor='transparent'
                        >
                            <ThemedText type="title" >
                                {i18next.language === 'ar' ? lawyerData.ar_name : lawyerData.name}
                            </ThemedText>
                            {/* client wanted these removed Ref: Task#9 */}
                            {/* <Text
                                style={{
                                    color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg,
                                    textAlign: i18next.language === 'ar' ? 'right' : 'left'
                                }}
                            >
                                {i18next.language === 'ar' ? lawyerData.ar_designations : lawyerData.designations}
                            </Text> */}
                        </ThemedView>
                    </ThemedView>

                    <ThemedButton
                        title={
                            userType === 'client' || userType === 'lawyer'
                                ? t('MakeAnAppointment')
                                : t('SignUptoMakeanAppointment')
                        }
                        type='secondary'
                        delayed={true}
                        onPress={async () => {
                            if (userType === 'client' || userType === 'lawyer') {
                                try {
                                    const userDataString = await AsyncStorage.getItem('userData');
                                    const parsed = userDataString ? JSON.parse(userDataString) : null;
                                    const user = parsed?.userData?.user;

                                    if (!user?.email || !user?.phone) {
                                        Alert.alert(
                                            t('IncompleteProfile'),
                                            t('UpdateEmailPhone'),
                                            [
                                                {
                                                    text: t('MyProfile'),
                                                    onPress: () => router.push('/screens/Profile'),
                                                },
                                                { text: t('Cancel'), style: 'cancel' },
                                            ]
                                        );
                                        return;
                                    }

                                    setModalVisible(true); // All good
                                } catch (error) {
                                    console.error('Error checking user data:', error);
                                    Alert.alert('Error', 'Could not verify profile data. Please try again.');
                                }
                            } else {
                                router.push('/screens/auth/SignIn');
                            }
                        }}
                    />
                </View>
                <View style={{ margin: 15, borderRadius: 5, flexDirection: 'row', zIndex: 1, backgroundColor: '#28363B', padding: 5 }}>
                    <View style={[styles.tabItem, { backgroundColor: '#28363B', borderRightWidth: 2 }]}>
                        <Text style={[FONTS.font, { color: COLORS.white }]}>{t('QuarterFee')}</Text>
                        <Text style={[FONTS.fontSm, { color: COLORS.white, marginBottom: 2 }]}>د.إ {lawyerData.fee}</Text>
                        <View style={{ height: 5, width: 40, borderRadius: 5, position: 'absolute', bottom: -5, backgroundColor: COLORS.primary }} />
                    </View>
                    <View style={[styles.tabItem, { backgroundColor: '#28363B', borderRightWidth: 2 }]}>
                        <Text style={[FONTS.font, { color: COLORS.white }]}>{t('HalfHourFee')}</Text>
                        <Text style={[FONTS.fontSm, { color: COLORS.white, marginBottom: 2 }]}>د.إ {lawyerData.fee_half_hour}</Text>
                        <View style={{ height: 5, width: 40, borderRadius: 5, position: 'absolute', bottom: -5, backgroundColor: COLORS.primary }} />
                    </View>
                    <View style={[styles.tabItem, { backgroundColor: '#28363B' }]}>
                        <Text style={[FONTS.font, { color: COLORS.white }]}>{t('HourlyFee')}</Text>
                        <Text style={[FONTS.fontSm, { color: COLORS.white, marginBottom: 2 }]}>د.إ {lawyerData.fee_hour}</Text>
                        <View style={{ height: 5, width: 40, borderRadius: 5, position: 'absolute', bottom: -5, backgroundColor: COLORS.primary }} />
                    </View>
                </View>
                <View style={GlobalStyleSheet.container}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={[FONTS.h3, { color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: 'justify' }]}>{t('Aboutthelawyer')}</Text>
                        <Chip style={{ marginLeft: 20 }} chipSmall title={lawyerData.is_online == 1 ? t('Online') : t('Offline')} />
                    </View>
                    <Text style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{i18next.language === 'ar' ? lawyerData.ar_about : lawyerData.about}</Text>
                </View>

                <Modal animationType="slide" transparent={true} visible={modalVisible} onShow={onModalOpen} onRequestClose={() => { setModalVisible(false); }}>
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={{ backgroundColor: colorScheme === 'light' ? COLORS.white : COLORS.betabg, padding: 20, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderTopWidth: 3, borderColor: COLORS.primary }}>
                            <View style={{ marginBottom: 15, gap: 10 }}>
                                <ThemedButton
                                    title={t('Close')}
                                    type='primary'
                                    onPress={() => {
                                        setModalVisible(false);
                                        setSelectedDate(null);
                                        setSelectedTimeSlot(null);
                                        setSelectedDuration("1 hour");
                                    }}
                                />
                                <Text style={[FONTS.h3, { color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: 'center', marginBottom: 10 }]}>{t('SelectAppointmentDate')}</Text>
                                <View>
                                    {loading ? (
                                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                                    ) : (
                                        <Calendar
                                            minDate={minDate}
                                            markedDates={markedDates}
                                            disableAllTouchEventsForDisabledDays={true}
                                            firstDay={1}
                                            enableSwipeMonths={true}
                                            onDayPress={handleDayPress}
                                            theme={{
                                                calendarBackground: colorScheme === 'dark' ? COLORS.betabg : COLORS.white,
                                                dayTextColor: colorScheme === 'dark' ? COLORS.white : COLORS.betabg,
                                                textDisabledColor: colorScheme === 'dark' ? '#ffffff20' : '#00000020',
                                            }}
                                            style={{
                                                borderWidth: 1,
                                                borderColor: COLORS.primary,
                                                borderRadius: 5,
                                            }}
                                        />
                                    )}
                                </View>
                            </View>
                            {selectedDate && (
                                <>
                                    <Text style={[FONTS.h5, { color: colorScheme === 'dark' ? COLORS.white : colors.title, marginBottom: 10, textAlign: i18next.language === 'ar' ? 'right' : 'left' }]}>{t('SelectDuration')}</Text>
                                    <SelectDropdown
                                        data={durationOptions}
                                        onSelect={(selectedItem, index) => {
                                            setSelectedDuration(selectedItem);
                                            setSelectedTimeSlot(null); // Reset selected time slot when duration changes
                                        }}
                                        buttonTextAfterSelection={(selectedItem, index) => {
                                            return selectedItem;
                                        }}
                                        rowTextForSelection={(item, index) => {
                                            return item;
                                        }}
                                        defaultButtonText={selectedDuration}
                                        defaultValue={selectedDuration}
                                        dropdownStyle={styles.dropdownMenuStyle}
                                        showsVerticalScrollIndicator={false}
                                        renderButton={(selectedItem) => {
                                            return (
                                                <View style={styles.dropdownButtonStyle}>
                                                    <Text style={styles.dropdownButtonTxtStyle}>
                                                        {selectedDuration || t('DurationForAppointment')}
                                                    </Text>
                                                </View>
                                            );
                                        }}
                                        renderItem={(item, isSelected) => {
                                            return (
                                                <View style={{ flexDirection: "row", ...styles.dropdownItemStyle }}>
                                                    <Text>{item}</Text>
                                                </View>
                                            );
                                        }}
                                    />

                                    {/* Time Slot Chips */}
                                    {selectedDuration && (
                                        <>
                                            <Text style={[FONTS.h5, { color: colorScheme === 'dark' ? COLORS.white : colors.title, marginTop: 15, marginBottom: 10, textAlign: i18next.language === 'ar' ? 'right' : 'left' }]}>
                                                {t('SelectTimeSlot')}
                                            </Text>

                                            {getAvailableTimeSlots() && getAvailableTimeSlots().length > 0 ? (
                                                <View style={styles.timeSlotsContainer}>
                                                    {getAvailableTimeSlots().map((slot, index) => (
                                                        <TouchableOpacity
                                                            key={index}
                                                            style={[
                                                                styles.timeSlotChip,
                                                                selectedTimeSlot?.displayText === slot.displayText && styles.timeSlotChipSelected
                                                            ]}
                                                            onPress={() => setSelectedTimeSlot(slot)}
                                                        >
                                                            <Text style={[
                                                                styles.timeSlotChipText,
                                                                selectedTimeSlot?.displayText === slot.displayText && styles.timeSlotChipTextSelected
                                                            ]}>
                                                                {slot.displayText}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            ) : (
                                                <Text style={[FONTS.font, { color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: 'center', marginVertical: 15 }]}>
                                                    {t('NoSchedulesAvailable')}
                                                </Text>
                                            )}

                                            {/* Make Appointment Button - Always visible */}
                                            <View style={{ marginTop: 20, opacity: (!selectedDate || !selectedDuration || !selectedTimeSlot) ? 0.5 : 1 }}>
                                                <ThemedButton
                                                    title={t('MakeAnAppointment')}
                                                    type='primary'
                                                    onPress={createAppointment}
                                                    disabled={!selectedDate || !selectedDuration || !selectedTimeSlot}
                                                />
                                            </View>
                                        </>
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                </Modal>
            </ScrollView>
            <TelrView isVisible={webViewVisible} url={paymentUrl} onClose={() => setWebViewVisible(false)} />
            {showSuccessModal &&
                <View style={styles.container}>
                    <View style={{ alignItems: 'center', paddingHorizontal: 30, paddingVertical: 25, backgroundColor: colorScheme === 'dark' ? COLORS.betabg : COLORS.white, borderRadius: SIZES.radius, width: '85%', position: 'absolute' }}>
                        <FontAwesome style={{ marginBottom: 10 }} color={COLORS.primary} size={100} name="check" />
                        <Text style={{ ...FONTS.h5, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: 'center' }}>Appointment Booked!</Text>
                        <Text style={{ ...FONTS.font, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: 'center' }}>Thanks You!</Text>
                        <View style={{ width: '100%', marginTop: 30 }}>
                            <ThemedButton
                                title={t('Close')}
                                type='primary'
                                onPress={async () => {
                                    if (selectedTimeSlot) {
                                        await scheduleNotifications({
                                            lawyer_name: i18next.language === 'ar' ? lawyerData.ar_name : lawyerData.name,
                                            date: selectedDate,
                                            appointment_start_time: selectedTimeSlot.startTime,
                                        });
                                    }

                                    setShowSuccessModal(false);
                                    router.push('/(drawer)/clientele/Home');
                                    router.replace('/(drawer)/clientele/Home'); // Refresh screen
                                }}
                            />
                        </View>
                    </View>
                </View>
            }
        </SafeAreaView>
    );
};

export default LawyerProfile;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    closeButton: {
        paddingVertical: 18,
        marginBottom: 10,
        borderRadius: 5,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: COLORS.primary
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    input: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 10,
        color: COLORS.primary,
        borderWidth: 1,
        borderColor: COLORS.primary
    },
    dropdownButtonStyle: {
        width: '100%',
        minHeight: 50,
        backgroundColor: '#E9ECEF',
        borderRadius: SIZES.radius,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        textAlign: i18next.language === 'ar' ? 'right' : 'left'
    },
    dropdownButtonStyle2: {
        width: '25%',
        height: 50,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
    },
    dropdownMenuStyle: {
        backgroundColor: '#E9ECEF',
        borderRadius: SIZES.radius,
        textAlign: i18next.language === 'ar' ? 'right' : 'left'
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1
    },
    timeSlotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 5,
    },
    timeSlotChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#E9ECEF',
        borderWidth: 2,
        borderColor: '#E9ECEF',
        minWidth: '45%',
        alignItems: 'center',
        marginBottom: 5,
    },
    timeSlotChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    timeSlotChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#151E26',
    },
    timeSlotChipTextSelected: {
        color: COLORS.white,
    },
});