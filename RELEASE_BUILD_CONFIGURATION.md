# Release Build Configuration Guide

This document outlines all library-specific configurations required for successful release builds.

---

## ✅ Configuration Files Created

### 1. **babel.config.js** (CRITICAL)
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Must be last plugin
    ],
  };
};
```

**Why:** `react-native-reanimated` requires this Babel plugin to transform animations at build time. Without it, the app will crash in production.

### 2. **metro.config.js**
Basic Metro bundler configuration for Expo.

### 3. **android/app/proguard-rules.pro** (UPDATED)
Added ProGuard rules to prevent code stripping/obfuscation of critical libraries during minification.

---

## 🚨 Problematic Libraries & Their Fixes

### 1. **react-native-reanimated** (Line 7 in app/_layout.tsx)
- ✅ **Import Order:** Already imported at top of `app/_layout.tsx`
- ✅ **Babel Plugin:** Added to `babel.config.js`
- ⚠️ **Critical:** Babel plugin MUST be the last plugin in the array

**Symptoms if misconfigured:**
- App crashes on startup in release build
- "Cannot read property of undefined" errors with animations

---

### 2. **@zoom/react-native-videosdk**
- ✅ **ProGuard Rules:** Added to prevent Zoom SDK classes from being stripped
- ⚠️ **Requires:** Physical device for testing (not emulator)
- ⚠️ **Min SDK:** 26 (already configured in app.json)

**Symptoms if misconfigured:**
- Video calls crash
- "Class not found" errors
- Black screen during video calls

**ProGuard Rules Added:**
```
-keep class us.zoom.** { *; }
-keep class com.zipow.** { *; }
```

---

### 3. **@pusher/pusher-websocket-react-native**
- ✅ **ProGuard Rules:** Added
- ⚠️ **WebSocket:** May need polyfills for Android

**Symptoms if misconfigured:**
- Real-time chat doesn't work
- WebSocket connection failures
- "Unable to connect" errors

**ProGuard Rules Added:**
```
-keep class com.pusher.** { *; }
-keep interface com.pusher.** { *; }
```

---

### 4. **@react-native-google-signin/google-signin**
- ✅ **ProGuard Rules:** Added
- ⚠️ **Requires:** Valid `google-services.json`
- ⚠️ **Config:** URL scheme in app.json (already configured)

**Symptoms if misconfigured:**
- Google Sign In fails
- "Developer Error" on sign in
- Crashes when tapping Google button

**ProGuard Rules Added:**
```
-keep class com.google.android.gms.** { *; }
```

---

### 5. **react-native-svg**
- ✅ **ProGuard Rules:** Added
- ⚠️ **SVG Icons:** May render blank if obfuscated

**Symptoms if misconfigured:**
- Icons don't appear
- SVG elements show as blank
- Layout shifts

---

### 6. **i18next / react-i18next**
- ✅ **Import:** Ensure locales are bundled
- ⚠️ **Asset Patterns:** Check `assetBundlePatterns` in app.json

**Current app.json config:**
```json
"assetBundlePatterns": [
  "**/*",
  "app/services/locales/*"
]
```

**Symptoms if misconfigured:**
- Translations don't load
- App shows translation keys instead of text
- "Missing translation" errors

---

### 7. **expo-notifications**
- ✅ **Requires:** Physical device for testing
- ⚠️ **Permissions:** Must request at runtime

**Symptoms if misconfigured:**
- Push notifications don't work
- Permission requests fail

---

## 📋 Pre-Build Checklist

Before running `eas build`, verify:

- [ ] `babel.config.js` exists with reanimated plugin
- [ ] `metro.config.js` exists
- [ ] ProGuard rules updated in `android/app/proguard-rules.pro`
- [ ] `google-services.json` is valid and present
- [ ] iOS certificates are valid (for iOS builds)
- [ ] Version numbers incremented in `app.json`
- [ ] All native dependencies tested in development build
- [ ] `react-native-reanimated` imported at top of `app/_layout.tsx`

---

## 🔧 Clean Build Commands

If you encounter build issues, try cleaning:

```bash
# Clean Metro cache
npx expo start --clear

# Clean node modules
rm -rf node_modules
npm install

# Clean Android build (if using local builds)
cd android
./gradlew clean
cd ..

# Clean iOS build (Mac only)
cd ios
pod install --repo-update
cd ..

# Rebuild with EAS
eas build --platform android --profile production --clear-cache
```

---

## 🐛 Common Release Build Errors & Fixes

### Error: "Invariant Violation: Module AppRegistry is not a registered callable module"
**Cause:** Reanimated plugin not configured
**Fix:** Ensure `babel.config.js` has reanimated plugin as LAST plugin

### Error: "java.lang.ClassNotFoundException: us.zoom.sdk.ZoomSDK"
**Cause:** ProGuard stripped Zoom SDK classes
**Fix:** Ensure ProGuard rules include Zoom SDK (already added)

### Error: "Unable to resolve module crypto"
**Cause:** Missing Node.js polyfills for React Native
**Fix:** May need to add crypto polyfill (rare with Expo)

### Error: App stuck on splash screen
**Causes:**
1. Font loading failure
2. i18n initialization failure (see fix in `app/_layout.tsx`)
3. AsyncStorage initialization failure

**Fix:** Check the fixes applied to `app/_layout.tsx` and `app/services/i18next.js`

### Error: "Network request failed" in production
**Cause:** API URLs might be pointing to localhost or dev environment
**Fix:** Verify `constants/theme.js` has production URLs:
```javascript
export const base_url = "https://app.haroonadvisors.com/";
export const api_url = "https://app.haroonadvisors.com/api/";
```

---

## 📱 Testing Release Builds

### Android APK Testing:
```bash
# Build preview APK
eas build --platform android --profile preview

# Install on device
adb install path/to/app.apk
```

### Android AAB (Play Store):
```bash
# Build production AAB
eas build --platform android --profile production

# Test locally (requires bundletool)
bundletool build-apks --bundle=app.aab --output=app.apks
bundletool install-apks --apks=app.apks
```

### iOS IPA Testing:
```bash
# Build production IPA
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --latest
```

---

## 🔍 Debugging Release Builds

### View Android logs:
```bash
adb logcat | grep -i "ReactNative\|Expo\|Zoom\|Pusher"
```

### View iOS logs:
- Open Console.app on Mac
- Connect iPhone
- Filter by app name

### Common Log Keywords:
- "ClassNotFoundException" → ProGuard issue
- "Module not found" → Babel/Metro issue
- "WebSocket" → Pusher issue
- "Zoom" → Video SDK issue

---

## ⚙️ Build Optimization

### Reducing APK Size:
1. Enable ProGuard (already enabled in production)
2. Use AAB format (Play Store handles optimization)
3. Remove unused assets
4. Compress images

### Improving Performance:
1. Enable Hermes engine (already enabled by default in Expo 52)
2. Use Reanimated for animations (already using)
3. Optimize images with `expo-image`
4. Lazy load heavy screens

---

## 📚 Additional Resources

- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native ProGuard](https://reactnative.dev/docs/signed-apk-android#enabling-proguard-to-reduce-the-size-of-the-apk-optional)
- [Reanimated Installation](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation/)
- [Zoom SDK Documentation](https://developers.zoom.us/docs/meeting-sdk/react-native/)

---

**Last Updated:** October 2025
**Expo SDK:** 52
**React Native:** 0.76.6
