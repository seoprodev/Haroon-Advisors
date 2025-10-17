import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Image, TouchableOpacity, View, Text, Appearance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { COLORS, IMAGES } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

export default function CustomDrawerContent(props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const [userData, setUserData] = useState(null);
  const [imageError, setImageError] = useState(false);
  const imageUrl = userData?.userData?.user?.image?.replace(/\s/g, '%20');
  const colorScheme = Appearance.getColorScheme();

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.push('/screens/auth/SignIn');
    } catch (error) {
      console.log('Error clearing AsyncStorage:', error.message);
    }
  };

  const fetchUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userDataJson = JSON.parse(userDataString);
        console.log('Retrieved userData:', userDataJson);
        setUserData(userDataJson);
      }
    } catch (error) {
      console.log('Error retrieving userData:', error);
    }
  };

  // Check if user has lawyer profile (based on lawyer-specific fields)
  const hasLawyerProfile = () => {
    if (!userData?.userData?.user) return false;
    const user = userData.userData.user;
    // Check for lawyer-specific fields
    return !!(user.designations || user.department_id || user.ar_name || user.location_id);
  };

  // Check if user has client profile (always true if they have basic user data)
  const hasClientProfile = () => {
    return !!(userData?.userData?.user);
  };

  // Switch between client and lawyer roles
  const handleRoleSwitch = async (newRole) => {
    try {
      const updatedUserData = {
        ...userData,
        userType: newRole
      };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);

      // Navigate to appropriate home screen
      if (newRole === 'client') {
        router.replace('/(drawer)/clientele/Home');
      } else {
        router.replace('/(drawer)/lawyerele/LawyerHome');
      }
    } catch (error) {
      console.log('Error switching role:', error);
    }
  };

  const toggleLanguage = async () => {
    const currentLanguage = i18next.language;
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    await AsyncStorage.setItem('language', newLanguage);
    await i18next.changeLanguage(newLanguage);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <>
      <ThemedView
        style={{
          borderBottomColor: '#dde3fe',
          borderBottomWidth: 1,
          padding: 10,
          paddingTop: 20 + top,
          flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: 20,
          overflow: 'hidden'
        }}>
        {userData ? (
          <TouchableOpacity onPress={() => {
            router.push({
              pathname: '/screens/Profile'
            });
          }}>
            <Image
              style={{ width: 75, height: 75, alignSelf: 'center', borderRadius: 5, borderWidth: 1, borderColor: COLORS.primary }}
              source={{ uri: imageError ? imageUrl : imageUrl }}
              onError={() => setImageError(true)}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Image style={{ height: 50, width: 50, borderRadius: 50 }} source={IMAGES.user} />
          </TouchableOpacity>
        )}
        <View>
          {userData ? (
            <>
              <ThemedText style={{ textAlign: i18next.language === 'ar' ? 'right' : 'left' }} type='default'>{userData.userData.user.name}</ThemedText>
              <ThemedText style={{ textAlign: i18next.language === 'ar' ? 'right' : 'left' }} type='link'>{t('Online')}</ThemedText>
            </>
          ) : (
            <ThemedText>{t('WelcomeBack')}</ThemedText>
          )}
        </View>
      </ThemedView>
      <DrawerContentScrollView
        {...props}
        style={{ padding: 0, marginTop: -10 }}
        scrollEnabled={true}>
        <DrawerItemList {...props} />

        {/* Role Switcher Section */}
        {userData && (
          <View style={{
            borderTopWidth: 1,
            borderTopColor: '#dde3fe',
            borderBottomWidth: 1,
            borderBottomColor: '#dde3fe',
            paddingVertical: 10,
            marginVertical: 5,
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa'
          }}>
            {/* Current Role Badge */}
            <View style={{
              flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 8,
              gap: 10
            }}>
              <Ionicons
                name={userData.userType === 'lawyer' ? 'briefcase' : 'person'}
                size={20}
                color={COLORS.primary}
              />
              <ThemedText style={{
                fontSize: 14,
                fontWeight: '600',
                color: COLORS.black
              }}>
                {userData.userType === 'lawyer' ? t('LawyerMode') : t('ClientMode')}
              </ThemedText>
            </View>

            {/* Role Switcher Buttons */}
            {hasLawyerProfile() && hasClientProfile() ? (
              // User has both profiles - show switch button
              <TouchableOpacity
                onPress={() => handleRoleSwitch(userData.userType === 'client' ? 'lawyer' : 'client')}
                style={{
                  flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  marginHorizontal: 10,
                  marginTop: 8,
                  backgroundColor: COLORS.primary,
                  borderRadius: 8,
                  gap: 10
                }}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={20}
                  color="white"
                />
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 15,
                  flex: 1,
                  textAlign: i18next.language === 'ar' ? 'right' : 'left'
                }}>
                  {userData.userType === 'client' ? t('SwitchToLawyer') : t('SwitchToClient')}
                </Text>
              </TouchableOpacity>
            ) : userData.userType === 'client' && !hasLawyerProfile() ? (
              // Client-only user - show "Become a Lawyer" button
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/screens/BecomeLawyer',
                  params: { userData: encodeURIComponent(JSON.stringify(userData.userData.user)) }
                })}
                style={{
                  flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  marginHorizontal: 10,
                  marginTop: 8,
                  backgroundColor: COLORS.primary,
                  borderRadius: 8,
                  gap: 10
                }}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color="white"
                />
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 15,
                  flex: 1,
                  textAlign: i18next.language === 'ar' ? 'right' : 'left'
                }}>
                  {t('BecomeALawyer')}
                </Text>
              </TouchableOpacity>
            ) : userData.userType === 'lawyer' && hasClientProfile() ? (
              // Lawyer-only user but can switch to client - show switch button
              <TouchableOpacity
                onPress={() => handleRoleSwitch('client')}
                style={{
                  flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  marginHorizontal: 10,
                  marginTop: 8,
                  backgroundColor: COLORS.primary,
                  borderRadius: 8,
                  gap: 10
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="white"
                />
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 15,
                  flex: 1,
                  textAlign: i18next.language === 'ar' ? 'right' : 'left'
                }}>
                  {t('SwitchToClient')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        <DrawerItem
          label={() => (
            <Text style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
              {t('About')}
            </Text>
          )}
          icon={({ color, size }) => (
            <Ionicons name="information-circle-outline" color={color} size={size} />
          )}
          onPress={() => router.push('/(drawer)/clientele/About')}
        />
        <DrawerItem
          label={() => (
            <Text style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
              {t('PrivacyPolicy')}
            </Text>
          )}
          icon={({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" color={color} size={size} />
          )}
          onPress={() => router.push('/screens/PrivacyPolicy')}
        />
        <DrawerItem
          label={() => (
            <Text style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
              {t('Terms&Use')}
            </Text>
          )}
          icon={({ color, size }) => (
            <Ionicons name="document-text-outline" color={color} size={size} />
          )}
          onPress={() => router.push('/screens/Terms&Use')}
        />
        <DrawerItem
          label={() => (
            <Text style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
              {t('Language')}
            </Text>
          )}
          icon={({ color, size }) => (
            <Ionicons name="language-outline" color={color} size={size} />
          )}
          onPress={toggleLanguage}
        />
        <DrawerItem
          label={() => (
            <Text style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
              {t('MyProfile')}
            </Text>
          )}
          icon={({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          )}
          onPress={() => router.push('/screens/Profile')}
        />
        <DrawerItem
          label={() => (
            <Text style={{ color: 'red', textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
              {t('DeleteYourAccount')}
            </Text>
          )}
          icon={({ size }) => (
            <Ionicons name="trash-outline" color="red" size={size} />
          )}
          onPress={() => router.push('/screens/DeleteAccount')}
        />
        <DrawerItem
          label={() => (
            <Text style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
              {t('Logout')}
            </Text>
          )}
          icon={({ color, size }) => (
            <Ionicons name="log-out-outline" color={color} size={size} />
          )}
          onPress={handleLogout}
        />
      </DrawerContentScrollView>
      <ThemedView
        style={{
          borderTopColor: '#dde3fe',
          borderTopWidth: 1,
          padding: 20,
          paddingBottom: 20 + bottom,
        }}>
        <Text style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('HaroonAdvisors')}</Text>
        <Text style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.betabg, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('AppVersion')}</Text>
      </ThemedView>
    </>
  );
}