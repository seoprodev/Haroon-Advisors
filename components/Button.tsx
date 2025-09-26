import React from 'react';
import { Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  textColor?: string;
  btnSquare?: boolean;
  btnRounded?: boolean;
}

const Button: React.FC<ButtonProps> = (props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => props.onPress && props.onPress()}
      style={[
        {
          backgroundColor: props.backgroundColor ? props.backgroundColor : COLORS.black,
          paddingHorizontal: 5,
          paddingVertical: 15,
          borderRadius: props.btnSquare ? 0 : props.btnRounded ? 30 : SIZES.radius,
          alignItems: 'center',
        },
        props.style,
      ]}
    >
      <Text style={[{ ...FONTS.h6, color: COLORS.white }, props.textColor && { color: props.textColor }]}>
        {props.title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;