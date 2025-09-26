import React, { useEffect, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import { COLORS, FONTS, base_url } from '../../../constants/theme';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, useColorScheme, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedView } from "@/components/ThemedView";
import i18next from 'i18next';
import Chip from '../../../components/Chip';
import { router } from 'expo-router';

const Schedules = ({ navigation }) => {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const { t } = useTranslation();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const userDataJson = await AsyncStorage.getItem('userData');
                if (userDataJson) {
                    const userData = JSON.parse(userDataJson);
                    setUserData(userData);
                }
            } catch (error) {
                console.log('Error fetching user data:', error);
            }
        };

        getUserData();
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }}>
            {userData && (
                <>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

                        <View style={[GlobalStyleSheet.container, { backgroundColor: COLORS.primary }]}>
                            <ThemedView style={{ alignItems: 'center', paddingTop: 30, paddingBottom: 20, flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row', gap: 10 }} backgroundColor='transparent'>
                                <ThemedView style={{ width: '30%', borderRadius: 5, borderWidth: 2, padding: 3 }} backgroundColor='transparent'>
                                    <Image style={{ height: 100, width: '100%', borderRadius: 5, resizeMode: 'cover' }} source={{ uri: userData.userData.user.image }} />
                                </ThemedView>
                                <ThemedView style={{ width: '70%' }} backgroundColor='transparent'>
                                    <ThemedText style={{ textAlign: i18next.language === 'ar' ? 'right' : 'left' }} type="title">{i18next.language === 'ar' ? userData.userData.user.ar_name : userData.userData.user.name}</ThemedText>
                                    <ThemedText style={{ textAlign: i18next.language === 'ar' ? 'right' : 'left' }} type="default">{i18next.language === 'ar' ? userData.userData.user.ar_designations : userData.userData.user.designations}</ThemedText>
                                </ThemedView>
                            </ThemedView>
                            <ThemedButton title={t('CheckNewAppointments')} type='secondary' onPress={() => router.push({ pathname: '/(drawer)/lawyerele/LawyerHome', })} />
                        </View>
                        <View style={{ margin: 15, borderRadius: 5, flexDirection: 'row', zIndex: 1, backgroundColor: '#28363B', padding: 5 }}>
                            <View style={[styles.tabItem, { backgroundColor: '#28363B', borderRightWidth: 2 }]}>
                                <Text style={[FONTS.font, { color: COLORS.white }]}>{t('QuarterFee')}</Text>
                                <Text style={[FONTS.fontSm, { color: COLORS.white, marginBottom: 2 }]}>د.إ {userData.userData.user.fee}</Text>
                                <View style={{ height: 5, width: 40, borderRadius: 5, position: 'absolute', bottom: -5, backgroundColor: COLORS.primary }} />
                            </View>
                            <View style={[styles.tabItem, { backgroundColor: '#28363B', borderRightWidth: 2 }]}>
                                <Text style={[FONTS.font, { color: COLORS.white }]}>{t('HalfHourFee')}</Text>
                                <Text style={[FONTS.fontSm, { color: COLORS.white, marginBottom: 2 }]}>د.إ {userData.userData.user.fee_half_hour}</Text>
                                <View style={{ height: 5, width: 40, borderRadius: 5, position: 'absolute', bottom: -5, backgroundColor: COLORS.primary }} />
                            </View>
                            <View style={[styles.tabItem, { backgroundColor: '#28363B' }]}>
                                <Text style={[FONTS.font, { color: COLORS.white }]}>{t('HourlyFee')}</Text>
                                <Text style={[FONTS.fontSm, { color: COLORS.white, marginBottom: 2 }]}>د.إ {userData.userData.user.fee_hour}</Text>
                                <View style={{ height: 5, width: 40, borderRadius: 5, position: 'absolute', bottom: -5, backgroundColor: COLORS.primary }} />
                            </View>
                        </View>
                        <View style={GlobalStyleSheet.container}>
                            <View style={{ flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={[FONTS.h3, { color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: 'justify' }]}>{t('Aboutthelawyer')}</Text>
                                <Chip chipSmall title={userData.userData.user.is_online == 1 ? t('Online') : t('Offline')} />
                            </View>
                            <Text style={[FONTS.font, { color: colorScheme === 'dark' ? COLORS.white : colors.text, textAlign: i18next.language === 'ar' ? 'right' : 'left' }]}>{i18next.language === 'ar' ? userData.userData.user.ar_about : userData.userData.user.about}</Text>
                        </View>
                    </ScrollView>
                </>
            )}
        </SafeAreaView>
    );
};
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
        borderRadius: 10,
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
});

export default Schedules;