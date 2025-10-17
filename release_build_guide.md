# Release Build Guide - Haroon Advisors

Complete guide for creating production release builds for iOS and Android from Windows OS using EAS Build.

---

## Prerequisites (One-time Setup)

### 1. Install EAS CLI globally
```bash
npm install -g eas-cli
```

### 2. Login to your Expo account
```bash
eas login
```
Use your Expo account credentials (owner: "webdesignmarvel")

### 3. Verify project configuration
```bash
eas whoami
```
This should show your logged-in Expo account.

---

## ANDROID BUILDS

### Option A: APK (for testing/distribution outside Play Store)

#### Step 1: Build APK
```bash
eas build --platform android --profile preview
```

**What happens:**
- Builds on Expo's cloud servers
- Takes 10-20 minutes
- Creates an APK file you can install directly on devices

#### Step 2: Download the APK
After build completes:
- EAS will show a download URL in terminal
- Or visit: https://expo.dev/accounts/webdesignmarvel/projects/haroon-portal-fzco/builds
- Download the `.apk` file
- Install on Android devices directly (enable "Install from unknown sources")

---

### Option B: AAB/Bundle (for Google Play Store submission)

#### Step 1: Build production AAB
```bash
eas build --platform android --profile production
```

#### Step 2: Download the AAB
- Get the `.aab` file from the EAS dashboard
- This is the format required for Google Play Store

#### Step 3: Upload to Google Play Console
- Go to Google Play Console: https://play.google.com/console
- Navigate to your app ’ Production ’ Create new release
- Upload the `.aab` file
- Fill out release notes and submit for review

---

## iOS BUILDS (Must use EAS - Windows can't build iOS locally)

### Step 1: Ensure you have Apple Developer credentials

**You need:**
- Apple ID: `info@haroonadvisors.com` (already configured in `eas.json`)
- Apple Team ID: `Q85MP6C4D8` (already configured)
- App Store Connect access
- **Important:** You must have proper signing credentials

### Step 2: Build for iOS

```bash
eas build --platform ios --profile production
```

**First-time build:** EAS will ask about credentials:
- Choose "Generate new credentials" or "Use existing credentials"
- EAS will handle provisioning profiles and certificates automatically

**What you'll need to provide:**
- Apple ID password (or App-specific password if 2FA is enabled)
- Agreement to Apple Developer Program terms

### Step 3: Download IPA
- After build completes (15-30 minutes)
- Download the `.ipa` file from EAS dashboard

### Step 4: Submit to App Store

**Option A: Use EAS Submit (Recommended)**
```bash
eas submit --platform ios --latest
```
This automatically uploads your latest iOS build to App Store Connect.

**Option B: Manual upload**
- Go to App Store Connect: https://appstoreconnect.apple.com
- Navigate to your app (ASC App ID: 6742163469)
- Create new version
- Upload IPA using Transporter app or Xcode

---

## Build BOTH Platforms at Once

```bash
eas build --platform all --profile production
```

This triggers both Android and iOS builds simultaneously.

---

## Common Build Commands Reference

```bash
# Check build status
eas build:list

# Build specific version with auto-increment
eas build --platform android --profile production --auto-submit

# Preview build for testing
eas build --platform android --profile preview

# View build logs
eas build:view <build-id>

# Cancel a running build
eas build:cancel

# Check credentials
eas credentials

# View project info
eas project:info
```

---

## Version Management

Before building, update version in `app.json`:

```json
{
  "expo": {
    "version": "1.0.0",  // Update this for new releases
    "ios": {
      "buildNumber": "1"  // Add/increment this for iOS
    },
    "android": {
      "versionCode": 1  // Add/increment this for Android
    }
  }
}
```

**Version numbering rules:**
- **version**: User-facing version (1.0.0, 1.0.1, 1.1.0, etc.)
- **buildNumber** (iOS): Must increment with each upload to App Store
- **versionCode** (Android): Must increment with each upload to Play Store

---

## Production Build Checklist

Before running production builds, verify:

- [ ] Updated `version` in app.json
- [ ] Incremented `buildNumber` (iOS) and `versionCode` (Android)
- [ ] All API endpoints point to production (check `constants/theme.js`)
- [ ] Thoroughly tested app in development
- [ ] `google-services.json` is present and valid
- [ ] iOS certificates are valid and not expired
- [ ] Reviewed app permissions in app.json
- [ ] Updated splash screen and app icons if needed
- [ ] Tested both light and dark mode
- [ ] Tested RTL layout (Arabic language)
- [ ] Verified both client and lawyer user flows

---

## EAS Build Profiles Explained

Your `eas.json` contains three build profiles:

### 1. **development**
```json
{
  "developmentClient": true,
  "distribution": "internal",
  "ios": { "simulator": true }
}
```
- For dev builds with expo-dev-client
- Includes development tools
- iOS can run on simulator

### 2. **preview**
```json
{
  "distribution": "internal"
}
```
- Creates APK for internal testing (Android)
- Creates IPA for TestFlight (iOS)
- Good for QA and beta testing

### 3. **production**
```json
{
  "autoIncrement": false
}
```
- Creates AAB for Play Store (Android)
- Creates IPA for App Store (iOS)
- Production-ready builds

---

## Project Configuration Summary

### Android Configuration
- **Package name:** `com.haroonadvisors`
- **Min SDK:** 26 (required by Zoom SDK)
- **Target SDK:** 35
- **Compile SDK:** 35
- **Build tools:** 35.0.0
- **Kotlin version:** 1.9.25
- **Required file:** `google-services.json` 

### iOS Configuration
- **Bundle identifier:** `com.haroonadvisors`
- **Apple Team ID:** Q85MP6C4D8
- **App Store Connect ID:** 6742163469
- **Apple ID:** info@haroonadvisors.com
- **Uses Apple Sign In:** Yes
- **Required permissions:** Camera, Microphone, Bluetooth, Photo Library, Location

---

## Cost & Limitations

### EAS Build Pricing
- **Free tier:** Limited build minutes per month
- **Paid plans:** Unlimited builds, faster queue priority, priority support
- Check usage: https://expo.dev/accounts/webdesignmarvel/settings/billing

### Build Times (Approximate)
- **Android:** 10-20 minutes
- **iOS:** 15-30 minutes
- **Both platforms:** Runs in parallel

---

## Troubleshooting Common Issues

### Build fails with "Invalid credentials"
```bash
eas credentials
```
Choose platform and re-configure credentials.

### Android build fails
**Possible causes:**
- Invalid `google-services.json`
- Package name mismatch
- SDK version conflicts

**Solutions:**
- Verify `google-services.json` is valid
- Check package name matches: `com.haroonadvisors`
- Review Android configuration in `app.json`

### iOS build fails
**Possible causes:**
- Expired Apple Developer account
- Invalid certificates/provisioning profiles
- Bundle identifier mismatch
- Team ID issues

**Solutions:**
- Ensure Apple Developer account is active and paid ($99/year)
- Check bundle identifier: `com.haroonadvisors`
- Verify Apple Team ID is correct: Q85MP6C4D8
- Regenerate credentials: `eas credentials`

### Build gets stuck in queue
**Solutions:**
- Check EAS status: https://status.expo.dev
- Cancel and retry: `eas build:cancel` then rebuild
- Consider upgrading to paid plan for priority queue

### Native module errors
**Solutions:**
- Ensure all native dependencies are properly configured in `app.json` plugins
- Check `expo-build-properties` configuration
- Review CLAUDE.md for native dependencies list

### Build succeeds but app crashes on launch
**Common causes:**
- Missing environment variables
- API endpoint misconfiguration
- Invalid AsyncStorage data
- Zoom SDK configuration issues

**Solutions:**
- Check `constants/theme.js` for correct API URLs
- Test with fresh install (clear app data)
- Review Zoom SDK appGroupId configuration
- Check app logs in device console

---

## Distribution Workflows

### Internal Testing (Before Store Submission)

**Android:**
1. Build APK: `eas build --platform android --profile preview`
2. Download and share APK file with testers
3. Install on devices (enable "Unknown sources")

**iOS:**
1. Build IPA: `eas build --platform ios --profile preview`
2. Submit to TestFlight: `eas submit --platform ios --latest`
3. Invite internal testers via App Store Connect
4. Testers install via TestFlight app

### Store Submission

**Google Play Store:**
1. Build AAB: `eas build --platform android --profile production`
2. Go to Play Console: https://play.google.com/console
3. Create new release
4. Upload AAB
5. Fill out release notes
6. Submit for review (typically 1-3 days)

**Apple App Store:**
1. Build IPA: `eas build --platform ios --profile production`
2. Submit: `eas submit --platform ios --latest`
3. Go to App Store Connect: https://appstoreconnect.apple.com
4. Fill out app information
5. Submit for review (typically 1-3 days)

---

## Quick Reference Commands

### First Time Setup
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Verify login
eas whoami
```

### Build Commands
```bash
# Android APK (testing)
eas build --platform android --profile preview

# Android AAB (Play Store)
eas build --platform android --profile production

# iOS IPA (App Store)
eas build --platform ios --profile production

# Both platforms
eas build --platform all --profile production
```

### Submission Commands
```bash
# Submit iOS to App Store
eas submit --platform ios --latest

# Submit Android to Play Store
eas submit --platform android --latest
```

### Management Commands
```bash
# List all builds
eas build:list

# View specific build
eas build:view <build-id>

# Check credentials
eas credentials

# View project info
eas project:info

# Cancel running build
eas build:cancel
```

---

## Post-Build Checklist

After successful build:

- [ ] Download build artifacts from EAS dashboard
- [ ] Test installation on physical devices
- [ ] Verify app launches successfully
- [ ] Test login/authentication flow
- [ ] Test video calls (Zoom SDK)
- [ ] Test push notifications
- [ ] Test both client and lawyer roles
- [ ] Test language switching (English/Arabic)
- [ ] Test dark mode
- [ ] Verify appointment booking functionality
- [ ] Test chat functionality
- [ ] Check app performance
- [ ] Review crash reports (if any)

---

## Important Links

- **EAS Dashboard:** https://expo.dev/accounts/webdesignmarvel/projects/haroon-portal-fzco
- **Build History:** https://expo.dev/accounts/webdesignmarvel/projects/haroon-portal-fzco/builds
- **Google Play Console:** https://play.google.com/console
- **App Store Connect:** https://appstoreconnect.apple.com
- **EAS Status:** https://status.expo.dev
- **EAS Documentation:** https://docs.expo.dev/build/introduction/
- **Expo Forums:** https://forums.expo.dev

---

## Notes

- **Windows Limitation:** You cannot build iOS apps locally on Windows. EAS Build solves this by building on macOS cloud servers.
- **Zoom SDK Requirement:** App requires physical devices for testing video calls (simulators/emulators have limitations).
- **Build Artifacts:** Keep build URLs or download builds for your records.
- **Credentials Security:** Never commit Apple certificates, provisioning profiles, or keystore files to git.
- **Version Control:** Always tag releases in git after successful store submissions.

---

## Support

If you encounter issues:
1. Check troubleshooting section above
2. Review EAS build logs: `eas build:view <build-id>`
3. Check Expo forums: https://forums.expo.dev
4. Review project docs: CLAUDE.md, API_REQUIREMENTS.md
5. Contact Expo support (paid plans include priority support)

---

**Last Updated:** October 2025
**Project Version:** 1.0.0
**Expo SDK:** 52
**React Native:** 0.76.6
