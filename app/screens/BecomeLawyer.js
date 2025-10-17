import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    StyleSheet,
    SafeAreaView,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SelectDropdown from 'react-native-select-dropdown';
import * as ImagePicker from 'expo-image-picker';
import { api_url, COLORS, prefix, SIZES } from '../../constants/theme';
import { ThemedButton } from "@/components/ThemedButton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next, { t } from 'i18next';
import { Ionicons } from '@expo/vector-icons';

const BecomeLawyer = () => {
    const { userData } = useLocalSearchParams();
    const parsedUserData = userData ? JSON.parse(decodeURIComponent(userData)) : null;
    const router = useRouter();
    const [designations, setDesignations] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [license, setLicense] = useState(null);
    const [lawyerSubmitting, setLawyerSubmitting] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [name, setName] = useState(parsedUserData?.name || '');
    const [lname, setLname] = useState(parsedUserData?.lname || '');
    const [email, setEmail] = useState(parsedUserData?.email || '');
    const [phone, setPhone] = useState(parsedUserData?.phone || '');
    const [avatar, setAvatar] = useState(null);

    useEffect(() => {
        fetchDepartments();
        fetchLocations();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await fetch(`${api_url}departments`);
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.log('Failed to fetch departments:', error);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await fetch(`${api_url}locations`);
            const data = await response.json();
            setLocations(data);
        } catch (error) {
            console.log('Failed to fetch locations:', error);
        }
    };

    const pickLicenseImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets?.[0]?.uri;
            setLicense(uri);
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



    const getMimeType = (uri) => {
        const ext = uri.split('.').pop().toLowerCase();
        switch (ext) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'heic':
                return 'image/heic';
            default:
                return 'application/octet-stream';
        }
    };

    const handleSubmit = async () => {
        if (!designations || selectedDepartments.length === 0 || !selectedLocation || !license) {
            Alert.alert('Missing Fields', 'Please fill in all required fields and select at least one department.');
            return;
        }

        setLawyerSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', name + ' ' + lname);
            formData.append('email', parsedUserData.email || email);
            formData.append('phone', parsedUserData.phone || phone);
            formData.append('designations', designations);
            // Send departments as JSON array
            formData.append('department', JSON.stringify(selectedDepartments));
            const selectedLocationId = locations.find(loc => loc.location === selectedLocation)?.id;
            formData.append('location', selectedLocationId);

            // Add avatar/profile image if selected
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

            // Add license image
            formData.append('license', {
                uri: license,
                type: getMimeType(license),
                name: `license.${license.split('.').pop()}`,
            });

            const response = await fetch(`${api_url}${prefix}become-lawyer`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            console.log(result);

            if (response.ok) {
                Alert.alert('Success', 'Your application has been submitted.');
                try {
                    await AsyncStorage.clear();
                    router.push('/screens/auth/SignIn');
                } catch (error) {
                    console.log('Error clearing AsyncStorage:', error.message);
                }
            } else {
                Alert.alert('Error', result.message || 'Failed to submit request.');
            }
        } catch (error) {
            console.log('Submission Error:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLawyerSubmitting(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust if you have a header
            >
                <SafeAreaView>
                    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50, backgroundColor: COLORS.white }}>

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

                        {/* First Name */}
                        <Text style={{ fontWeight: 'bold', marginBottom: 4, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                            {t('Name')}
                        </Text>
                        <TextInput
                            value={parsedUserData.name || name}
                            onChangeText={setName}
                            editable={!parsedUserData.name}
                            textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                backgroundColor: parsedUserData.name ? '#f0f0f0' : '#fff',
                                padding: 10,
                                borderRadius: 6,
                                marginBottom: 12,
                            }}
                        />

                        {/* Last Name */}
                        <Text style={{ fontWeight: 'bold', marginBottom: 4, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                            {t('LastName')}
                        </Text>
                        <TextInput
                            value={parsedUserData.lname || lname}
                            onChangeText={setLname}
                            editable={!parsedUserData.lname}
                            textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                backgroundColor: parsedUserData.lname ? '#f0f0f0' : '#fff',
                                padding: 10,
                                borderRadius: 6,
                                marginBottom: 12,
                            }}
                        />

                        {/* Email */}
                        <Text style={{ fontWeight: 'bold', marginBottom: 4, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                            {t('Email')}
                        </Text>
                        <TextInput
                            value={parsedUserData.email || email}
                            onChangeText={setEmail}
                            editable={!parsedUserData.email}
                            textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                backgroundColor: parsedUserData.email ? '#f0f0f0' : '#fff',
                                padding: 10,
                                borderRadius: 6,
                                marginBottom: 12,
                            }}
                        />

                        {/* Phone */}
                        <Text style={{ fontWeight: 'bold', marginBottom: 4, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                            {t('Phone')}
                        </Text>
                        <TextInput
                            value={parsedUserData.phone || phone}
                            onChangeText={setPhone}
                            editable={!parsedUserData.phone}
                            textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                            keyboardType="phone-pad"
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                backgroundColor: parsedUserData.phone ? '#f0f0f0' : '#fff',
                                padding: 10,
                                borderRadius: 6,
                                marginBottom: 12,
                            }}
                        />

                        {/* Designation */}
                        <Text style={{ fontWeight: 'bold', marginBottom: 4, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('Designation')}</Text>
                        <TextInput
                            value={designations}
                            onChangeText={setDesignations}
                            textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                padding: 10,
                                borderRadius: 6,
                                marginBottom: 12,
                            }}
                        />

                        {/* Multi-Department Selection */}
                        <View style={styles.departmentContainer}>
                            <Text style={[styles.departmentLabel, { textAlign: i18next.language === 'ar' ? 'right' : 'left' }]}>
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

                        {/* Location Dropdown */}
                        <Text style={{ fontWeight: 'bold', marginBottom: 4, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('SelectLocation')}</Text>
                        <SelectDropdown
                            data={locations.map(location => location.location)}
                            defaultButtonText={t('SelectLocation')}
                            defaultValue={null}
                            dropdownStyle={[styles.dropdownMenuStyle, { maxHeight: "25%" }]}
                            onSelect={(selectedItem, index) => setSelectedLocation(selectedItem)}
                            showsVerticalScrollIndicator={false}
                            renderButton={(selectedItem) => (
                                <View style={styles.dropdownButtonStyle}>
                                    <Text style={styles.dropdownButtonTxtStyle}>
                                        {selectedItem ? selectedItem : t('SelectLocation')}
                                    </Text>
                                </View>
                            )}
                            renderItem={(item, isSelected) => (
                                <View style={{ flexDirection: "row", paddingHorizontal: 10, ...styles.dropdownItemStyle }}>
                                    <Text>{item}</Text>
                                </View>
                            )}
                        />

                        {/* License Upload */}
                        <ThemedButton
                            type="primary"
                            title={t('UploadLicenseImage')}
                            onPress={pickLicenseImage}
                            backgroundColor={COLORS.primary}
                            style={{ marginBottom: 10 }}

                        />
                        {license && (
                            <Image
                                source={{ uri: license }}
                                style={{ width: '100%', height: 200, marginBottom: 15, borderRadius: 6 }}
                            />
                        )}

                        {/* Submit */}
                        <TouchableOpacity
                            style={{
                                backgroundColor: COLORS.primary,
                                padding: 15,
                                borderRadius: 6,
                                alignItems: 'center',
                            }}
                            onPress={handleSubmit}
                            disabled={lawyerSubmitting}
                        >
                            {lawyerSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('DONE')}</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default BecomeLawyer;

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
        width: 150,
        height: 150,
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
        fontSize: 16,
        fontWeight: '500',
        color: '#151E26',
        textAlign: 'center'
    },
    dropdownMenuStyle: {
        backgroundColor: '#E9ECEF',
        borderRadius: SIZES.radius,
        height: "22%"
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
    departmentContainer: {
        width: '100%',
        marginBottom: 20,
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