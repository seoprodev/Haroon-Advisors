import React, { useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { Platform, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const SearchBar = ({ handleSearch }) => {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const [searchText, setSearchText] = useState('');
  const { t } = useTranslation();

  const onChangeText = text => {
    setSearchText(text);
    handleSearch(text);
  };

  return (
    <View
      style={[
        {
          shadowColor: '#000',
          shadowOffset: {
            width: 4,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 5,
          borderWidth: 1,
          borderRadius: 5,
          marginBottom: 20
        },
        Platform.OS === 'ios' && {
          backgroundColor: colors.cardBg,
          borderRadius: 5,
        },
      ]}>
      <TextInput
        textAlign={i18next.language === 'ar' ? 'right' : 'left'}
        style={{
          height: 50,
          borderRadius: 5,
          paddingLeft: 10,
          paddingRight: 50,
          color: colorScheme === 'dark' ? COLORS.white : COLORS.black,
          backgroundColor: colorScheme === 'dark' ? '#101010' : colors.card,
        }}
        placeholder={t('Search')}
        placeholderTextColor={colorScheme === 'dark' ? COLORS.primary : COLORS.black}
        value={searchText}
        onChangeText={onChangeText}
      />
      <TouchableOpacity
        style={{
          position: 'absolute',
          height: 48,
          width: 48,
          alignItems: 'center',
          justifyContent: 'center',
          right: 0,
          top: 0,
        }}>
        <Ionicons name="search-outline" size={24} color={colorScheme === 'light' ? COLORS.betabg : COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
