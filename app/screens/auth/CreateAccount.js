import Toast from 'react-native-simple-toast';
import React, { useState, useEffect } from 'react';
import { useTheme } from '@react-navigation/native';
import SelectDropdown from 'react-native-select-dropdown';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SIZES, IMAGES, api_url, prefix } from '../../../constants/theme';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedButton } from "@/components/ThemedButton";
import * as ImagePicker from 'expo-image-picker';
import i18next, { t } from 'i18next';

const CreateAccount = () => {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneEditable, setPhoneEditable] = useState(true);
    const [password, setPassword] = useState('');
    const { userData } = useLocalSearchParams();
    const parsedUserData = userData ? JSON.parse(decodeURIComponent(userData)) : null;
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [designations, setDesignations] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [license, setImage] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            await fetchDepartments();
            await fetchLocations();
        };
        fetchData();
    }, []);
    useEffect(() => {
        if (parsedUserData) {
            const defaultPhone = parsedUserData.user?.phone || parsedUserData.phone;

            if (defaultPhone && phone === '') {
                setPhone(defaultPhone);
                setPhoneEditable(false);
            } else if (!defaultPhone) {
                setPhoneEditable(true);
            }
        }
    }, [parsedUserData]);
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };
    const handleEmailChange = (text) => {
        setEmail(text);
    };
    const handlePhoneChange = (text) => {
        setPhone(text);
    };
    const handlePasswordChange = (text) => {
        setPassword(text);
    };
    const handleEmailBlur = () => {
        if (!validateEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
        }
    };
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };
    const fetchDepartments = async () => {
        try {
            const response = await fetch(api_url + 'departments');
            if (!response.ok) {
                throw new Error('Failed to fetch departments');
            }
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.log('Error fetching departments:', error);
        }
    };
    const fetchLocations = async () => {
        try {
            const response = await fetch(api_url + 'locations');
            if (!response.ok) {
                throw new Error('Failed to fetch locations');
            }
            const data = await response.json();
            setLocations(data);
        } catch (error) {
            console.log('Error fetching locations:', error);
        }
    };
    const handleClientRegister = async () => {
        if (!name || !email || !phone || !password) {
            let missingFields = [];
            if (!name) missingFields.push('Name');
            if (!email) missingFields.push('Email');
            if (!phone) missingFields.push('Phone');
            if (!password) missingFields.push('Password');

            Alert.alert(
                'Missing Information',
                `Please ensure the following fields are filled out: ${missingFields.join(', ')}.`
            );
            return;
        }
        try {
            setButtonDisabled(true);
            const requestBody = {
                name: name,
                email: email,
                phone: phone,
                password: password
            };
            const response = await fetch(api_url + prefix + 'registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            if (response.status === 200) {
                router.push({
                    pathname: '/screens/auth/SignIn',
                });
                showToast('Account created successfully');
            } else {
                showToast('Registration failed. Please try again.');
            }
        } catch (error) {
            console.log('Error:', error);
            showToast('An error occurred. Please try again later.');
        } finally {
            setButtonDisabled(false);
        }
    };
    const handleLawyerRegister = async () => {
        if (!name || !email || !phone || !password) {
            Alert.alert('Missing Information', 'Please ensure all fields are filled out.');
            return;
        }
        try {
            setButtonDisabled(true);
            const selectedDepartmentId = departments.find(dep => dep.name === selectedDepartment)?.id;
            const selectedLocationId = locations.find(loc => loc.location === selectedLocation)?.id;
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('password', password);
            formData.append('designations', designations);
            formData.append('department', selectedDepartmentId);
            formData.append('location', selectedLocationId);
            formData.append('status', 0);
            if (license) {
                const filename = license.split('/').pop();
                const match = /\.(\w+)$/.exec(filename ?? '');
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('license', {
                    uri: license,
                    name: filename,
                    type,
                });
            }
            const response = await fetch(api_url + 'lawyer/registration', {
                method: 'POST',
                body: formData,
            });
            if (response.status === 200) {
                const updatedUserData = { ...parsedUserData, user: { ...parsedUserData.user, name: name, email: email } };
                await AsyncStorage.setItem('userData', JSON.stringify({ userType: 'lawyer', userData: updatedUserData }));
                router.push({
                    pathname: '/screens/auth/SignIn',
                });
                showToast('Account created successfully');
            } else {
                showToast('Registration failed. Please try again.');
            }
        } catch (error) {
            console.log('Error:', error);
            showToast('An error occurred. Please try again later.');
        } finally {
            setButtonDisabled(false);
        }
    };
    const showToast = message => {
        Toast.show(message, Toast.LONG);
    };
    const renderTab1 = () => (
        <View style={styles.tab1}>
            <View style={{ gap: 15, marginBottom: 20 }}>
                <View>
                    <TextInput textAlign={i18next.language === 'ar' ? 'right' : 'left'} style={[styles.inputStyle, { borderColor: colorScheme === 'dark' ? COLORS.white : COLORS.title, color: colorScheme === 'dark' ? COLORS.white : colors.title }]} placeholder={t('EnterYourName')} placeholderTextColor={colorScheme === 'dark' ? COLORS.white : COLORS.black} value={name} onChangeText={text => setName(text)} />
                </View>
                <View>
                    <TextInput textAlign={i18next.language === 'ar' ? 'right' : 'left'} style={[styles.inputStyle, { borderColor: colorScheme === 'dark' ? COLORS.white : COLORS.title, color: colorScheme === 'dark' ? COLORS.white : colors.title }]} placeholder={t('EnterEmail')} placeholderTextColor={colorScheme === 'dark' ? COLORS.white : COLORS.black} value={email} onChangeText={handleEmailChange} onBlur={handleEmailBlur} />
                </View>
                <View>
                    <TextInput
                        value={phone}
                        editable={phoneEditable}
                        onChangeText={handlePhoneChange}
                        keyboardType="number-pad"
                        maxLength={13}
                        placeholder={t('EnterYourPhoneNumber')}
                        textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                        placeholderTextColor={colorScheme === 'dark' ? COLORS.white : COLORS.black}
                        style={[
                            styles.inputStyle,
                            {
                                borderColor: colorScheme === 'dark' ? COLORS.white : COLORS.title,
                                color: colorScheme === 'dark' ? COLORS.white : colors.title,
                            },
                        ]}
                    />
                </View>
                <View>
                    <TextInput textAlign={i18next.language === 'ar' ? 'right' : 'left'} secureTextEntry={true} style={[styles.inputStyle, { borderColor: colorScheme === 'dark' ? COLORS.white : COLORS.title, color: colorScheme === 'dark' ? COLORS.white : colors.title }]} onChangeText={handlePasswordChange} placeholder={t('EnterPassword')} placeholderTextColor={colorScheme === 'dark' ? COLORS.white : COLORS.black} />
                </View>
            </View>
            <TouchableOpacity onPress={handleClientRegister} style={[styles.btnStyle, { opacity: buttonDisabled ? 0.5 : 1 }]} disabled={buttonDisabled} >
                <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.betabg }}>{t('RegisterAsClient')}</Text>
            </TouchableOpacity>
        </View>
    );
    const renderTab2 = () => (
        <View style={styles.tab2}>
            <View style={{ gap: 15, marginBottom: 20 }}>
                <View>
                    <TextInput textAlign={i18next.language === 'ar' ? 'right' : 'left'} style={[styles.inputStyle, { borderColor: colorScheme === 'dark' ? COLORS.white : COLORS.title, color: colorScheme === 'dark' ? COLORS.white : COLORS.black }]} placeholder={t('EnterYourName')} placeholderTextColor={colorScheme === 'dark' ? COLORS.white : colors.text} value={name} onChangeText={text => setName(text)} />
                </View>
                <View>
                    <TextInput textAlign={i18next.language === 'ar' ? 'right' : 'left'} style={[styles.inputStyle, { borderColor: colorScheme === 'dark' ? COLORS.white : COLORS.title, color: colorScheme === 'dark' ? COLORS.white : COLORS.black }]} placeholder={t('EnterEmail')} placeholderTextColor={colorScheme === 'dark' ? COLORS.white : colors.text} value={email} onChangeText={handleEmailChange} onBlur={handleEmailBlur} />
                </View>
                <View>
                    <TextInput
                        value={phone}
                        editable={phoneEditable}
                        onChangeText={handlePhoneChange}
                        keyboardType="number-pad"
                        maxLength={13}
                        placeholder={t('EnterYourPhoneNumber')}
                        placeholderTextColor={colorScheme === 'dark' ? COLORS.white : COLORS.black}
                        textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                        style={[
                            styles.inputStyle,
                            {
                                borderColor: colorScheme === 'dark' ? COLORS.white : COLORS.title,
                                color: colorScheme === 'dark' ? COLORS.white : colors.title,
                            },
                        ]}
                    />
                </View>
                <View>
                    <TextInput textAlign={i18next.language === 'ar' ? 'right' : 'left'} secureTextEntry={true} style={[styles.inputStyle, { borderColor: colorScheme === 'dark' ? COLORS.white : COLORS.title, color: colorScheme === 'dark' ? COLORS.white : colors.title }]} onChangeText={handlePasswordChange} placeholder={t('EnterPassword')} placeholderTextColor={colorScheme === 'dark' ? COLORS.white : COLORS.black} />
                </View>
                <View>
                    <TextInput textAlign={i18next.language === 'ar' ? 'right' : 'left'} style={[styles.inputStyle, { borderColor: colorScheme === 'dark' ? COLORS.white : COLORS.title, color: colorScheme === 'dark' ? COLORS.white : COLORS.black }]} placeholder={t('Designation')} placeholderTextColor={colorScheme === 'dark' ? COLORS.white : colors.text} value={designations} onChangeText={text => setDesignations(text)} />
                </View>
                <SelectDropdown
                    data={departments?.map(department => department.name) || []}
                    defaultButtonText={t('SelectPreferredDepartment')}
                    defaultValue={null}
                    dropdownStyle={styles.dropdownMenuStyle}
                    onSelect={(selectedItem) => setSelectedDepartment(selectedItem)}
                    showsVerticalScrollIndicator={false}
                    renderButton={(selectedItem) => (
                        <View style={styles.dropdownButtonStyle}>
                            <Text
                                style={[
                                    styles.dropdownButtonTxtStyle,
                                    { textAlign: i18next.language === 'ar' ? 'right' : 'left' }
                                ]}
                            >
                                {selectedItem ? selectedItem : t('SelectPreferredDepartment')}
                            </Text>
                        </View>
                    )}
                    renderItem={(item, isSelected) => (
                        <View style={{ flexDirection: "row", paddingHorizontal: 10, ...styles.dropdownItemStyle }}>
                            <Text>{item || 'Unknown'}</Text>
                        </View>
                    )}
                />
                <SelectDropdown
                    data={locations?.map(location => location.location) || []}
                    defaultButtonText={t('SelectLocation')}
                    defaultValue={null}
                    dropdownStyle={styles.dropdownMenuStyle}
                    onSelect={(selectedItem, index) => setSelectedLocation(selectedItem)}
                    showsVerticalScrollIndicator={false}
                    renderButton={(selectedItem) => (
                        <View style={styles.dropdownButtonStyle}>
                            <Text
                                style={[
                                    styles.dropdownButtonTxtStyle,
                                    { textAlign: i18next.language === 'ar' ? 'right' : 'left' }
                                ]}
                            >
                                {selectedItem ? selectedItem : t('SelectLocation')}
                            </Text>
                        </View>
                    )}
                    renderItem={(item, isSelected) => (
                        <View style={{ flexDirection: "row", paddingHorizontal: 10, ...styles.dropdownItemStyle }}>
                            <Text>{item || 'Unknown'}</Text>
                        </View>
                    )}
                />
                {/* <ThemedButton type='primary' title={t('UploadLicenseImage')} onPress={pickImage} /> */}
                <TouchableOpacity onPress={pickImage} style={[styles.btnStyle, { opacity: buttonDisabled ? 0.5 : 1 }]} disabled={buttonDisabled} >
                    <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.betabg, textAlign: 'center' }}>{t('UploadLicenseImage')}</Text>
                </TouchableOpacity>
                {license && <Image source={{ uri: license }} style={{ width: '100%', height: 200, }} />}
            </View>
            <TouchableOpacity onPress={handleLawyerRegister} style={[styles.btnStyle, { opacity: buttonDisabled ? 0.5 : 1 }]} disabled={buttonDisabled} >
                <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.betabg }}>{t('RegisterAsLawyer')}</Text>
            </TouchableOpacity>
        </View>
    );
    const [activeTab, setActiveTab] = useState('tab1');
    const handleToggleTab = () => {
        setActiveTab(activeTab === 'tab1' ? 'tab2' : 'tab1');
    };
    return (
        <>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={{ backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white, paddingVertical: 30 }}>
                        <View style={GlobalStyleSheet.container}>
                            {activeTab === 'tab1' ? renderTab1() : renderTab2()}
                            <View style={{ marginTop: 20 }}>
                                <TouchableOpacity onPress={handleToggleTab}>
                                    <Text style={{ color: COLORS.primary, textAlign: 'center', fontSize: 15 }}>
                                        {activeTab === 'tab1' ? t('RegisterAsLawyer') : t('RegisterAsClient')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

export default CreateAccount;

const styles = StyleSheet.create({
    inputStyle: {
        ...FONTS.fontLg,
        height: 50,
        paddingLeft: 10,
        paddingRight: 10,
        borderWidth: 1,
        borderRadius: SIZES.radius,
        borderColor: COLORS.primary,
    },
    btnStyle: {
        minHeight: 50,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5
    },
    dropdownButtonStyle: {
        width: '100%',
        height: 50,
        backgroundColor: '#E9ECEF',
        borderRadius: SIZES.radius,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26'
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