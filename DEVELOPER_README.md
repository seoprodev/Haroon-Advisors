# Developer Guide - Haroon Advisors

## Project Overview

**Haroon Advisors** is a React Native Expo application for a legal advisory platform that connects clients with lawyers through video consultations, chat, and document sharing.

### Tech Stack

- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript
- **State Management**: React Context/Hooks
- **Real-time Communication**: Pusher WebSocket
- **Video Conferencing**: Zoom Video SDK
- **Authentication**: Google Sign-In, Apple Sign-In
- **Internationalization**: i18next, react-i18next
- **HTTP Client**: Axios

---

## Key Features

### Core Functionality

- **Two User Types**: Clients and Lawyers (separate drawer navigation layouts)
- **Video Conferencing**: Integrated Zoom SDK for lawyer-client consultations
- **Real-time Chat**: Pusher WebSocket for instant messaging
- **Push Notifications**: Expo Notifications with device registration
- **Authentication**:
  - Google OAuth integration
  - Apple Sign-In for iOS
- **Multi-language Support**: i18next for internationalization
- **Media Features**:
  - Camera access for profile pictures
  - Document picker for file uploads
  - Image picker for attachments
- **Calendar Integration**: Schedule appointments with lawyers

---

## Project Structure

```
Haroon-Advisors/
├── app/                          # Main application code (Expo Router)
│   ├── (drawer)/                 # Drawer navigation layouts
│   │   ├── clientele/            # Client-specific screens
│   │   └── lawyerele/            # Lawyer-specific screens
│   ├── screens/                  # Individual screens
│   │   ├── chat/                 # Chat and video call screens
│   │   ├── AllNotifications.tsx
│   │   ├── SearchLawyers.tsx
│   │   └── ...
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry screen
├── components/                   # Reusable UI components
├── src/                          # Services, utilities, and business logic
├── assets/                       # Images, fonts, and static resources
├── constants/                    # App-wide constants
├── hooks/                        # Custom React hooks
├── android/                      # Android native project
├── ios/                          # iOS native project
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- For iOS development: Mac with Xcode
- For Android development: Android Studio (optional with Expo Go)

### Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npx expo start
   ```

3. **Run on Device/Emulator**

   After starting, you'll see options in the terminal:

   - **Android Emulator**: Press `a`
   - **iOS Simulator** (Mac only): Press `i`
   - **Physical Device with Expo Go**:
     - Install **Expo Go** app from App Store/Play Store
     - Scan the QR code displayed in terminal

4. **Run with Development Build** (Recommended for full features)

   Since this project uses native modules (Zoom SDK, Camera, etc.), you may need a development build:

   ```bash
   # For Android
   npx expo run:android

   # For iOS (Mac only)
   npx expo run:ios
   ```

---

## Available Scripts

```bash
# Development
npm start                  # Start Expo dev server
npm run android           # Build and run on Android device/emulator
npm run ios               # Build and run on iOS simulator
npm run web               # Run in web browser

# Testing
npm test                  # Run Jest tests in watch mode

# Build (Production)
eas build --platform android    # Build Android app bundle
eas build --platform ios        # Build iOS app

# Utilities
npm run lint              # Run ESLint
npm run reset-project     # Reset to starter template
```

---

## Expo vs React Native CLI

If you're coming from React Native CLI, here are the key differences:

| **Aspect**         | **Expo**                                     | **React Native CLI**                                  |
| ------------------ | -------------------------------------------- | ----------------------------------------------------- |
| **Setup**          | Managed workflow with pre-configured modules | Manual linking of native modules                      |
| **Start Command**  | `npx expo start`                             | `npx react-native start` + `react-native run-android` |
| **Navigation**     | Expo Router (file-based)                     | Manual React Navigation setup                         |
| **Native Modules** | Pre-built Expo modules                       | Manual installation and linking                       |
| **Build Process**  | EAS Build (cloud-based)                      | Local builds with Android Studio/Xcode                |
| **Updates**        | OTA updates via EAS Update                   | Manual app store deployments                          |
| **Development**    | Expo Go app for quick testing                | Requires native dev environment from start            |
| **Configuration**  | app.json (declarative)                       | Native config files (Info.plist, AndroidManifest)     |

### Key Concepts for Expo

1. **File-based Routing**:

   - Files in `app/` directory automatically become routes
   - `app/index.tsx` → `/` (root)
   - `app/screens/explore.tsx` → `/screens/explore`
   - Folders with `_layout.tsx` create nested navigation

2. **Expo Config Plugins**:

   - Native features configured in `app.json` under `plugins`
   - No need to manually edit native files for most features

3. **Development Client**:
   - For native features, use `expo-dev-client` instead of Expo Go
   - Run `npx expo run:android` or `npx expo run:ios` once to create dev build

---

## Important Configuration Files

### app.json

- App name, version, bundle identifiers
- Platform-specific configs (iOS, Android)
- Permissions and plugins
- Expo configuration

### eas.json

- EAS Build profiles (development, preview, production)
- Build configuration for Android and iOS

### google-services.json / GoogleService-Info.plist

- Firebase/Google services configuration
- Required for Google Sign-In and Push Notifications

---

## Key Dependencies

### Navigation

- `expo-router` - File-based routing
- `@react-navigation/native` - Navigation library
- `@react-navigation/drawer` - Drawer navigation
- `@react-navigation/stack` - Stack navigation

### Authentication & Communication

- `@react-native-google-signin/google-signin` - Google OAuth
- `expo-apple-authentication` - Apple Sign-In
- `@pusher/pusher-websocket-react-native` - Real-time messaging
- `@zoom/react-native-videosdk` - Video conferencing

### Media & Permissions

- `expo-camera` - Camera access
- `expo-image-picker` - Photo/video selection
- `expo-document-picker` - Document selection
- `react-native-permissions` - Permission management

### UI & Utilities

- `react-native-calendars` - Calendar component
- `react-native-otp-entry` - OTP input
- `i18next` & `react-i18next` - Internationalization
- `axios` - HTTP client

---

## Environment Setup

### Android Development

- Install Android Studio (optional with Expo Go)
- Set up Android emulator or connect physical device
- Enable USB debugging on physical device

### iOS Development (Mac only)

- Install Xcode from App Store
- Install Xcode Command Line Tools: `xcode-select --install`
- Set up iOS Simulator

---

## Build Information

### Development Build

SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

### Production Build

SHA-1: `79:F1:6C:4D:DB:F0:FC:C5:D1:A0:E7:67:8B:70:78:39:0A:57:D7:28`

### Building for Production

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios

# Both platforms
eas build --platform all
```

---

## Development Workflow

### When to Rebuild vs Just Restart Server

**You only need to rebuild (`npx expo run:android` or `npx expo run:ios`) when:**

- Installing the app for the first time
- Adding/removing native modules (packages that modify native code)
- Changing native Android/iOS configuration (gradle files, AndroidManifest.xml, Info.plist, etc.)
- Updating Expo SDK version

**For JavaScript/TypeScript changes, just restart the Metro server:**

```bash
npx expo start
```

Once the app is installed on your phone, it will automatically connect to the Metro bundler and hot reload your code changes. No rebuild needed!

---

## Troubleshooting

### Common Issues

1. **Metro bundler cache issues**

   ```bash
   npx expo start --clear
   ```

2. **Native module not found**

   - Rebuild the development client

   ```bash
   npx expo run:android --device
   ```

3. **Pod install fails (iOS)**

   ```bash
   cd ios && pod install --repo-update && cd ..
   ```

4. **Gradle build errors (Android)**

   - Check Android SDK path
   - Clear Gradle cache: `cd android && ./gradlew clean && cd ..`

5. **Android build fails with "No variants exist" errors**

   - Clean and reinstall dependencies:

   ```bash
   cd android && ./gradlew clean && cd ..
   rm -rf node_modules package-lock.json
   npm install
   npx expo prebuild --clean
   ```

6. **MinSdkVersion conflict (Zoom SDK requires API 26+)**
   - Update `android/build.gradle`:
   ```gradle
   minSdkVersion = Integer.parseInt(findProperty('android.minSdkVersion') ?: '26')
   ```

---

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

## Notes

- This project uses **Expo Router** for navigation (file-based routing)
- **expo-dev-client** is configured for custom native modules
- The app supports both iOS and Android platforms
- Production builds are managed through **EAS Build**
- The project uses React Native's **New Architecture** (`newArchEnabled: true`)
