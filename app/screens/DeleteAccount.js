import React, { useState, useEffect } from 'react';
import { TextInput, Alert, StyleSheet, useColorScheme, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { useTranslation } from 'react-i18next';
import { api_url } from '../../constants/theme';
import i18next from 'i18next';

export default function DeleteAccount() {
    const router = useRouter();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [storedEmail, setStoredEmail] = useState(null);
    const [loading, setLoading] = useState(false);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const textColor = isDarkMode ? '#fff' : '#000';

    // Fetch user email from AsyncStorage
    useEffect(() => {
        const getUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    setStoredEmail(parsedData.userData.user.email)
                }
            } catch (error) {
                console.log('Failed to fetch user data:', error);
            }
        };
        getUserData();
    }, []);

    const confirmDelete = () => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete your account? This action is irreversible.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: handleDeleteAccount }
            ]
        );
    };

    const handleDeleteAccount = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        if (email !== storedEmail) {
            Alert.alert('Error', 'Entered email does not match your account email.');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${api_url}delete-your-account`, { email });
            await AsyncStorage.clear();
            Alert.alert('Success', 'Your account has been deleted');
            router.push('/');
        } catch (error) {
            Alert.alert('Error', 'Failed to delete account. Please try again later.');
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', minHeight: '100%' }}>
                    <ThemedView style={{ flex: 1, backgroundColor: '#ff000040', width: '100%', paddingHorizontal: 20, paddingVertical: 50, gap: 10 }}>
                        <Ionicons name="warning-outline" size={50} color="red" style={{ textAlign: i18next.language === 'ar' ? 'right' : 'left' }} />
                        <ThemedText type="title" style={{ color: 'red', marginTop: 10, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('Warning')}</ThemedText>
                        <ThemedText type="subtitle" style={{ textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('AccountDeletionNotice')}</ThemedText>
                        <ThemedText type="text" style={{ textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('AppointmentsCancelled')}</ThemedText>
                        <ThemedText type="text" style={{ textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('NoRefund')}</ThemedText>
                        <ThemedText type="text" style={{ textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('MessagesDeleted')}</ThemedText>
                        <TextInput
                            placeholder={t('EnterYourEmail')}
                            value={email}
                            autoCapitalize="none"
                            textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                            onChangeText={setEmail}
                            style={[styles.input, { color: "#161616", borderColor: textColor }]}
                        />
                        <ThemedButton title={t('DeleteYourAccount')} style={{ backgroundColor: 'red' }} type='primary' onPress={confirmDelete} disabled={loading} />
                        <ThemedButton title={t('Cancel')} type='primary' onPress={() => router.back()} />
                    </ThemedView>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    input: {
        minHeight: 50,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        fontSize: 16,
        backgroundColor: 'white'
    }
});