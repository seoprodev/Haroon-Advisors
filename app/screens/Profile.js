import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { SvgXml } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api_url, COLORS, IMAGES, ICONS, SIZES } from '../../constants/theme';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Alert, Image, StatusBar, useColorScheme, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, DevSettings } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useRouter } from 'expo-router';
import i18next, { t } from 'i18next';



const Profile = () => {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [userType, setUserType] = useState(null);
    const [userData, setUserData] = useState({
        name: '',
        lname: '',
        email: '',
        phone: '',
        image: '',
    });
    const [originalData, setOriginalData] = useState(null);
    const navigation = useNavigation();
    const scrollViewRef = useRef();
    const nameInputRef = useRef();
    const emailInputRef = useRef();
    const phoneInputRef = useRef();

    useLayoutEffect(() => {
        if (Platform.OS === 'ios') { // Ensure this runs only on iOS
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity onPress={handleSave} disabled={loading || !hasChanges()} style={{ marginRight: 5 }}>
                        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: colorScheme === 'dark' ? 'white' : COLORS.betabg, fontSize: 16 }}>{t('Update')}</Text>}
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, loading, userData, selectedImage]);

    const isEmailValid = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isPhoneValid = (phone) => {
        return /^\+971[0-9]{9}$/.test(phone); // Assumes UAE format with +971
    };

    const isFormValid = () => {
        return (
            userData.name?.trim() &&
            userData.lname?.trim() &&
            userData.email?.trim() &&
            isEmailValid(userData.email) &&
            userData.phone?.trim() &&
            isPhoneValid(userData.phone)
        );
    };



    const fetchUserData = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
                const parsedData = JSON.parse(userDataString);
                setUserType(parsedData.userType);
                const { image, name, lname, email, phone } = parsedData.userData.user;
                const fetchedData = { image, name, lname, email, phone };
                setUserData(fetchedData);
                setOriginalData(fetchedData); // Store original data
            }
        } catch (error) {
            console.log("Error fetching user data: ", error);
        }
    };
    useEffect(() => {
        fetchUserData();
    }, []);
    const handleInputChange = (field, value) => {
        setUserData((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };
    /*const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [3, 3],
            quality: 0.8,
        });
        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    }; */
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled) {
            const asset = result.assets[0];

            let fileUri = asset.uri;

            // Fix iOS ph:// URI
            if (fileUri.startsWith('ph://')) {
                const newPath = FileSystem.cacheDirectory + 'photo.jpg';
                await FileSystem.copyAsync({ from: fileUri, to: newPath });
                fileUri = newPath;
            }

            setSelectedImage({
                uri: fileUri,
                name: asset.fileName || 'photo.jpg',
                type: asset.type === 'image' ? 'image/jpeg' : asset.type,
            });
        }
    };
    const hasChanges = () => {
        // Check if userData or selectedImage has changed
        if (selectedImage) return true;
        if (!originalData) return false;
        return (
            userData.name !== originalData.name ||
            userData.lname !== originalData.lname ||
            userData.email !== originalData.email
            //userData.phone !== originalData.phone
        );
    };

    const handleSave = async () => {
        if (!userData.name || !userData.lname || !userData.email || userData.phone == "+971") {
            Alert.alert('Missing Information', 'Please fill in all required fields: First Name, Last Name, Email, and Phone.');
            return;
        }
        //if (!hasChanges()) return;

        if (!userData.name?.trim()) {
            nameInputRef.current.focus();
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }
        /*if (!userData.email?.trim() || !isEmailValid(userData.email)) {
            emailInputRef.current.focus();
            scrollViewRef.current?.scrollTo({ y: 100, animated: true });
            return;
        }*/

        setLoading(true); try {
            const formData = new FormData();

            if (userData.name?.trim()) formData.append('name', userData.name.trim());
            if (userData.lname?.trim()) formData.append('lname', userData.lname.trim());
            if (userData.email?.trim()) formData.append('email', userData.email.trim());
            if (userData.phone?.trim()) formData.append('phone', userData.phone.trim());

            if (selectedImage) {
                // selectedImage should be { uri, name, type }
                formData.append('image', selectedImage);

                /*formData.append('image', {
                    uri: selectedImage.uri,
                    name: selectedImage.name || 'photo.jpg',
                    type: selectedImage.type || 'image/jpeg',
                }); */
            }

            const updateURL =
                api_url + (userType === 'lawyer' ? 'lawyer' : 'client') + '/update-profile';

            const response = await fetch(updateURL, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    // Authorization: `Bearer ${token}`, // if route is protected
                },
                body: formData,
            });

            // Parse safely
            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.log('RAW RESPONSE:', text);
                throw new Error('Invalid JSON response from server');
            }

            console.log('STATUS:', response.status);
            console.log('RESULT:', result);

            // ✅ Success
            if (response.ok) {
                const currentUserDataString = await AsyncStorage.getItem('userData');
                const currentUserData = currentUserDataString
                    ? JSON.parse(currentUserDataString)
                    : {};

                const updatedUser = {
                    ...currentUserData.userData.user,
                    name: result.user.name,
                    lname: result.user.lname,
                    email: result.user.email,
                    phone: result.user.phone,
                    image: result.user.image,
                };

                const updatedUserData = {
                    ...currentUserData,
                    userData: {
                        ...currentUserData.userData,
                        user: updatedUser,
                    },
                };

                await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
                setUserData(updatedUserData.userData.user);
                setOriginalData(updatedUserData.userData.user);
                setSelectedImage(null);

                Alert.alert('Success', result.message || 'Profile updated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);

            }
            // ✅ Validation errors
            else if (response.status === 422) {
                const errors = result?.errors;
                if (errors) {
                    // Flatten all errors into a single string
                    const allErrors = Object.values(errors)
                        .map(arr => arr.join(', '))
                        .join('\n');
                    Alert.alert('Validation Error', allErrors);
                } else {
                    Alert.alert('Validation Error', result?.message || 'Validation failed');
                }
            }
            // ✅ Conflict errors (unique email/phone) or other 409/400
            else if (response.status === 409 || response.status === 400) {
                Alert.alert('Conflict', result?.message || 'Email or phone already exists.');
            }
            // ✅ Other server errors
            else {
                Alert.alert('Error', result?.message || 'Failed to update profile.');
            }

        } catch (error) {
            console.error('UPLOAD ERROR:', error);
            Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isDarkMode = colorScheme === 'dark';
    const textColor = isDarkMode ? '#fff' : '#000';
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? COLORS.black : COLORS.white }}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View style={{ minHeight: 250, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary }}>
                <View style={styles.profilePictureContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image source={selectedImage ? { uri: selectedImage.uri } : (userData.image ? { uri: userData.image } : IMAGES.user)} style={styles.profileImage} />
                        <TouchableOpacity
                            style={{
                                height: 40,
                                width: 40,
                                borderRadius: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: 15,
                                backgroundColor: '#E6E6E6',
                                position: 'absolute',
                                bottom: 15,
                                right: 5,
                            }}
                            onPress={pickImage}
                        >
                            <SvgXml height={18} width={18} stroke={'#646464'} xml={ICONS.edit} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                    <Text style={[styles.nameText, { color: COLORS.betabg }]}>{userData.name}</Text>
                    <Text style={[styles.emailText, { color: COLORS.betabg }]}>{userData.email}</Text>
                </View>
                <Image source={IMAGES.bgShape} style={{ position: 'absolute', bottom: 0, width: '100%', resizeMode: 'stretch', height: 50, tintColor: isDarkMode ? COLORS.black : COLORS.white }} />
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView style={{ padding: 10 }} keyboardShouldPersistTaps="always">
                    <View style={styles.form}>
                        <Text style={[styles.label, { color: textColor, textAlign: i18next.language === 'ar' ? 'right' : 'left' }]}>{t('Name')}</Text>
                        <TextInput
                            style={[styles.input, { color: textColor, borderColor: textColor }]}
                            ref={nameInputRef}
                            value={userData.name}
                            textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                            onChangeText={(text) => handleInputChange('name', text)}
                        />
                        <Text style={[styles.label, { color: textColor, textAlign: i18next.language === 'ar' ? 'right' : 'left' }]}>{t('LastName')}</Text>
                        <TextInput
                            style={[styles.input, { color: textColor, borderColor: textColor }]}
                            value={userData.lname}
                            textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                            onChangeText={(text) => handleInputChange('lname', text)}
                        />
                        <Text style={[styles.label, { color: textColor, textAlign: i18next.language === 'ar' ? 'right' : 'left' }]}>{t('Email')}</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: textColor,
                                    borderColor: textColor,
                                    // opacity: !isEditingEmail && userData.email ? 0.5 : 1,
                                },
                            ]}
                            textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                            ref={emailInputRef}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={userData.email}
                            onChangeText={(text) => {
                                if (!isEditingEmail) setIsEditingEmail(true);
                                handleInputChange('email', text);
                            }}
                        // editable={isEditingEmail || !userData.email}
                        />

                        <Text style={[styles.label, { color: textColor, textAlign: i18next.language === 'ar' ? 'right' : 'left' }]}>{t('Phone')}</Text>
                        <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', borderColor: textColor, borderWidth: 1, borderRadius: 5 }]}>
                            {/* <Text style={{ paddingRight: 5, color: textColor, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>+971</Text> */}
                            <TextInput
                                style={{ flex: 1, color: textColor }}
                                keyboardType="phone-pad"
                                ref={phoneInputRef}
                                textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                                value={(userData.phone || '').replace(/^\+971/, '')}
                                onChangeText={(text) => {
                                    if (!isEditingPhone) setIsEditingPhone(true);
                                    const formatted = `+971${text.replace(/^0+/, '')}`;
                                    handleInputChange('phone', formatted);
                                }}
                                maxLength={9}
                            />
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>{t('Update')}</Text>}
                        </TouchableOpacity>

                        <Text style={[styles.label, { color: textColor, marginBottom: 10, marginTop: 10, textAlign: 'center', fontWeight: 'bold', fontSize: 20 }]}>{t('Or')}</Text>

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                {
                                    borderColor: textColor,
                                    opacity: isFormValid() ? 1 : 0.5,
                                },
                            ]}
                            disabled={!isFormValid()}
                            onPress={() =>
                                router.push({
                                    pathname: 'screens/BecomeLawyer',
                                    params: {
                                        userData: JSON.stringify(userData),
                                        userType: 'lawyer',
                                    },
                                })
                            }
                        >
                            <Text style={{ color: COLORS.betabg, fontSize: 16, fontWeight: 'bold' }}>
                                {t('ApplyToBecomeLawyer')}
                            </Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    profilePictureContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    profilePicture: {
        height: 150,
        width: 150,
        borderRadius: 20,
        marginBottom: 10,
        backgroundColor: '#ccc',
    },
    editIcon: {
        height: 40,
        width: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E6E6E6',
        position: 'absolute',
        top: -10,
        right: -10,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    emailText: {
        fontSize: 14,
        color: 'gray',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 75,
        marginBottom: 20,
        backgroundColor: '#ccc',
    },
    form: {
        flex: 1,
        marginBottom: 50
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.betabg,
        fontSize: 16,
        fontWeight: 'bold',
    },
    dropdownButtonStyle: {
        width: '100%',
        height: 50,
        backgroundColor: '#E9ECEF',
        borderRadius: SIZES.radius,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginBottom: 20
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
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
});
export default Profile;