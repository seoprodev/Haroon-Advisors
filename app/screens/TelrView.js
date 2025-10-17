import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Dimensions, useColorScheme, TouchableOpacity, Text, Keyboard, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { base_url, COLORS } from '../../constants/theme';
import { useTranslation } from 'react-i18next';

const { height } = Dimensions.get('window');

const TelrView = ({ isVisible, url, onClose }) => {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Determine the height based on the URL
  const containerHeight = url === base_url + '/api/telr-payment-form' ? height * 0.9 : height * 0.8;

  const adjustedHeight = isKeyboardVisible
    ? height * 0.5 // shrink more if needed
    : url === base_url + '/api/telr-payment-form'
      ? height * 0.9
      : height * 0.8;

  const handleHttpError = ({ nativeEvent }) => {
    console.warn('HTTP error: ', nativeEvent);

    const errorMessage = nativeEvent.description || nativeEvent.statusCode
      ? `Error ${nativeEvent.statusCode}: ${nativeEvent.description}`
      : 'Payment gateway error occurred';

    Alert.alert(
      t('Payment Error'),
      errorMessage,
      [
        {
          text: t('OK'),
          onPress: () => onClose(),
          style: 'default'
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0} // adjust if your header height differs
      >
        <View
          style={[
            styles.innerContainer,
            { height: adjustedHeight },
            colorScheme === 'light' ? styles.lightMode : styles.darkMode,
          ]}
        >
          <WebView
            source={{ uri: url }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scrollEnabled={true}
            onHttpError={handleHttpError}
            onError={handleHttpError}
            style={styles.webView}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>{t('Close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  innerContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    borderTopWidth: 3,
    borderColor: COLORS.primary,
  },
  lightMode: {
    backgroundColor: 'transparent',
  },
  darkMode: {
    backgroundColor: 'transparent',
  },
  webView: {
    flex: 1,
  },
  buttonContainer: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default TelrView;