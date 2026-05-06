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
import { Ionicons } from '@expo/vector-icons';


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
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [license, setImage] = useState(null);
    const [avatar, setAvatar] = useState(null);


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
                name,
                email,
                phone,
                password,
            };

            const response = await fetch(api_url + prefix + 'registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            // ✅ SUCCESS (Laravel returns 201)
            if (response.status === 201 || response.status === 200) {
                showToast('Account created successfully');
                router.push({
                    pathname: '/screens/auth/SignIn',
                });
                return;
            }

            // ⚠️ VALIDATION ERRORS (422)
            if (response.status === 422 && data.errors) {
                const firstError = Object.values(data.errors)[0][0];
                showToast(firstError);
                return;
            }

            // ❌ OTHER ERRORS
            showToast(data.error || 'Registration failed. Please try again.');

        } catch (error) {
            console.log('Error:', error);
            showToast('An error occurred. Please try again later.');
        } finally {
            setButtonDisabled(false);
        }
    };
    const pickAvatar = async () => {
        // Ask permission first
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1], // square crop for avatar
            quality: 0.7,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };
    const handleLawyerRegister = async () => {
        if (!name || !email || !phone || !password) {
            Alert.alert('Missing Information', 'Please ensure all fields are filled out.');
            return;
        }

        // Validate department selection
        if (!selectedDepartments || selectedDepartments.length === 0) {
            Alert.alert('Missing Information', 'Please select at least one department.');
            return;
        }

        try {
            setButtonDisabled(true);
            const selectedLocationId = locations.find(loc => loc.location === selectedLocation)?.id;
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('password', password);
            formData.append('designations', designations);
            // Send departments as JSON array
            formData.append('department', JSON.stringify(selectedDepartments));
            formData.append('location', selectedLocationId);
            formData.append('status', 0);
            if (avatar) {
                const filename = avatar.split('/').pop();
                const match = /\.(\w+)$/.exec(filename ?? '');
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('image', {
                    uri: avatar,
                    name: filename,
                    type,
                });
            }
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

            console.log('Submitting form data:', formData);
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
                console.log('Registration failed with status:', response.status);
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
                {/* Avatar Upload */}
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <TouchableOpacity onPress={pickAvatar}>
                        {avatar ? (
                            <Image
                                source={{ uri: avatar }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>

                                <Ionicons name="camera" size={36} color="#999" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

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
                {/* Multi-Department Selection */}
                <View style={styles.departmentContainer}>
                    <Text style={[styles.departmentLabel, { color: colorScheme === 'dark' ? COLORS.white : COLORS.title }]}>
                        {t('SelectPreferredDepartment')}
                        {selectedDepartments.length > 0 && ` (${selectedDepartments.length} ${t('selected')})`}
                    </Text>
                    <View style={styles.departmentChipsContainer}>
                        {departments.map((department) => {
                            const isSelected = selectedDepartments.includes(department.id);
                            return (
                                <TouchableOpacity
                                    key={department.id}
                                    onPress={() => {
                                        if (isSelected) {
                                            // Remove department
                                            setSelectedDepartments(selectedDepartments.filter(id => id !== department.id));
                                        } else {
                                            // Add department
                                            setSelectedDepartments([...selectedDepartments, department.id]);
                                        }
                                    }}
                                    style={[
                                        styles.departmentChip,
                                        isSelected && styles.departmentChipSelected
                                    ]}
                                >
                                    <Text style={[
                                        styles.departmentChipText,
                                        isSelected && styles.departmentChipTextSelected
                                    ]}>
                                        {department.name}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={18}
                                            color={COLORS.white}
                                            style={{ marginLeft: 6 }}
                                        />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {selectedDepartments.length === 0 && (
                        <Text style={styles.departmentHint}>
                            {t('TapToSelectDepartments')}
                        </Text>
                    )}
                </View>
                <SelectDropdown
                    data={locations?.map(location => location.location) || []}
                    defaultButtonText={t('SelectLocation')}
                    defaultValue={null}
                    dropdownStyle={{
                        backgroundColor: '#E9ECEF',
                        borderRadius: SIZES.radius,
                    }}
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
    avatar: {
        width: "40%",
        aspectRatio: 1,
        borderRadius: 200,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.primayLight2,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
        fontSize: 16,
        fontWeight: '500',
        color: '#151E26'
    },
    dropdownMenuStyle: {
        backgroundColor: '#E9ECEF',
        borderRadius: SIZES.radius,
        height: "22%",
        marginTop: -40
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
    departmentContainer: {
        width: '100%',
    },
    departmentLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: COLORS.title,
    },
    departmentChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    departmentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: SIZES.radius,
        backgroundColor: '#E9ECEF',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    departmentChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    departmentChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#151E26',
    },
    departmentChipTextSelected: {
        color: COLORS.white,
        fontWeight: '600',
    },
    departmentHint: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        fontStyle: 'italic',
    },
});