import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

const Chip = props => {
  return (
    <>
      <TouchableOpacity onPress={props.onPress}
        style={[
          styles.container,
          props.style,
          {
            backgroundColor: props.darkMode ? COLORS.dark : COLORS.primary,
          },
          props.chipLarge && {
            paddingVertical: 9,
          },
          props.chipSmall && {
            paddingVertical: 5,
          },
        ]}>        
        <Text numberOfLines={1} style={styles.text}>{props.title}</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 50,
  },
  text: {
    ...FONTS.fontXs,
    color: COLORS.title,
    fontWeight: 'bold'
  },
});

export default Chip;