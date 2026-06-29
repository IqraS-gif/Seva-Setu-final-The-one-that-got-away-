/**
 * Google OAuth & API Configuration
 *
 * To fill these values:
 * 1. Go to console.cloud.google.com
 * 2. Create project > APIs & Services > Credentials > Create OAuth Client ID
 * 3. Create three clients: Web, Android (needs SHA-1), iOS (needs bundle ID)
 * 4. For Android SHA-1 in dev: run
 *      keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
 * 5. For production SHA-1: run `eas credentials` after setting up EAS
 */

export const AUTH_CONFIG = {
  GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  API_BASE_URL: process.env.EXPO_PUBLIC_PRODUCTION_API_URL || '',
};

