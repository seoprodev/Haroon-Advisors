import Toast from 'react-native-simple-toast';
import { useState, useEffect, useRef } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { COLORS, api_url } from '../../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, useColorScheme, Linking, StyleSheet, Animated, Easing, ImageBackground, BackHandler, Platform, Alert, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Modal } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = () => {
    const flatListRef = useRef(null);
    const colorScheme = useColorScheme();
    const { userData, data, userType } = useLocalSearchParams();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const translateYAnim = useRef(new Animated.Value(0)).current;
    const parsedUserData = userData ? JSON.parse(decodeURIComponent(userData)) : null;
    const parsedData = data ? JSON.parse(decodeURIComponent(data)) : null;
    const navigation = useNavigation();
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [isZoomIconVisible, setIsZoomIconVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const onBackPress = () => {
            navigation.goBack();
            return true;
        };
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        };
    }, [navigation]);
    useEffect(() => {
        const checkConditions = () => {
            if (parsedData) {
                const today = new Date().toISOString().split('T')[0];
                const now = new Date();
                const currentTime = now.toTimeString().slice(0, 5);
                // Hide input when today is greater than parsedData.appDate
                const inputShouldBeVisible = userType === 'lawyer' || (userType === 'client' && today <= parsedData.appDate);
                // Show zoom icon when currentTime matches appointment_start_time
                const zoomIconShouldAppear = currentTime === parsedData.appointment_start_time.slice(0, 5);
                setIsInputVisible(inputShouldBeVisible);
                setIsZoomIconVisible(zoomIconShouldAppear); // Ensure state exists
            } else {
                setIsInputVisible(false);
                setIsZoomIconVisible(false);
            }
        };
        checkConditions();
        const interval = setInterval(checkConditions, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [userType, parsedData]);
    useEffect(() => {
        const animationLoop = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.2,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(translateYAnim, {
                        toValue: 0,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateYAnim, {
                        toValue: 0,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );
        animationLoop.start();
        return () => animationLoop.stop();
    }, [scaleAnim, translateYAnim]);
    useEffect(() => {
        const interval = setInterval(() => {
            fetchMessages();
        }, 3000);
        fetchMessages();
        loadMessagesFromStorage();
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        const requestPermissions = async () => {
            const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
            const { status: micStatus } = await Audio.requestPermissionsAsync();
            if (cameraStatus !== 'granted' || micStatus !== 'granted') {
                Alert.alert(
                    'Permissions Required',
                    'Camera and Microphone permissions are needed.',
                    [{ text: 'OK' }]
                );
            }
        };
        requestPermissions();
    }, []);
    const handleVideoIconPress = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (!userDataString) {
                console.warn('No user data found in AsyncStorage');
                return '';
            }
            const response = await fetch(api_url + 'zoom-sdk-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userData: userDataString
                }),
            });
            if (!response.ok) {
                console.warn(`Zoom SDK key fetch failed with status ${response.status}`);
                return '';
            }
            const sdkdata = await response.json();
            if (!sdkdata.sdkKey || !sdkdata.sdkSecret) {
                console.warn('Missing sdkKey or sdkSecret in response');
                return '';
            }
            const parsedsessionName = userType == 'client' ? `${parsedUserData.user.name} meets ${parsedData.name}` : `${parsedData.name} meets ${parsedUserData.user.name}`;
            const mysessionDuration = parsedUserData?.duration ?? parsedData?.duration ?? 30;
            router.push({
                pathname: '/screens/chat/CallScreen',
                params: {
                    sessionPasswordy: '',
                    sessionName: parsedsessionName,
                    sessionDuration: mysessionDuration,
                    displayName: parsedUserData.user.name,
                    roleType: userType == 'client' ? 0 : 1,
                    sdkKey: sdkdata.sdkKey,
                    sdkSecret: sdkdata.sdkSecret
                },
            });
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while checking permissions.');
        }
    };
    const loadMessagesFromStorage = async () => {
        try {
            const storedMessages = await AsyncStorage.getItem(`chat_${parsedData.id}`);
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages));
            }
        } catch (error) {
            Toast.show('Error loading messages from storage:', error);
        }
    };
    const saveMessagesToStorage = async (messages) => {
        try {
            await AsyncStorage.setItem(`chat_${parsedData.id}`, JSON.stringify(messages));
        } catch (error) {
            Toast.show('Error saving messages to storage:', error);
        }
    };
    const formatMessage = (message) => {
        let image;
        if (userType === 'lawyer') {
            image = message.send_user ? `${parsedData.img.uri}` : `${parsedUserData.user.image}`;
        } else {
            image = message.send_user ? `${parsedUserData.user.image}` : `${parsedData.img.uri}`;
        }
        return {
            id: message.id,
            text: message.message || '', // Default to empty string if message is missing
            sender: message.send_user ? 'user' : 'lawyer',
            image: image,
            createdAt: message.created_at,
            file: message.file ? { name: message.original_file_name, url: `${message.file}` } : null,
        };
    };
    const fetchMessages = async () => {
        try {
            let endpoint;
            let body;
            if (userType === 'lawyer') {
                endpoint = 'get-user-messages';
                body = { lawyer_id: parsedUserData.user.id, user_id: parsedData.id };
            } else {
                endpoint = 'get-messages';
                body = { user_id: parsedUserData.user.id, lawyer_id: parsedData.id };
            }
            const response = await fetch(api_url + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            const formattedMessages = result.messages.map(formatMessage);
            setMessages(formattedMessages);
            saveMessagesToStorage(formattedMessages);
        } catch (error) {
            Toast.show('Error fetching messages:', error);
        }
    };
    const handleSend = async () => {
        if (inputText.trim() || file) {
            setIsSending(true);
            const newMessage = {
                id: Math.random().toString(),
                text: inputText,
                sender: 'user',
                image: `${parsedUserData.user.image}`,
                createdAt: new Date().toISOString(),
                file: file ? { name: file.name, url: file.uri } : null,
            };
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages, newMessage];
                saveMessagesToStorage(updatedMessages);
                return updatedMessages;
            });
            setInputText('');
            setFile(null);
            setFileName('');
            const formData = new FormData();
            formData.append('user_id', parsedUserData.user.id);
            formData.append('lawyer_id', parsedData.id);
            formData.append('message', newMessage.text);
            if (file) {
                formData.append('file', { uri: file.uri, type: file.mimeType, name: file.name });
            }
            try {
                let endpoint = 'send-message';
                if (userType === 'lawyer') {
                    endpoint = 'send-lawyer-message';
                }
                const response = await fetch(api_url + endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    body: formData,
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const result = await response.json();
                setMessages(prevMessages => prevMessages.map(msg =>
                    msg.id === newMessage.id ? {
                        ...msg,
                        id: result.message.id,
                        file: result.message.file ? { name: result.message.original_file_name, url: result.message.file } : null
                    } : msg
                ));
                saveMessagesToStorage(messages);
            } catch (error) {
                Toast.show('Error sending message:', error);
                setMessages(prevMessages => prevMessages.filter(msg => msg.id !== newMessage.id));
                saveMessagesToStorage(messages);
            } finally {
                setIsSending(false);
            }
        }
    };
    const selectFile = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });
        if (!result.canceled) {
            const file = result.assets[0]; // Access the first item in the assets array
            setFile(file); // Save the file data (e.g., URI, name, type)
            setFileName(file.name); // Save the file name
            setImage(file.uri); // Set the image URI
        } else {
            console.log('Document picker cancelled');
        }
    };
    const renderItem = ({ item }) => {
        const isUserMessage = item.sender === 'user';
        const isLawyerMessage = item.sender === 'lawyer';
        const isMessageOnRight = userType === 'lawyer' ? isLawyerMessage : isUserMessage;
        return (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginVertical: 0, justifyContent: isMessageOnRight ? 'flex-end' : 'flex-start' }}>
                {!isMessageOnRight && (
                    <Image source={{ uri: item.image }} style={{ width: 50, height: 50, borderRadius: 50, marginRight: 10 }} />
                )}
                <View style={{ maxWidth: '80%', alignItems: isMessageOnRight ? 'flex-end' : 'flex-start' }}>
                    <View style={{
                        backgroundColor: isMessageOnRight ? COLORS.primary : '#E5E5E5',
                        borderRadius: 5,
                        padding: 10,
                        borderTopRightRadius: isMessageOnRight ? 0 : 10,
                        borderTopLeftRadius: !isMessageOnRight ? 0 : 10,
                    }}>
                        <Text style={{ fontSize: 18, color: '#000' }}>
                            {item.text?.split(/\s/).map((word, index) => {
                                const isLink = word.startsWith('http://') || word.startsWith('https://');
                                return isLink ? (
                                    <Text
                                        key={index}
                                        style={{ color: 'blue', textDecorationLine: 'underline' }}
                                        onPress={() => Linking.openURL(word)}
                                    >
                                        {word + ' '}
                                    </Text>
                                ) : (
                                    <Text key={index}>{word + ' '}</Text>
                                );
                            })}
                        </Text>
                        {item.file && (
                            item.file.url.toLowerCase().endsWith('.jpg') || item.file.url.toLowerCase().endsWith('.jpeg') || item.file.url.toLowerCase().endsWith('.png') ? (
                                // <Image source={{ uri: item.file.url }} style={{ width: 200, height: 200, borderRadius: 5, marginTop: 10, objectFit: 'contain' }} />
                                <TouchableOpacity onPress={() => {
                                    setSelectedImage(item.file.url);
                                    setModalVisible(true);
                                }}>
                                    <Image
                                        source={{ uri: item.file.url }}
                                        style={{ width: 200, height: 200, borderRadius: 5, marginTop: 10 }}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => Linking.openURL(item.file.url)}>
                                    <Text style={{ fontSize: 14, color: 'blue' }}>{item.file.name}</Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                    <Text style={{ fontSize: 12, color: '#fff', marginTop: 5 }}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
                {isMessageOnRight && (
                    <Image source={{ uri: item.image }} style={{ width: 50, height: 50, borderRadius: 50, marginLeft: 10 }} />
                )}
            </View>
        );
    };
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white, marginTop: -25, paddingBottom: 20 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust if you have a header
            >
                {/* <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white, paddingTop: 0, paddingBottom: 30 }}> */}
                <ImageBackground source={require('@/assets/images/global/chat-background.png')} style={{ flex: 1 }} imageStyle={colorScheme === 'dark' ? { opacity: 0.1 } : { opacity: 0.05 }}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={item => (item.id ? item.id.toString() : Math.random().toString())}
                        contentContainerStyle={{ flexGrow: 1, padding: 10 }}
                        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
                    />
                </ImageBackground>
                {file && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: '#181818', margin: 10, marginBottom: 0, borderRadius: 5 }}>
                        {file.mimeType.startsWith('image/') ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image source={{ uri: file.uri }} style={{ width: 50, height: 50, borderRadius: 5 }} />
                                <Text style={{ color: 'white', marginLeft: 10 }}>{fileName}</Text>
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesome color={COLORS.primary} name="file-pdf-o" size={30} />
                                <Text style={{ color: 'white', marginLeft: 10 }}>{fileName}</Text>
                            </View>
                        )}
                        {isSending ? (
                            <Text style={{ color: COLORS.primary }}>Uploading...</Text>
                        ) : (
                            <TouchableOpacity onPress={() => { setFile(null); setFileName(''); }}>
                                <FontAwesome color={COLORS.primary} name="times-circle" size={30} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                {isInputVisible && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }}>
                        <View style={{ position: 'relative', flex: 1 }}>
                            <TextInput
                                placeholderTextColor={colorScheme === 'dark' ? COLORS.primary : COLORS.black}
                                style={{ color: colorScheme === 'dark' ? COLORS.white : COLORS.black, fontSize: 20, height: 50, borderWidth: 1, borderRadius: 5, paddingHorizontal: 25, paddingRight: 85, borderColor: colorScheme === 'dark' ? COLORS.primary : COLORS.black }}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Type a message..."
                            />
                            <View style={{ position: 'absolute', right: 15, top: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={selectFile} style={{ marginRight: 10 }}>
                                    <FontAwesome color={COLORS.primary} name="paperclip" size={30} />
                                </TouchableOpacity>
                                <Animated.View
                                    style={[
                                        styles.iconContainer,
                                        {
                                            transform: [
                                                { scale: scaleAnim },
                                                { translateY: translateYAnim },
                                            ],
                                        },
                                    ]}
                                >
                                    <TouchableOpacity onPress={handleVideoIconPress}>
                                        <Image source={require('@/assets/images/global/zoom.png')} style={styles.gif} />
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={{ marginLeft: 5, backgroundColor: COLORS.primary, borderRadius: 5, padding: 12, opacity: inputText.trim() || file ? 1 : 0.5 }}
                            onPress={handleSend}
                            disabled={!inputText.trim() && !file}
                        >
                            <FontAwesome color={COLORS.white} name="send" size={25} />
                        </TouchableOpacity>
                    </View>
                )}
                {/* </SafeAreaView> */}
                <Modal visible={modalVisible} transparent={true}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }} onPress={() => setModalVisible(false)}>
                            <FontAwesome name="close" size={30} color="#fff" />
                        </TouchableOpacity>
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                style={{ width: '90%', height: '70%', borderRadius: 10 }}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    iconContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 0,
    },
    gif: {
        width: 30,
        height: 30,
    },
});