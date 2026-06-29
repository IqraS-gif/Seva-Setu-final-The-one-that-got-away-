import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Platform, 
  StatusBar, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Modal
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../../theme';
import { PrimaryButton, MadeInIndiaBadge, GradientBackground, IconButton, AshokaChakra } from '../../components';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { useAuthStore } from '../../services/store/useAuthStore';
import { useLanguage } from '../../context/LanguageContext';
import { AUTH_CONFIG } from '../../config/authConfig';

export const LoginScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const setAuthSession = useAuthStore(state => state.setAuthSession);
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  
  const role = route.params?.role || 'CITIZEN';

  const handleGoogleLoginSuccess = async (googleUser: { id: string; email: string; name: string; picture: string }) => {
    setLoading(true);
    try {
      const response = await fetch(AUTH_CONFIG.API_BASE_URL + '/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          role: role, // Selected role from login screen context
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.detail ?? `Server error: ${response.status}`);
      }

      const { access_token, user_role, user_id } = await response.json();

      await AsyncStorage.multiSet([
        ['authToken', access_token],
        ['userRole', user_role],
        ['userId', String(user_id)],
      ]);

      const mappedRole = user_role.toUpperCase() as 'CITIZEN' | 'VOLUNTEER' | 'SUPERVISOR';

      // Crucial: Set auth session in Zustand store to unlock routing!
      setAuthSession({
        id: String(user_id),
        name: googleUser.name,
        email: googleUser.email,
        role: mappedRole,
        avatar: googleUser.picture
      }, mappedRole);

    } catch (err: any) {
      Alert.alert('Google Sign-In Failed', err?.message ?? 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = async (navState: any) => {
    const { url } = navState;
    if (!url) return;
    console.log('[WebView Navigation] Loading URL:', url);
    if (url.includes('access_token=')) {
      setShowGoogleModal(false);
      setLoading(true);
      try {
        const hash = url.split('#')[1] || url.split('?')[1] || '';
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        
        if (!accessToken) {
          throw new Error('Access token not found in response');
        }
        
        // Fetch user info from Google
        const userinfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (!userinfoRes.ok) {
          throw new Error('Failed to fetch user profile from Google');
        }
        
        const data = await userinfoRes.json();
        await handleGoogleLoginSuccess({
          id: data.id,
          email: data.email,
          name: data.name,
          picture: data.picture,
        });
      } catch (err: any) {
        Alert.alert('Google Sign-In Error', err.message || 'Failed to authenticate with Google.');
        setLoading(false);
      }
    } else if (url.includes('error=')) {
      console.log('[WebView Navigation] Error URL detected:', url);
      setShowGoogleModal(false);
      Alert.alert('Google Sign-In Cancelled', 'Authentication error or user cancelled.');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        Alert.alert(t('auth.loginError'), result.message);
      }
    } catch (err) {
      Alert.alert(t('common.error'), 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth URL (Implicit Flow) using the working redirect URI
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${AUTH_CONFIG.GOOGLE_WEB_CLIENT_ID}&redirect_uri=${encodeURIComponent(AUTH_CONFIG.API_BASE_URL + '/redirect.html')}&response_type=token&scope=https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/userinfo.email+openid&prompt=select_account`;

  // Custom UserAgent to bypass Google's disallowed_useragent block
  const customUserAgent = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

  const handleGoogleLogin = () => {
    setShowGoogleModal(true);
  };

  // Render WebView full-screen overlay directly instead of a native Android Modal to prevent hardware crash
  if (showGoogleModal) {
    return (
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#fff', zIndex: 99999, paddingTop: Platform.OS === 'ios' ? 50 : 0 }]}>
        <StatusBar barStyle="dark-content" />
        <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderBottomWidth: 1, borderColor: '#eee' }}>
          <TouchableOpacity onPress={() => setShowGoogleModal(false)}>
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Sign in with Google</Text>
          <View style={{ width: 28 }} />
        </View>
        <WebView
          source={{ uri: googleAuthUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          onLoadStart={() => setWebViewLoading(true)}
          onLoadEnd={() => setWebViewLoading(false)}
          incognito={false}
          userAgent={customUserAgent}
        />
        {webViewLoading && (
          <ActivityIndicator
            style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -25 }, { translateY: -25 }] }}
            size="large"
            color={colors.primarySaffron}
          />
        )}
      </View>
    );
  }

  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
          <View style={styles.header}>
            <View style={{ paddingTop: insets.top + 10 }}>
              <View style={styles.topRow}>
                <IconButton 
                  iconName="arrow-left" 
                  iconColor="#FFFFFF" 
                  onPress={() => navigation.goBack()} 
                  style={styles.backBtn}
                />
                <LanguageToggle />
              </View>
              <Animated.View 
                entering={FadeInUp.delay(200).springify()}
                style={styles.headerContent}
              >
                <AshokaChakra size={60} color="#FFFFFF" opacity={0.2} style={styles.headerChakra} />
                <Text style={styles.title}>{t('auth.loginTitle')}</Text>
                <Text style={styles.subtitle}>
                  {t('auth.loginSubtitle')}
                </Text>
              </Animated.View>
            </View>
          </View>

          <View style={styles.content}>
            <Animated.View 
              entering={FadeInDown.delay(400).springify()}
              style={styles.formCard}
            >
              <View style={styles.roleIndicator}>
                <Ionicons 
                  name={role === 'SUPERVISOR' ? 'business' : role === 'VOLUNTEER' ? 'heart' : 'people'} 
                  size={16} 
                  color={colors.primarySaffron} 
                />
                <Text style={styles.roleIndicatorText}>
                  {role === 'SUPERVISOR' ? 'NGO Supervisor' : role.charAt(0) + role.slice(1).toLowerCase()} Login
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('auth.email')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    keyboardType="email-address"
                    placeholder={t('auth.emailPlaceholder')}
                    placeholderTextColor={colors.textSecondary + '60'}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('auth.password')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    secureTextEntry
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor={colors.textSecondary + '60'}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.forgotPassword} 
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>

              <PrimaryButton 
                title={loading ? t('auth.loggingIn') : t('auth.loginButton')} 
                onPress={handleLogin} 
                style={styles.loginBtn}
                disabled={!email || !password || loading}
              />
              
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.otpBtn} 
                onPress={() => navigation.navigate('OtpLogin', { role })}
              >
                <Ionicons name="phone-portrait-outline" size={18} color={colors.navyBlue} />
                <Text style={styles.otpBtnText}>{t('auth.loginWithOtp')}</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleBtn}
                onPress={handleGoogleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FF8C00" />
                ) : (
                  <>
                    <View style={styles.googleIconCircle}>
                      <Text style={styles.googleIconText}>G</Text>
                    </View>
                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(600).springify()}
              style={styles.registerContainer}
            >
              <Text style={styles.registerText}>{t('auth.noAccount')} </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Register', { role })}>
                 <Text style={styles.registerLink}>{t('auth.signUp')}</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.footer}>
              <MadeInIndiaBadge />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#1A237E',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: 60,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  headerContent: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginTop: 10,
  },
  headerChakra: {
    position: 'absolute',
    top: -20,
  },
  title: {
    ...typography.displayTitle,
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyText,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
    maxWidth: '80%',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    marginTop: -40,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
    marginBottom: spacing.xl,
  },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySaffron + '15',
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 24,
  },
  roleIndicatorText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primarySaffron,
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navyBlue,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.navyBlue,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primarySaffron,
  },
  loginBtn: {
    height: 56,
    borderRadius: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#BDBDBD',
    paddingHorizontal: 16,
  },
  otpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  otpBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navyBlue,
    marginLeft: 10,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 10,
    height: 52,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  googleIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  googleBtnText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#3C4043',
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primarySaffron,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    paddingBottom: 20,
  },
});

