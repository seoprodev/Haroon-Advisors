import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { ThemedButton } from '@/components/ThemedButton';
import SearchBar from '../../../components/SearchBar';
import { COLORS, api_url } from '../../../constants/theme';
import FeaturedLawyers from '../../../components/FeaturedLawyers';
import DepartmentsSlider from '../../../components/DepartmentsSlider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView, ScrollView, BackHandler, useColorScheme, StatusBar, View, RefreshControl, Platform, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import i18next from 'i18next';

const HomeScreen = () => {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [lawyerData, setLawyerData] = useState([]);
  const [onlineLawyerData, setOnlineLawyerData] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showOnlineLawyers, setShowOnlineLawyers] = useState(true);
  const [language, setLanguage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    fetchLanguage();
    fetchLawyerData();
  }, []);

  useEffect(() => {
    fetchOnlineLawyerData();
  }, []);

  useEffect(() => {
    if (!Array.isArray(lawyerData)) {
      setFilteredLawyers([]);
      return;
    }

    const filtered = lawyerData.filter(lawyer =>
      lawyer.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredLawyers(filtered);
  }, [searchQuery, lawyerData]);

  const fetchLanguage = async () => {
    const storedLanguage = await getStoredLanguage();
    if (storedLanguage) {
      i18next.changeLanguage(storedLanguage);
      setLanguage(storedLanguage);
    }
  };

  const fetchLawyerData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userDataJson = JSON.parse(userDataString);
        const url = new URL(api_url + 'lawyers');
        // let phone = userDataJson.userData.user.phone;
        let phone = userDataJson?.userData?.user?.phone || "+971 123456789";
        url.searchParams.append('phone', phone);
        url.searchParams.append('otp_token', userDataJson.userData.user.otp_token);
        url.searchParams.append('password', userDataJson.userData.user.password);
        const response = await fetch(url);
        const data = await response.json();
        setLawyerData(data);
      } else {
        const url = new URL(api_url + 'lawyers');
        let phone = "+971 123456789";
        url.searchParams.append('phone', phone);
        url.searchParams.append('otp_token', '1234');
        url.searchParams.append('password', 'qwertyuiop');
        const response = await fetch(url);
        const data = await response.json();
        setLawyerData(data);
      }
    } catch (error) {
      console.log('Error fetching lawyer data:', error.message);
    }
  };

  const fetchOnlineLawyerData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userDataJson = JSON.parse(userDataString);
        const onlineurl = new URL(api_url + 'online-lawyers');
        let phone = userDataJson.userData.user.phone;
        onlineurl.searchParams.append('phone', phone);
        onlineurl.searchParams.append('otp_token', userDataJson.userData.user.otp_token);
        onlineurl.searchParams.append('password', userDataJson.userData.user.password);
        const response = await fetch(onlineurl);

        if (response.status === 404) {
          setShowOnlineLawyers(false);
        } else {
          const onlineData = await response.json();
          setOnlineLawyerData(onlineData);
          setShowOnlineLawyers(true);
        }
      } else {
        const onlineurl = new URL(api_url + 'online-lawyers');
        let phone = '+971 123456789';
        onlineurl.searchParams.append('phone', phone);
        onlineurl.searchParams.append('otp_token', '1234');
        onlineurl.searchParams.append('password', 'qwertyuiop');
        const response = await fetch(onlineurl);
        if (response.status === 404) {
          setShowOnlineLawyers(false);
        } else {
          const onlineData = await response.json();
          setOnlineLawyerData(onlineData);
          setShowOnlineLawyers(true);
        }
      }
    } catch (error) {
      console.log('Error fetching online lawyer data:', error.message);
      setShowOnlineLawyers(false);
    }
  };

  const handleSearch = query => {
    setSearchQuery(query);
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLawyerData();
    await fetchOnlineLawyerData();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }]}>
      <StatusBar backgroundColor={COLORS.primary} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 50 : 10, paddingHorizontal: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {showSearchBar && <SearchBar handleSearch={handleSearch} />}
        <DepartmentsSlider />
        {showOnlineLawyers && (
          <View style={{
            backgroundColor: colorScheme === 'dark' ? COLORS.primary : '#1f3b39',
            padding: 20,
            borderRadius: 0,
            marginBottom: 10,
            flex: 1,
            flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row', // Adjust layout for RTL
            marginHorizontal: -10
          }}>
            <View style={{ width: '70%', justifyContent: 'space-between', flexDirection: 'column' }}>
              <Text style={{ color: COLORS.white, fontSize: 28, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                {t('AvailableNow')}
              </Text>
              <Text style={{ color: COLORS.white, fontSize: 18, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                {t('MoreLawyersAvailable')}
              </Text>
            </View>
            <View style={{
              width: '30%',
              alignItems: i18next.language === 'ar' ? 'flex-start' : 'flex-end', // Adjust alignment for RTL
              justifyContent: 'space-between'
            }}>
              <View style={{ flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row', gap: 5, alignItems: 'center' }}>
                <View style={{ height: 12.5, width: 12.5, borderRadius: 50, backgroundColor: COLORS.online, borderWidth: 2, borderColor: '#5ea09a' }} />
                <Text style={{ color: COLORS.white, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{t('Online')}</Text>
              </View>
              <ThemedButton title={t('ShowAll')} type='white' onPress={() => router.push('/screens/OnlineLawyers')} />
            </View>
          </View>
        )}


        {filteredLawyers.length === 0 ? (
          <Text style={styles.emptyText}>
            {t('No Lawyers Found Please Try again later!')}
          </Text>
        ) : (
          <FeaturedLawyers
            title={t('FeaturedLawyers')}
            lawyerData={filteredLawyers}
            btnTitle={t('ShowAll')}
            navRoute="/screens/SearchLawyers"
          />
        )}

      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({

  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 32,
    color: "#808080",
  },

});

export default HomeScreen;