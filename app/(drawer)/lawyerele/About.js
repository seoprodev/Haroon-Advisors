import React, { useState, useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, Text, View, useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { FONTS, COLORS, IMAGES } from '../../../constants/theme';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const About = props => {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  // Helper function for rendering each section
  const renderSection = (titleKey, contentKey) => (
    <>
      <Text style={{ ...FONTS.h5, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
        {t(titleKey)}:
      </Text>
      <Text style={[FONTS.font, { color: colorScheme === 'dark' ? COLORS.white : colors.text, marginVertical: 15, textAlign: i18next.language === 'ar' ? 'right' : 'left' }]}>
        {t(contentKey)}
      </Text>
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }}>
      <ScrollView>
        <View style={{ backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white, padding: 10, borderRadius: 5, paddingBottom: 50 }}>
          <View style={{ paddingHorizontal: 50 }}>
            <Image style={{ height: 150, width: '100%', resizeMode: 'contain' }} source={colorScheme === 'dark' ? IMAGES.appLogo : IMAGES.darkappLogo} />
          </View>
          {/* Rendered Sections */}
          {renderSection('introduction_title', 'introduction_content')}
          {renderSection('mission_title', 'mission_content')}
          {renderSection('vision_title', 'vision_content')}
          {renderSection('belief_title', 'belief_content')}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default About;