import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, useColorScheme, StatusBar, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import FeaturedLawyers from '../../components/FeaturedLawyers';
import { COLORS, api_url } from '../../constants/theme';
import SearchBar from '../../components/SearchBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

interface Lawyer {
  name: string;
  [key: string]: any; // Allow additional properties, adapt if known
}

const AllLawyers: React.FC = () => {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [lawyerData, setLawyerData] = useState<Lawyer[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchLawyerData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userDataJson = JSON.parse(userDataString);
          const url = new URL(api_url + 'lawyers');
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }]}>
      <StatusBar backgroundColor={COLORS.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <SearchBar handleSearch={handleSearch} />
          <FeaturedLawyers
            title={t('AllAttorneysAtLaw')}
            lawyerData={filteredLawyers}
            btnTitle={undefined}
            navRoute={undefined}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});

export default AllLawyers;