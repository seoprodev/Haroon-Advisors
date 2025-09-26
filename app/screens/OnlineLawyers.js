import React, { useState, useEffect } from 'react';
// import Header from '../layout/Header';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, ScrollView, useColorScheme, StatusBar } from 'react-native';
import FeaturedLawyers from '../../components/FeaturedLawyers';
import { COLORS, api_url } from '../../constants/theme';
import SearchBar from '../../components/SearchBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const OnlineLawyers = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [lawyerData, setLawyerData] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchLawyerData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userDataJson = JSON.parse(userDataString);
          const url = new URL(api_url + 'online-lawyers');
          let phone = userDataJson.userData.user.phone;
          url.searchParams.append('phone', phone);
          url.searchParams.append('otp_token', userDataJson.userData.user.otp_token);
          url.searchParams.append('password', userDataJson.userData.user.password);

          const response = await fetch(url);
          const data = await response.json();
          setLawyerData(data);
        } else {
          console.log('User data not available');
        }
      } catch (error) {
        console.log('Error fetching lawyer data:', error.message);
      }
    };

    fetchLawyerData();
  }, []);

  useEffect(() => {
    const filtered = lawyerData.filter(lawyer =>
      lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredLawyers(filtered);
  }, [searchQuery, lawyerData]);

  const handleSearch = query => {
    setSearchQuery(query);
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }]}>
      <StatusBar backgroundColor={COLORS.primary} />
      {/* <Header title="Online Lawyers" leftIcon="back" onSearchPress={toggleSearchBar} /> */}
      <ScrollView contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}>
        {showSearchBar && <SearchBar handleSearch={handleSearch} />}
        <FeaturedLawyers title={t('CurrentlyAvailable')} lawyerData={filteredLawyers} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnlineLawyers;