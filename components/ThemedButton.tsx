import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type TouchableOpacityProps, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedButtonProps = TouchableOpacityProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'primary' | 'secondary' | 'white';
  textProps?: TextProps;
  title: string;
  delayed?: boolean; // 👈 New prop
};

export function ThemedButton({
  style,
  lightColor,
  darkColor,
  type = 'default',
  textProps,
  title,
  delayed = false, // 👈 Default to false
  ...rest
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonBackground');
  const textColor = type === 'default' ? useThemeColor({}, 'text') : useThemeColor({}, 'buttonText');

  const [isLoading, setIsLoading] = useState(delayed);
  const [isDisabled, setIsDisabled] = useState(delayed);

  useEffect(() => {
    if (delayed) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsDisabled(false);
      }, 3000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [delayed]);

  return (
    <TouchableOpacity
      style={[
        { backgroundColor },
        type === 'default' ? styles.defaultButton : undefined,
        type === 'primary' ? styles.primaryButton : undefined,
        type === 'secondary' ? styles.secondaryButton : undefined,
        type === 'white' ? styles.whiteButton : undefined,
        style,
      ]}
      disabled={isDisabled || rest.disabled}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={type === 'secondary' ? 'white' : textColor} />
      ) : (
        <Text
          style={[{ color: type === 'secondary' ? 'white' : textColor }, styles.buttonText]}
          {...textProps}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  defaultButton: {
    padding: 0,
    width: 'auto',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    // paddingVertical: 15,
    // paddingHorizontal: 15,
    padding: 15,
    width: 'auto',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#81D8D0'
  },
  secondaryButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    width: 'auto',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161616',
  },
  whiteButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    width: 'auto',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  buttonText: {
    // color: 'red'
  },
});