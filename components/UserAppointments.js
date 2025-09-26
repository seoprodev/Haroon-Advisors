import Chip from './Chip';
import { Calendar } from 'react-native-calendars';
import { useEffect, useState } from 'react';
import { FONTS, COLORS, api_url } from '../constants/theme';
import { useTheme, useNavigation } from '@react-navigation/native';
import { ThemedButton } from "@/components/ThemedButton";
import { Text, View, useColorScheme, BackHandler, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const UserAppointments = ({ userData, userType, appointmentData, title, chipTitle, btnTitle, navRoute }) => {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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

  // const isWithinTwoDays = (createdOn) => {
  //   const currentDate = new Date();
  //   const createdDate = new Date(createdOn);
  //   const diffInTime = createdDate.getTime() - currentDate.getTime();
  //   const diffInDays = diffInTime / (1000 * 3600 * 24);
  //   return diffInDays <= 2 && diffInDays > 0;
  // };

  const isWithinTwoDays = (createdOn) => {
    const currentDate = new Date();
    const createdDate = new Date(createdOn);
    const diffInTime = currentDate.getTime() - createdDate.getTime(); // note the order
    const diffInHours = diffInTime / (1000 * 3600); // convert to hours
    return diffInHours >= 0 && diffInHours <= 48;
  };

  const handleReschedule = async (newDate, appointmentID) => {
    if (!selectedAppointment) return;
    try {
      const apiUrl = `${api_url}user/${appointmentID}/reschedule`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: newDate }),
      });
      if (!response.ok) {
        throw new Error(`Error updating appointment: ${response.statusText}`);
      }
      setShowCalendar(false);
    } catch (error) {
      console.log('Failed to update appointment date:', error);
    }
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
        {btnTitle && <ThemedButton title={btnTitle} type='default' onPress={() => router.push(navRoute)} />}
      </View>
      {loading ? <ActivityIndicator size="large" color={COLORS.primary} /> : <View>{renderedLawyers}</View>}
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
                <TouchableOpacity style={[{ backgroundColor: colorScheme === 'light' ? COLORS.black : COLORS.primary, paddingHorizontal: 10, paddingVertical: 16, alignItems: 'center', borderRadius: 5, marginBottom: 10 }]} onPress={() => { setShowSuccessModal(false); setShowCalendar(true) }}>
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
      {showCalendar && (
        <Modal visible={showCalendar} animationType="slide" transparent={true} onRequestClose={() => setShowCalendar(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={{ backgroundColor: colorScheme === 'light' ? COLORS.white : COLORS.betabg, padding: 20, borderRadius: 10 }}>
              <Calendar onDayPress={(day) => {
                alert(`Appointment rescheduled to ${day.dateString}`);
                handleReschedule(day.dateString, selectedAppointment['Appointment ID']);
                setShowCalendar(false);
              }}
              />
              <TouchableOpacity onPress={() => setShowCalendar(false)} style={{ marginTop: 20, backgroundColor: COLORS.primary, padding: 10, borderRadius: 5 }}>
                <Text style={{ color: COLORS.white, textAlign: 'center', ...FONTS.h5 }}>{t('Close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default UserAppointments;