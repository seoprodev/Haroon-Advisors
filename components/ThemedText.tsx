import React from 'react';
import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import i18next from 'i18next';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const currentLanguage = i18next.language;
  const fontFamily = currentLanguage === 'ar' ? 'ElMessiri' : 'Nunito';

  return (
    <Text
      style={[
        { color, fontFamily },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: i18next.language === 'ar' ? 'right' : 'left'
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: i18next.language === 'ar' ? 'right' : 'left'
  },
  title: {
    fontSize: 30,
    lineHeight: 32,
    textAlign: i18next.language === 'ar' ? 'right' : 'left'
  },
  subtitle: {
    fontSize: 20,
    textAlign: i18next.language === 'ar' ? 'right' : 'left'
  },
  link: {
    fontSize: 16,
    color: '#0a7ea4',
    textAlign: i18next.language === 'ar' ? 'right' : 'left'
  },
});