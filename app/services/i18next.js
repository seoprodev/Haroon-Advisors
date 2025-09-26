import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const en = require('@/assets/locales/en.json'); // English translations
const ar = require('@/assets/locales/ar.json'); // Arabic translations

export const languageResources = {
    en: { translation: en },
    ar: { translation: ar },
};

// Function to retrieve language preference and initialize i18next
const initializeI18next = async () => {
    try {
        const storedLanguage = await AsyncStorage.getItem('language');
        const languageToUse = storedLanguage || 'en'; // Use stored language or default to English

        i18next
            .use(initReactI18next)
            .init({
                compatibilityJSON: 'v3',
                lng: languageToUse, // Set language dynamically
                fallbackLng: 'ar',
                resources: languageResources,
                debug: false,
                interpolation: {
                    escapeValue: false,
                },
            });
    } catch (error) {
        console.log('Error retrieving language preference:', error);
        // If there's an error, default to English
        i18next.init({
            lng: 'en',
            fallbackLng: 'ar',
            resources: languageResources,
        });
    }
};

// Call the function to initialize
initializeI18next();

export default i18next;