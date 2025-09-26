import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, useColorScheme, StatusBar, Text, View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import FeaturedLawyers from '../../components/FeaturedLawyers';
import SearchBar from '../../components/SearchBar';
import { COLORS, api_url } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const Lawyers = () => {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [lawyerData, setLawyerData] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const { t } = useTranslation();
  const route = useRoute();
  const { departmentId } = route.params;
  const lawyerURL = `${api_url}get-department-lawyer/${departmentId}`;

  useEffect(() => {
    const fetchLawyerData = async () => {
      try {
        const response = await fetch(lawyerURL);
        const data = await response.json();
        setLawyerData(data || []);
      } catch (error) {
        console.log('Error fetching lawyer data:', error);
      }
    };

    fetchLawyerData();
  }, [departmentId]);

  useEffect(() => {
    if (Array.isArray(lawyerData)) {
      const filtered = lawyerData.filter(lawyer =>
        lawyer.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLawyers(filtered);
    } else {
      setFilteredLawyers([]);
    }
  }, [searchQuery, lawyerData]);

  const handleSearch = query => {
    setSearchQuery(query);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }]}>
      <StatusBar backgroundColor={COLORS.primary} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <SearchBar handleSearch={handleSearch} />
        {filteredLawyers.length > 0 ? (
          <FeaturedLawyers
            title={i18next.language === 'en' ? `${filteredLawyers[0].department.name}` : `${filteredLawyers[0].department.ar_name}`}
            lawyerData={filteredLawyers}
          />
        ) : (
          <View style={styles.noLawyersContainer}>
            <Text style={[styles.noLawyersText, { color: colorScheme === 'dark' ? COLORS.primary : COLORS.black }]}>{t('NoLawyersAvailable')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Lawyers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexGrow: 1,
  },
  noLawyersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLawyersText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});