import Chip from './Chip';
import { Calendar } from 'react-native-calendars';
import { useEffect, useState } from 'react';
import { FONTS, COLORS, api_url } from '../constants/theme';
import { useTheme, useNavigation } from '@react-navigation/native';
import { ThemedButton } from "@/components/ThemedButton";
import { Text, View, useColorScheme, BackHandler, Modal, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const UserAppointments = ({ userData, userType, appointmentData, title, chipTitle, btnTitle, navRoute, onRefresh }) => {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState(null);
  const [scheduleDuration, setScheduleDuration] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    setLoading(false);
  }, []);

  appointmentData.sort((a, b) => {
    return new Date(b['Appointment Date']) - new Date(a['Appointment Date']);
  });

  const handleButtonPress = (appointment) => {
    setSelectedAppointment(appointment);
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSelectedAppointment(null);
  };

  const isWithinTwoDays = (createdOn) => {
    const currentDate = new Date();
    const createdDate = new Date(createdOn);
    const diffInTime = currentDate.getTime() - createdDate.getTime();
    const diffInHours = diffInTime / (1000 * 3600);
    return diffInHours >= 0 && diffInHours <= 48;
  };

  // Generate all time slots from 12:00 AM to 10:00 PM (each 1 hour)
  const allTimeSlots = [
    '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
  ];

  const calculateEndTime = (start) => {
    const index = allTimeSlots.indexOf(start);
    if (index === -1 || index === allTimeSlots.length - 1) {
      return '11:00 PM';
    }
    return allTimeSlots[index + 1];
  };

  const openRescheduleModal = () => {
    if (!selectedAppointment) return;

    // Set default values
    setRescheduleDate(selectedAppointment['Appointment Date']);
    setRescheduleTime(selectedAppointment['Appointment Time']);
    setScheduleDuration(selectedAppointment['Duration'] || 30);
    setRescheduleError('');

    setShowSuccessModal(false);
    setShowRescheduleModal(true);

    // Generate time slots excluding current appointment time
    generateTimeSlots();
  };

  const generateTimeSlots = () => {
    // Filter out the current appointment time
    const currentTime = selectedAppointment['Appointment Time'];
    const slots = allTimeSlots
      .filter(time => time !== currentTime)
      .map(time => ({
        startTime: time,
        endTime: calculateEndTime(time)
      }));

    setAvailableTimeSlots(slots);
  };

  const handleDateSelect = (day) => {
    setRescheduleDate(day.dateString);
    setRescheduleTime(null); // Reset time when date changes
    setShowCalendar(false);
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError(t('PleaseSelectDateAndTime'));
      return;
    }

    setRescheduleLoading(true);
    setRescheduleError('');

    try {
      const apiUrl = `${api_url}user/${selectedAppointment['Appointment ID']}/reschedule`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: rescheduleDate,
          appointment_start_time: rescheduleTime,
          duration: scheduleDuration
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `Error: ${response.statusText}`);
      }

      Alert.alert(t('Success'), t('AppointmentRescheduledSuccessfully'));
      setShowRescheduleModal(false);
      setSelectedAppointment(null);

      // Refresh the appointments list
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
      setRescheduleError(error.message || t('FailedToRescheduleAppointment'));
    } finally {
      setRescheduleLoading(false);
    }
  };

  const closeRescheduleModal = () => {
    setShowRescheduleModal(false);
    setShowCalendar(false);
    setRescheduleDate(null);
    setRescheduleTime(null);
    setScheduleDuration(null);
    setAvailableTimeSlots([]);
    setRescheduleError('');
  };

  const renderedLawyers = appointmentData.map((appointment, index) => {
    const appointmentDate = new Date(appointment['Appointment Date']);
    const isActive = appointmentDate >= new Date();

    return (
      <TouchableOpacity key={index} onPress={() => handleButtonPress(appointment)}>
        <View style={[{ backgroundColor: colorScheme === 'light' ? COLORS.white : COLORS.betabg, padding: 10, borderRadius: 5, marginBottom: 10, borderWidth: 1, borderColor: colorScheme === 'light' ? COLORS.primary : COLORS.betabg, opacity: isActive ? 1 : 0.75, }]}>
          <View style={{ flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle" style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, fontSize: 18, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('Name')}: {userType === 'lawyer' ? appointment['User Name'] : appointment['Lawyer Name']}</ThemedText>
              <ThemedText type="link" style={{ textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('AppointmentDate')}: {appointment['Appointment Date']}</ThemedText>
              <ThemedText style={{ ...FONTS.font, ...FONTS.fontPoppins, color: COLORS.primary, textAlign: i18next.language === 'ar' ? 'right' : 'left' }} type="link">{t('AppointmentTime')}: {appointment['Appointment Time']}</ThemedText>
            </View>
            <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Chip chipSmall title={isActive ? "Active" : "Inactive"} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  return (
    <>
      <View style={{ borderBottomWidth: 1, borderColor: colors.borderColor, marginBottom: 10, paddingBottom: 5, flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ ...FONTS.h5, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{title}</Text>
        {chipTitle && <Chip title={chipTitle} onPress={() => navigation.navigate(navRoute)} />}
        {btnTitle && <ThemedButton title={btnTitle} type='default' onPress={() => navigation.navigate(navRoute)} />}
      </View>
      {loading ? <ActivityIndicator size="large" color={COLORS.primary} /> : <View>{renderedLawyers}</View>}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <Modal visible={showSuccessModal} animationType="slide" transparent={true} onRequestClose={handleCloseModal}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={{ backgroundColor: colorScheme === 'light' ? COLORS.white : COLORS.betabg, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderColor: COLORS.primary }}>
              <Text style={{ fontSize: 30, ...FONTS.fontPoppins, marginBottom: 10, color: colorScheme === 'light' ? COLORS.text : COLORS.white, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('AppointmentDetails')}</Text>
              <Text style={{ fontSize: 22, ...FONTS.fontPoppins, color: colorScheme === 'light' ? COLORS.text : COLORS.white, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('Name')}: {userType === 'lawyer' ? selectedAppointment['User Name'] : selectedAppointment['Lawyer Name']}</Text>
              <Text style={{ fontSize: 18, ...FONTS.fontPoppins, color: COLORS.primary, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('AppointmentDate')}: {new Date(selectedAppointment['Appointment Date']).toLocaleDateString()}</Text>
              <Text style={{ fontSize: 18, ...FONTS.fontPoppins, color: COLORS.primary, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('AppointmentTime')}: {selectedAppointment['Appointment Time']}</Text>
              <Text style={{ marginBottom: 15, fontSize: 18, ...FONTS.fontPoppins, color: COLORS.primary, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('PaymentStatus')}: {selectedAppointment['Payment Status'] === 1 ? "Paid" : "Pending"}</Text>
              {isWithinTwoDays(selectedAppointment['Created On']) && (
                <TouchableOpacity
                  style={[{ backgroundColor: colorScheme === 'light' ? COLORS.black : COLORS.primary, paddingHorizontal: 10, paddingVertical: 16, alignItems: 'center', borderRadius: 5, marginBottom: 10 }]}
                  onPress={openRescheduleModal}
                >
                  <Text style={{ textAlign: 'center', ...FONTS.h5, color: colorScheme === 'light' ? COLORS.white : COLORS.betabg }}>{t('Reschedule')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleCloseModal} style={[{ backgroundColor: colorScheme === 'light' ? COLORS.black : COLORS.primary, paddingHorizontal: 10, paddingVertical: 16, alignItems: 'center', borderRadius: 5 }]}>
                <Text style={{ ...FONTS.h5, ...FONTS.fontPoppins, color: colorScheme === 'light' ? COLORS.white : COLORS.betabg }}>{t('Close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <Modal visible={showRescheduleModal} animationType="slide" transparent={true} onRequestClose={closeRescheduleModal}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={{ backgroundColor: colorScheme === 'light' ? COLORS.white : COLORS.betabg, padding: 20, borderRadius: 15, width: '90%', maxHeight: '80%' }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={{ fontSize: 24, ...FONTS.fontPoppins, marginBottom: 15, color: colorScheme === 'light' ? COLORS.text : COLORS.white, textAlign: 'center' }}>
                  {t('RescheduleAppointment')}
                </Text>

                {/* Date Field */}
                <Text style={{ fontSize: 16, ...FONTS.fontPoppins, color: colorScheme === 'light' ? COLORS.text : COLORS.white, marginBottom: 8, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                  {t('AppointmentDate')}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: colorScheme === 'light' ? COLORS.light : '#2c3f6d',
                    padding: 15,
                    borderRadius: 8,
                    marginBottom: 15,
                    borderWidth: 1,
                    borderColor: COLORS.primary
                  }}
                  onPress={() => setShowCalendar(true)}
                >
                  <Text style={{ fontSize: 16, color: colorScheme === 'light' ? COLORS.text : COLORS.white, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                    {rescheduleDate ? new Date(rescheduleDate).toLocaleDateString() : t('SelectDate')}
                  </Text>
                </TouchableOpacity>

                {/* Time Field */}
                <Text style={{ fontSize: 16, ...FONTS.fontPoppins, color: colorScheme === 'light' ? COLORS.text : COLORS.white, marginBottom: 8, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                  {t('AppointmentTime')}
                </Text>
                <View style={{ marginBottom: 15, maxHeight: 150 }}>
                  <ScrollView style={{ maxHeight: 150 }}>
                    {availableTimeSlots.map((slot, index) => (
                      <TouchableOpacity
                        key={index}
                        style={{
                          backgroundColor: rescheduleTime === slot.startTime ? COLORS.primary : (colorScheme === 'light' ? COLORS.light : '#2c3f6d'),
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 8,
                          borderWidth: 1,
                          borderColor: rescheduleTime === slot.startTime ? COLORS.primary : (colorScheme === 'light' ? COLORS.borderColor : COLORS.darkBorder)
                        }}
                        onPress={() => setRescheduleTime(slot.startTime)}
                      >
                        <Text style={{
                          fontSize: 15,
                          color: rescheduleTime === slot.startTime ? COLORS.white : (colorScheme === 'light' ? COLORS.text : COLORS.white),
                          textAlign: 'center',
                          fontWeight: rescheduleTime === slot.startTime ? 'bold' : 'normal'
                        }}>
                          {slot.startTime} - {slot.endTime}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Error Message */}
                {rescheduleError ? (
                  <Text style={{ fontSize: 14, color: COLORS.danger, marginBottom: 15, textAlign: 'center' }}>
                    {rescheduleError}
                  </Text>
                ) : null}

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={closeRescheduleModal}
                    style={{
                      flex: 1,
                      backgroundColor: COLORS.danger,
                      padding: 15,
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ ...FONTS.h6, color: COLORS.white }}>{t('Cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleReschedule}
                    disabled={rescheduleLoading || !rescheduleTime || !rescheduleDate}
                    style={{
                      flex: 1,
                      backgroundColor: (rescheduleLoading || !rescheduleTime || !rescheduleDate) ? COLORS.textLight : COLORS.primary,
                      padding: 15,
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                  >
                    {rescheduleLoading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={{ ...FONTS.h6, color: COLORS.white }}>{t('Confirm')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <Modal visible={showCalendar} animationType="fade" transparent={true} onRequestClose={() => setShowCalendar(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={{ backgroundColor: colorScheme === 'light' ? COLORS.white : COLORS.betabg, padding: 20, borderRadius: 10, width: '90%' }}>
              <Text style={{ fontSize: 20, ...FONTS.fontPoppins, marginBottom: 15, color: colorScheme === 'light' ? COLORS.text : COLORS.white, textAlign: 'center' }}>
                {t('SelectDate')}
              </Text>
              <Calendar
                onDayPress={handleDateSelect}
                minDate={new Date().toISOString().split('T')[0]}
                theme={{
                  calendarBackground: colorScheme === 'dark' ? COLORS.betabg : COLORS.white,
                  dayTextColor: colorScheme === 'dark' ? COLORS.white : COLORS.betabg,
                  textDisabledColor: colorScheme === 'dark' ? '#ffffff20' : '#00000020',
                  selectedDayBackgroundColor: COLORS.primary,
                  todayTextColor: COLORS.primary,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowCalendar(false)}
                style={{ marginTop: 15, backgroundColor: COLORS.danger, padding: 12, borderRadius: 8 }}
              >
                <Text style={{ color: COLORS.white, textAlign: 'center', ...FONTS.h6 }}>{t('Cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default UserAppointments;
