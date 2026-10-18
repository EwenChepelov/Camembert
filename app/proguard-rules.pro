# ProGuard rules for Camembert
# Android optimization rules

# Keep WebView related classes
-keep class android.webkit.** { *; }

# Keep MainActivity and Application classes
-keep class fr.chepelov.camembert.** { *; }

# Keep all Activities, Services, and BroadcastReceivers
-keep class * extends android.app.Activity
-keep class * extends android.app.Service
-keep class * extends android.content.BroadcastReceiver

# Keep Parcelable classes
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep R classes
-keep class **.R$* { *; }

# Keep native methods
-keep class * extends java.lang.Object {
    native <methods>;
}

# WebView specific optimizations
-keep class * extends android.webkit.WebViewClient
-keep class * extends android.webkit.WebChromeClient

# Keep JavaScript interfaces if used
-keep class * implements android.webkit.JavascriptInterface

# Optimize for Android 17
-optimizations !code/simplification/arithmetic
-optimizations !code/simplification/cast
-optimizations !field/*,!class/merging/*

# Keep all classes in the main package
-keep class fr.chepelov.camembert.** { *; }

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
}
