import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { COLORS } from '../constants/theme';

const MessageInputBar = ({ onSend, onSelectFile, isSending, colorScheme }) => {
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (inputText.trim()) {
            onSend(inputText);
            setInputText('');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }]}>
            <View style={{ position: 'relative', flex: 1 }}>
                <TextInput
                    placeholderTextColor={colorScheme === 'dark' ? COLORS.primary : COLORS.black}
                    style={[
                        styles.input,
                        {
                            color: colorScheme === 'dark' ? COLORS.white : COLORS.black,
                            borderColor: colorScheme === 'dark' ? COLORS.primary : COLORS.black,
                        },
                    ]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                />
                <View style={styles.iconContainer}>
                    <TouchableOpacity onPress={onSelectFile} style={{ marginRight: 10 }}>
                        <FontAwesome color={COLORS.primary} name="paperclip" size={30} />
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity
                style={[
                    styles.sendButton,
                    { backgroundColor: COLORS.primary, opacity: inputText.trim() ? 1 : 0.5 },
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isSending}
            >
                <FontAwesome color={COLORS.white} name="send" size={25} />
            </TouchableOpacity>
        </View>
    );
};

export default MessageInputBar;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    input: {
        fontSize: 20,
        height: 50,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 25,
        paddingRight: 85,
    },
    iconContainer: {
        position: 'absolute',
        right: 15,
        top: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sendButton: {
        marginLeft: 5,
        borderRadius: 5,
        padding: 12,
    },
});