import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import { AUTH_CONFIG } from '../config/authConfig';

// Detect if running inside Expo Go (as opposed to a standalone/dev build)
const isExpoGo = Constants.appOwnership === 'expo';

// The auth.expo.io proxy URL — must match EXACTLY what is registered in
// Google Cloud Console > Web client > Authorized redirect URIs
const EXPO_GO_REDIRECT_URI = 'https://auth.expo.io/@rizwan098/SevaSetu';

// Must be called at module level — completes the auth session on redirect
WebBrowser.maybeCompleteAuthSession();

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Android native OAuth uses the REVERSE of the client ID as the redirect scheme.
  // Format: com.googleusercontent.apps.{CLIENT_ID_PREFIX}:/oauth2redirect
  // This is how Android tells the OS to route the OAuth callback back to this app.
  const ANDROID_REDIRECT = makeRedirectUri({
    native: `com.googleusercontent.apps.${AUTH_CONFIG.GOOGLE_ANDROID_CLIENT_ID.replace('.apps.googleusercontent.com', '')}:/oauth2redirect`,
  });

  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: AUTH_CONFIG.GOOGLE_WEB_CLIENT_ID,
    iosClientId: AUTH_CONFIG.GOOGLE_IOS_CLIENT_ID,
    webClientId: AUTH_CONFIG.GOOGLE_WEB_CLIENT_ID,
    redirectUri: EXPO_GO_REDIRECT_URI,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      setIsLoading(true);
      setError(null);

      const accessToken = response.authentication?.accessToken;

      if (!accessToken) {
        setError('Authentication succeeded but no access token was returned.');
        setIsLoading(false);
        return;
      }

      fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Google userinfo request failed with status ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const { id, email, name, picture } = data as GoogleUser;
          setUser({ id, email, name, picture });
        })
        .catch((err: Error) => {
          setError(err.message ?? 'Failed to fetch Google user info.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [response]);

  return {
    promptAsync,
    isLoading,
    user,
    error,
    clearUser: () => setUser(null),
  };
}
