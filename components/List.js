import React from 'react';
import { COLORS, FONTS } from '../constants/theme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { Image, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import i18next from 'i18next';

const List = ({ image, title, ar_title, location, designation, ar_designation, packageId, packageEndDate, isOnline, onPress }) => {
  const colorScheme = useColorScheme();
  let borderColor = colorScheme === 'light' ? COLORS.primary : COLORS.betabg;
  let gradientColors = ['#FFD700', '#FFA500'];
  const today = new Date();
  const isExpired = packageEndDate < today;

  if (isExpired) {
    borderColor = packageId === 1 ? 'gold' : packageId === 2 ? 'silver' : borderColor;
    gradientColors = packageId === 2 ? ['#C0C0C0', '#B0B0B0'] : gradientColors;
  }

  const containerStyle = [
    GlobalStyleSheet.row,
    {
      backgroundColor: colorScheme === 'light' ? COLORS.white : COLORS.betabg,
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      borderWidth: 1,
      borderColor,
      gap: 10,
      overflow: 'hidden',
      flexWrap: 'nowrap',
      flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row'
    },
  ];

  const badgeStyle = {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const onlineStatusStyle = {
    position: 'absolute',
    bottom: 5,
    left: 5,
    height: 15,
    width: 15,
    borderRadius: 50,
    backgroundColor: isOnline === 1 ? COLORS.online : 'red',
    borderWidth: 2,
    borderColor: colorScheme === 'dark' ? COLORS.white : COLORS.background,
  };

  const textStyle = {
    ...FONTS.font,
    fontSize: 12,
    width: '100%',
    ...FONTS.fontArabic,
    marginTop: 5,
    color: colorScheme === 'dark' ? COLORS.white : '#525252',
    textAlign: i18next.language === 'ar' ? 'right' : 'left'
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={containerStyle}>
        <View style={{ gap: 0, width: '30%', backgroundColor: 'white', borderRadius: 5, order: i18next.language === 'ar' ? 2 : 1 }}>
          <Image source={{ uri: image }} style={{ height: 100, width: '100%', resizeMode: 'contain', borderRadius: 5, marginRight: 20, borderWidth: 1, borderColor: isOnline === 1 ? COLORS.online : 'red' }} />
          <View style={onlineStatusStyle} />
        </View>

        <View style={{ width: '70%', order: i18next.language === 'ar' ? 1 : 2 }}>
          {isExpired && (
            <View style={{ ...badgeStyle, backgroundColor: packageId === 1 ? 'gold' : packageId === 2 ? 'silver' : 'transparent', }}>
              <Text style={{ color: COLORS.black, fontSize: 12 }}>
                {packageId === 1 ? 'Gold Member' : packageId === 2 ? 'Silver Member' : ''}
              </Text>
            </View>
          )}
          <ThemedText type="title" style={{ fontSize: 18, width: '100%', textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>{i18next.language === 'ar' ? ar_title : title}</ThemedText>
          {/* <ThemedText type="link" style={textStyle}>{i18next.language === 'ar' ? 'الإمارات العربية المتحدة' : 'United Arab Emirates'}</ThemedText> */}
          {/* <ThemedText type="default" style={textStyle}>{i18next.language === 'ar' ? ar_designation : designation}</ThemedText> */}
          {/* client wanted these removed Ref: Task#9 */}

        </View>
      </View>

    </TouchableOpacity>
  );
};

export default List;