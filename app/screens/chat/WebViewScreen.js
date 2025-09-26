import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';

export default function WebViewScreen() {
    const { url } = useLocalSearchParams();

    return (
        <WebView source={{ uri: decodeURIComponent(url) }} />
    );
}