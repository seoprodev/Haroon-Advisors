# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Zoom Video SDK - CRITICAL for video calls
-keep class us.zoom.** { *; }
-keep class com.zipow.** { *; }
-keepclassmembers class * {
    @us.zoom.** *;
}
-dontwarn us.zoom.**
-dontwarn com.zipow.**

# Pusher WebSocket
-keep class com.pusher.** { *; }
-keep interface com.pusher.** { *; }
-dontwarn com.pusher.**
-keepattributes *Annotation*

# Google Sign In
-keep class com.google.android.gms.** { *; }
-keep class com.google.api.client.** { *; }
-dontwarn com.google.android.gms.**
-dontwarn com.google.api.client.**

# React Native SVG
-keep public class com.horcrux.svg.** {*;}

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# i18next / Localization
-keep class com.i18next.** { *; }
-keepattributes *Annotation*

# Axios / Networking
-keepattributes Signature
-keepattributes *Annotation*
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**

# React Native Screens
-keep class com.swmansion.rnscreens.** { *; }

# React Native Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# Hermes Engine
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Expo modules
-keep class expo.modules.** { *; }
-keep class expo.** { *; }
-dontwarn expo.**

# Image Picker
-keep class com.imagepicker.** { *; }

# Camera
-keep class org.unimodules.** { *; }

# General React Native
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# Keep generic signature of Call, Response (R8 full mode strips signatures from non-kept items)
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response

# With R8 full mode generic signatures are stripped for classes that are not kept
-keep,allowobfuscation,allowshrinking class kotlin.coroutines.Continuation

# Add any project specific keep options here:
