import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import { useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import SelectDropdown from "react-native-select-dropdown";
import Toast from "react-native-simple-toast";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Device from "expo-device";
import * as Network from "expo-network";
import { GlobalStyleSheet } from "../../../constants/StyleSheet";
import { api_url, prefix, lawyerprefix, IMAGES, FONTS, SIZES, COLORS } from "../../../constants/theme";
import { useTheme } from "@react-navigation/native";
import i18next from "i18next";
import { OtpInput } from "react-native-otp-entry";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from 'expo-apple-authentication';

const SignIn = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const { colors } = useTheme();
  const [otp, setOtp] = useState('');
  const [countryCode, setCountryCode] = useState('+971');
  const [phone, setPhone] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [currentView, setCurrentView] = useState('Language');
  const [userType, setUserType] = useState('');
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const [webclientId, setWebClientId] = useState('');
  const [iosclientId, setiOSClientId] = useState('');
  const [expoPushToken, setexpoPushToken] = useState('');
  const [beginDisabled, setbeginButtonDisabled] = useState(true);
  const [showCredentials, setShowCredentials] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();
  const otpRef = useRef('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function safeJson(response) {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return null; // Not JSON (likely redirect HTML)
    }
  }

  const initializeApp = async () => {
    await fetchGoogleWebClientId();
    await fetchGoogleiOSClientId();
    await checkNotificationPermissions();
  };

  const fetchGoogleWebClientId = async () => {
    try {
      const { data } = await axios.get(`${api_url}google-web-client-id`);
      setWebClientId(data.google_web_client_id);
    } catch (error) {
      console.log('Error fetching Google Web Client ID:', error);
    }
  };

  const fetchGoogleiOSClientId = async () => {
    try {
      const { data } = await axios.get(`${api_url}google-ios-client-id`);
      setiOSClientId(data.google_ios_client_id);
    } catch (error) {
      console.log('Error fetching Google iOS Client ID:', error);
    }
  };

  const checkNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      showToast('Push notification permissions not granted');
      return;
    }
    const PushToken = (await Notifications.getExpoPushTokenAsync()).data;
    setexpoPushToken(PushToken);
  };

  const backAction = () => {
    if (backPressedOnce) {
      BackHandler.exitApp();
    } else {
      setBackPressedOnce(true);
      Toast.show('Press again to exit app', Toast.LONG);
      setTimeout(() => setBackPressedOnce(false), 2500);
    }
    return true;
  };

  const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

  useEffect(() => {
    initializeApp();

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (webclientId && iosclientId) {
      GoogleSignin.configure({
        webClientId: webclientId,
        iosClientId: iosclientId,
      });
    }
  }, [webclientId, iosclientId]);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const ipAddress = await Network.getIpAddressAsync();
      const modelName = Device.modelName;
      const idToken = userInfo.data.idToken;
      const { email, name, photo } = userInfo.data.user;

      const response = await fetch(`${api_url}google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, email, name, photo, ipAddress, modelName, expo_push_token: expoPushToken }),
      });

      const userData = await response.json();

      let userType = userData.user_type === 'Lawyer' ? 'lawyer' : 'client';
      if (response.ok) {
        await AsyncStorage.setItem('userData', JSON.stringify({ userType, userData }));
        const token = userData.access_token;
        await AsyncStorage.setItem('jwtToken', token);
        const routePath = userType === 'lawyer' ? '/(drawer)/lawyerele/Home' : '/(drawer)/clientele/Home';
        setIsSigningIn(false);
        router.push({
          pathname: routePath,
          params: { userType, userData },
        });
        showToast(`Welcome ${userData.user.name}`);
        // setTimeout(() => {
        //   router.push({
        //     pathname: routePath,
        //     params: { userType, userData },
        //   });
        //   showToast(`Welcome ${userData.user.name}`);
        // }, 3000);
      } else {
        console.log('Google login failed:', userData);
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-in already in progress');
      } else {
        console.log('Error:', error);
      }
    }
  };

  const handlePhoneChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setPhone(numericValue);
  };

  const handleLanguageSelection = async (language) => {
    try {
      await AsyncStorage.setItem('language', language.code);
      i18next.changeLanguage(language.code);
    } catch (error) {
      console.log('Error saving language:', error);
    }
    setbeginButtonDisabled(false);
  };

  const handleLogin = async () => {
    if (!phone) {
      showToast(t('Please enter your phone number'));
      return;
    }
    try {
      setButtonDisabled(true);
      Keyboard.dismiss();
      const ipAddress = await Network.getIpAddressAsync();
      const modelName = Device.modelName;
      const response = await fetch(api_url + prefix + 'login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: countryCode + phone,
          ipaddress: ipAddress,
          modelname: modelName,
          expo_push_token: expoPushToken,
        }),
      });

      let userType;
      let userData = await response.json();

      if (response.status === 200) {
        const token = userData.access_token;
        await AsyncStorage.setItem('jwtToken', token);
        userType = 'client';
      } else if (response.status === 404) {
        const lawyerResponse = await fetch(api_url + lawyerprefix + 'login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: countryCode + phone,
            ipaddress: ipAddress,
            modelname: modelName,
            expo_push_token: expoPushToken,
          }),
        });
        userData = await lawyerResponse.json();
        if (lawyerResponse.status === 200) {
          userType = 'lawyer';
        } else if (lawyerResponse.status === 404) {
          const mockUserData = {
            user: {
              name: 'Haroon User',
              image: 'uploads/website-images/default.jpg',
              phone: countryCode + phone,
            },
          };
          setUserType('client');
          setUserData(mockUserData);
          setCurrentView('EnterCode');
          showToast(`OTP sent to ${mockUserData.user.phone}`);
        } else {
          showToast('Invalid Phone Number!!');
          return false;
        }
      } else {
        showToast('Critical Error');
      }

      if (userData.message === 'Device recognized') {
        await AsyncStorage.setItem('userData', JSON.stringify({ userType, userData }));
        router.push({
          pathname: '/(drawer)/clientele/Home',
          params: { userType, userData },
        });
        showToast(`Welcome back, ${userData.user.name}.`);
      } else {
        setUserType(userType);
        setUserData(userData);
        setCurrentView('EnterCode');
      }
    } catch (error) {
      showToast('Something went wrong: Please try again...');
    } finally {
      setButtonDisabled(false);
    }
  };

  const handleCredsLogIn = async () => {
    if (!email || !password) {
      showToast("Error", "Please enter both email and password.");
      return;
    }
    try {
      const payload = {
        email,
        password,
        ipaddress: await Network.getIpAddressAsync(),
        modelname: Device.modelName,
        expo_push_token: expoPushToken,
      };

      // 🔹 First attempt: CLIENT login
      let response = await fetch(api_url + prefix + 'login-with-email', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json", // ✅ IMPORTANT
        },
        body: JSON.stringify(payload),
      });

      let userData = await safeJson(response);

      if (response.status === 200) {
        let userType = 'client';

        await AsyncStorage.setItem(
          'userData',
          JSON.stringify({ userType, userData })
        );

        setShowCredentials(false);

        router.push({
          pathname: '/(drawer)/clientele/Home',
          params: { userType, userData },
        });

        showToast(`Welcome, ${userData.user.name}.`);
        return;
      }

      // 🔹 If client login fails → try LAWYER login
      if (response.status === 401) {
        response = await fetch(api_url + lawyerprefix + 'login-with-email', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json", // ✅ IMPORTANT
          },
          body: JSON.stringify(payload),
        });

        userData = await safeJson(response);

        if (response.status === 200) {
          let userType = 'lawyer';

          await AsyncStorage.setItem(
            'userData',
            JSON.stringify({ userType, userData })
          );

          setShowCredentials(false);

          router.push({
            pathname: '/(drawer)/lawyerele/LawyerHome',
            params: { userType, userData },
          });

          showToast(`Welcome, ${userData.user.name}.`);
          return;
        }

        if (response.status === 401 || response.status === 404) {
          showToast("Invalid credentials");
          return;
        }
      }

      // 🔴 Validation or other errors
      if (response.status === 422) {
        const errors = userData?.errors;

        if (errors) {
          // Get first error message from any field
          const firstError = Object.values(errors)[0][0];
          showToast(firstError);
        } else {
          showToast("Validation error");
        }

        return;
      }

      showToast(userData?.error || "Something went wrong");

    } catch (error) {
      console.error(error);
      showToast("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    otpRef.current = otp;
  }, [otp]);

  const verifyOTP = async () => {
    // console.log("Pushed");
    let finalUserData = userData;

    if (!finalUserData || !finalUserData.user || !finalUserData.user.phone) {
      finalUserData = {
        user: {
          name: 'Haroon User',
          image: 'uploads/website-images/default.jpg',
          phone: countryCode + phone,
        },
      };
      setUserData(finalUserData); // still useful for future render consistency
    }

    try {
      const enteredOtp = otpRef.current;
      console.log("Pushed OTP", enteredOtp);

      const response = await fetch(api_url + 'verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: finalUserData.user.phone,
          expo_push_token: expoPushToken,
          otp: enteredOtp,
        }),
      });

      const data = await response.json();

      showToast('OTP Verified');

      if (data.message === 'User OTP Verified') {
        await AsyncStorage.setItem('userData', JSON.stringify({ userType, userData: finalUserData }));
        router.push({
          pathname: '/(drawer)/clientele/Home',
          params: { userType, userData: finalUserData },
        });
        showToast(`Welcome ${finalUserData.user.name}.`);
      } else if (data.message === 'Lawyer OTP Verified') {
        await AsyncStorage.setItem('userData', JSON.stringify({ userType, userData: finalUserData }));
        router.push({
          pathname: '/(drawer)/lawyerele/LawyerHome',
          params: { userType, userData: finalUserData },
        });
        showToast(`Welcome ${finalUserData.user.name}.`);
      } else if (data.message === 'Invalid OTP') {
        showToast('Invalid OTP');
      } else if (data.message === 'Lawyer not found') {
        setUserData(data.user);
        showToast('You are not registered yet! ' + finalUserData.user.phone);
        await AsyncStorage.setItem('userData', JSON.stringify({ userType, userData: finalUserData }));
        router.push({
          pathname: '/(drawer)/clientele/Home',
          params: { userType, userData: finalUserData },
        });
        showToast(`Welcome ${finalUserData.user.name}.`);
      } else {
        showToast('Not found: ' + data.error);
      }
    } catch (error) {
      showToast(error.message || error);
    } finally {
      setButtonDisabled(false);
    }
  };

  const showToast = (message) => {
    Toast.show(message, Toast.SHORT);
  };
  const languageWithFlags = [
    { title: "English", code: "en", image: IMAGES.UnitedStates },
    { title: "Arabic", code: "ar", image: IMAGES.UnitedArabEmirates },
  ];
  const countriesWithFlags = [
    { title: '+971', image: IMAGES.UnitedArabEmirates },
    { title: '+1', image: IMAGES.UnitedStates },
  ];

  return (
    <>
      <StatusBar backgroundColor={COLORS.primary} />
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={[
            colorScheme === 'dark' ? GlobalStyleSheet.container : GlobalStyleSheet.darkcontainer,
            { flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }
          ]}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: Platform.OS === "ios" ? 10 : 0 }} keyboardShouldPersistTaps='handled'>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                <Image style={{
                  width: '80%', height: 150, resizeMode: "contain", marginBottom: 16,
                }} source={colorScheme === "dark" ? IMAGES.appLogo : IMAGES.darkappLogo} />

                {currentView === 'Language' && (
                  <View style={{ gap: 10, }}>
                    <SelectDropdown
                      data={languageWithFlags}
                      defaultButtonText={t('Pleaseselectpreferredlanguage')}
                      defaultValue={null}
                      dropdownStyle={styles.dropdownMenuStyle}
                      onSelect={(selectedItem) => handleLanguageSelection(selectedItem)}
                      showsVerticalScrollIndicator={false}
                      renderButton={(selectedItem) => {
                        return (
                          <View style={styles.dropdownButtonStyle}>
                            {selectedItem ? (
                              <View style={{ marginRight: 6 }}>
                                <Image style={{ width: 30, height: 20 }} source={selectedItem.image} />
                              </View>
                            ) : null}
                            <Text style={styles.dropdownButtonTxtStyle}>
                              {selectedItem ? selectedItem.title : t('Pleaseselectpreferredlanguage')}
                            </Text>
                          </View>
                        );
                      }}
                      renderItem={(item, isSelected) => {
                        return (
                          <View style={{ flexDirection: "row", paddingHorizontal: 10, ...styles.dropdownItemStyle }}>
                            <View style={{ marginRight: 5 }}>
                              <Image style={{ width: 30, height: 20 }} source={item.image} />
                            </View>
                            <Text>{item.title}</Text>
                          </View>
                        );
                      }}
                    />
                    <ThemedButton title={t('LetsBegin')} type='primary' onPress={() => setCurrentView('SignIn')} style={{ opacity: beginDisabled ? 0.5 : 1 }} disabled={beginDisabled} />
                  </View>
                )}

                {
                  currentView === 'SignIn' && (
                    <View style={[GlobalStyleSheet.container, { backgroundColor: colorScheme === 'dark' ? GlobalStyleSheet.lightbg : GlobalStyleSheet.darkbg, alignItems: 'center', gap: 10, }]}>
                      <View style={styles.inputStyle}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 5 }}>
                          <SelectDropdown
                            data={countriesWithFlags}
                            defaultValue={countriesWithFlags[0]}
                            onSelect={(selectedItem, index) => setCountryCode(selectedItem.title)}
                            renderButton={(selectedItem) => {
                              return (
                                <View style={styles.dropdownButtonStyle2}>
                                  {selectedItem ? (
                                    <View style={{ borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden', marginRight: 5, borderRadius: 5 }}>
                                      <Image style={{ width: 30, height: 20 }} source={selectedItem.image} />
                                    </View>
                                  ) : null}
                                  <Text style={{ ...FONTS.fontLg, color: COLORS.dark, top: 1 }}>{selectedItem ? selectedItem.title : '000'}</Text>
                                </View>
                              );
                            }}
                            renderItem={(item, isSelected) => {
                              return (
                                <View style={{ flexDirection: "row", gap: 5, paddingHorizontal: 10, ...styles.dropdownItemStyle }}>
                                  <Image style={{ width: 30, height: 20 }} source={item.image} />
                                  <Text style={{ ...FONTS.fontLg, color: COLORS.dark, top: 1 }}>{item.title}</Text>
                                </View>
                              );
                            }}
                            dropdownStyle={{ borderRadius: 5 }}
                          />
                          <TextInput style={{ ...FONTS.fontLg, color: COLORS.black, width: '75%' }} onChangeText={handlePhoneChange} value={phone} maxLength={countryCode === '+971' ? 9 : countryCode === '+1' ? 10 : 10} keyboardType='numeric' onPaste={() => false} />
                        </View>
                      </View>

                      <TouchableOpacity onPress={handleLogin} style={[styles.btnStyle, { opacity: buttonDisabled ? 0.5 : 1, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]} disabled={buttonDisabled}>
                        {buttonDisabled && <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 10 }} />}
                        <Text style={{ fontSize: 20, fontWeight: '600', color: COLORS.betabg }}>{t('Next')}</Text>
                      </TouchableOpacity>

                      <ThemedText style={{ fontSize: 30, fontWeight: 600 }}>OR</ThemedText>

                      <TouchableOpacity
                        onPress={handleGoogleSignIn}
                        disabled={isSigningIn}
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingVertical: 15,
                          backgroundColor: colorScheme === 'dark' ? COLORS.white : 'transparent',
                          borderRadius: 5,
                          borderColor: COLORS.black,
                          borderWidth: 0.8,
                          gap: 10,
                        }}
                      >
                        {isSigningIn ? (
                          <ActivityIndicator size="small" color={COLORS.black} />
                        ) : (
                          <Image style={{ resizeMode: 'contain', width: 20, height: 20 }} source={IMAGES.googleIcon} />
                        )}

                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: colorScheme === 'dark' ? COLORS.title : colors.title,
                            textAlign: 'center',
                          }}
                        >
                          {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
                        </Text>
                      </TouchableOpacity>

                      <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                        cornerRadius={5}
                        style={styles.appleButton}
                        onPress={async () => {
                          try {
                            const credential = await AppleAuthentication.signInAsync({
                              requestedScopes: [
                                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                                AppleAuthentication.AppleAuthenticationScope.EMAIL,
                              ],
                            });

                            if (credential.realUserStatus != 1) {
                              showToast('Bot activity detected!');
                              return;
                            }

                            const response = await fetch(`${api_url}apple-login`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                appleID: credential.user,
                                email: credential.email,
                                name: credential.fullName.givenName,
                                lname: credential.fullName.familyName,
                                ipAddress: await Network.getIpAddressAsync(),
                                modelName: Device.modelName,
                                expo_push_token: expoPushToken,
                              }),
                            });

                            const userData = await response.json();

                            // console.log(userData);

                            let userType = 'client';
                            if (response.ok) {
                              await AsyncStorage.setItem('userData', JSON.stringify({ userType, userData }));
                              const token = userData.access_token;
                              await AsyncStorage.setItem('jwtToken', token);
                              router.push({
                                pathname: '/(drawer)/clientele/Home',
                                params: { userType, userData },
                              });
                              showToast(`Welcome ${userData.user.name}`);
                            } else {
                              console.log('Apple login failed:', userData);
                            }
                          } catch (error) {
                            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                              showToast('User cancelled the sign-in');
                            } else if (error.code === statusCodes.IN_PROGRESS) {
                              showToast('Sign-in already in progress');
                            } else {
                              showToast('User cancelled the sign-in');
                            }
                          }
                        }}
                      />

                      <TouchableOpacity onPress={() => setShowCredentials(!showCredentials)} style={{ width: '100%', flexDirection: 'row', justifyContent: "center", alignItems: "center", paddingVertical: 15, backgroundColor: colorScheme === 'dark' ? COLORS.white : 'transparent', borderRadius: 5, borderColor: COLORS.black, borderWidth: 0.8, gap: 10 }}>
                        <Ionicons name="lock-open" size={15} color={colorScheme === 'light' ? COLORS.betabg : COLORS.betabg} />
                        <Text style={{ fontSize: 18, fontWeight: 600, color: colorScheme === 'dark' ? COLORS.title : colors.title, textAlign: 'center' }}>Sign in with Password</Text>
                      </TouchableOpacity>

                      <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Adjust offset as needed
                      >
                        <Modal
                          animationType="slide"
                          transparent={true}
                          visible={showCredentials}
                          onRequestClose={() => setShowCredentials(false)}
                        >
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <View style={{ width: '90%', backgroundColor: COLORS.white, padding: 20, borderRadius: 10 }}>
                              <TextInput
                                style={{ ...FONTS.fontLg, color: COLORS.black, width: '100%', padding: 10, borderWidth: 1, borderColor: COLORS.borderColor, borderRadius: 5 }}
                                placeholder={t('EnterEmail')}
                                placeholderTextColor={COLORS.betabg}
                                onChangeText={setEmail}
                                value={email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                              />
                              <TextInput
                                style={{ ...FONTS.fontLg, color: COLORS.black, width: '100%', padding: 10, borderWidth: 1, borderColor: COLORS.borderColor, borderRadius: 5, marginTop: 10 }}
                                placeholder={t('EnterPassword')}
                                placeholderTextColor={COLORS.betabg}
                                onChangeText={setPassword}
                                value={password}
                                secureTextEntry
                                textAlign={i18next.language === 'ar' ? 'right' : 'left'}
                              />
                              <View style={{ flexDirection: "row", gap: 10, marginVertical: 10, justifyContent: "space-between" }}>
                                <ThemedButton title={t('LogIn')} type='primary' style={{ width: '48%' }} onPress={() => { handleCredsLogIn(); }} />
                                <ThemedButton title={t('Close')} type='primary' style={{ width: '48%' }} onPress={() => setShowCredentials(false)} />
                              </View>
                              <ThemedButton title={t('DontHaveAccount')} type='primary' onPress={() => {
                                const phone = "";
                                const userData = { email, password, phone };
                                const serializedUserData = JSON.stringify(userData);
                                setShowCredentials(false)
                                router.push({
                                  pathname: '/screens/auth/CreateAccount',
                                  params: { userData: serializedUserData },
                                });
                              }} />
                            </View>
                          </View>
                        </Modal>
                      </KeyboardAvoidingView>

                    </View>
                  )
                }

                {currentView === 'EnterCode' && (
                  <View style={[GlobalStyleSheet.container, { backgroundColor: colorScheme === 'dark' ? GlobalStyleSheet.lightbg : GlobalStyleSheet.darkbg, alignItems: 'center' }]}>
                    <Text style={{ ...FONTS.h2, textAlign: 'center', color: colorScheme === 'dark' ? COLORS.white : colors.title }}>
                      {t('VCodeTitle')}
                    </Text>
                    <Text style={{ textAlign: 'center', color: colorScheme === 'dark' ? COLORS.white : colors.title }}>
                      {t('VCodeDesc')}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 25, paddingHorizontal: 20 }}>
                      <OtpInput
                        blurOnFilled={true}
                        numberOfDigits={4}
                        focusColor="green"
                        onFilled={(text) => setOtp(text)}
                        value={otp}
                        focusStickBlinkingDuration={500}
                        textInputProps={{ accessibilityLabel: "One-Time Password" }}
                        theme={{ pinCodeTextStyle: styles.pinCodeText }}
                      />
                    </View>
                    <TouchableOpacity
                      disabled={buttonDisabled}
                      onPress={verifyOTP}
                      style={[
                        styles.btnStyle,
                        {
                          opacity: buttonDisabled ? 0.5 : 1,
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      ]}
                    >
                      {buttonDisabled ? (
                        <ActivityIndicator size="small" color={COLORS.betabg} />
                      ) : (
                        <Text style={{ fontSize: 20, fontWeight: '600', color: COLORS.betabg }}>{t('DONE')}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  btnStyle: {
    minHeight: 50,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputStyle: {
    borderWidth: 1,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: useColorScheme === 'dark' ? COLORS.white : COLORS.black,
    height: 60,
    width: '100%'
  },
  inputStyle2: {
    borderWidth: 1,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: useColorScheme === 'dark' ? COLORS.white : COLORS.black,
    height: 50,
    width: '100%',
    color: useColorScheme === 'dark' ? COLORS.white : COLORS.black,
  },
  pinCodeText: {
    color: COLORS.primary,
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
  },
  dropdownButtonStyle2: {
    width: '25%',
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
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
    alignItems: 'center',
    paddingVertical: "4.5%",
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
});