import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, Animated, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, globalStyles } from '../../theme';
import { PrimaryButton, MadeInIndiaBadge, GradientBackground } from '../../components';
import { useAuthStore } from '../../services/store/useAuthStore';
import { FirebaseRecaptchaVerifierModal } from '../../components/FirebaseRecaptcha';
import { auth } from '../../config/firebaseConfig';
import { useLanguage } from '../../context/LanguageContext';

export const OtpLoginScreen = ({ onSelectRole }: { onSelectRole?: (role: any) => void }) => {
  const navigation = useNavigation<any>();
  const { sendOtp, verifyOtp } = useAuthStore();
  const { t } = useLanguage();
  const route = useRoute<any>();
  const role = route.params?.role || 'CITIZEN';
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);

  const otpAnimation = useRef(new Animated.Value(0)).current;
  const recaptchaVerifier = useRef<any>(null);

  useEffect(() => {
    let interval: any;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  const handleSendOtp = async () => {
    if (phoneNumber.length === 10) {
      setLoading(true);
      try {
        const result = await sendOtp(phoneNumber, recaptchaVerifier.current);
        if (result.success) {
          setConfirmation(result.confirmation);
          setIsOtpSent(true);
          Animated.timing(otpAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        } else {
          Alert.alert(t('common.error'), result.message || t('auth.otp.failedSend'));
        }
      } catch (err: any) {
        console.error('[Phone Auth] Error:', err);
        Alert.alert(t('common.error'), err.message || t('auth.otp.error'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerify = async () => {
    if (otp.length === 6) {
      setLoading(true);
      try {
        const result = await verifyOtp(confirmation, otp, role);
        if (!result.success) {
          Alert.alert(t('common.error'), result.message);
        }
      } catch (err) {
        Alert.alert(t('common.error'), t('auth.otp.verifyError'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <GradientBackground style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
        attemptInvisibleVerification={true}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>{t('auth.otp.title')}</Text>
            <Text style={styles.subtitle}>
              {t('auth.otp.subtitle')}
            </Text>
          </View>

          <View style={styles.content}>
            <View style={[globalStyles.card, styles.formCard]}>
              <Text style={styles.label}>{t('auth.otp.phoneLabel')}</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.prefix}>+91</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('auth.otp.phonePlaceholder')}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  editable={!isOtpSent}
                />
                {isOtpSent && (
                  <TouchableOpacity onPress={() => setIsOtpSent(false)}>
                    <Text style={styles.changeLink}>{t('auth.otp.changePhone')}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {!isOtpSent ? (
                <PrimaryButton 
                  title={loading ? t('auth.otp.sending') : t('auth.otp.sendButton')} 
                  onPress={handleSendOtp} 
                  disabled={phoneNumber.length !== 10 || loading}
                  style={styles.button}
                />
              ) : (
                <Animated.View style={{ opacity: otpAnimation }}>
                  <Text style={styles.label}>{t('auth.otp.otpLabel')}</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('auth.otp.otpPlaceholder')}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otp}
                      onChangeText={setOtp}
                    />
                  </View>
                  
                  <View style={styles.timerRow}>
                    {timer > 0 ? (
                      <Text style={styles.timerText}>{t('auth.otp.resendText')} {timer}s</Text>
                    ) : (
                      <TouchableOpacity onPress={() => {
                        setTimer(30);
                        handleSendOtp();
                      }}>
                        <Text style={styles.resendLink}>{t('auth.otp.resendButton')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <PrimaryButton 
                    title={loading ? t('auth.otp.verifying') : t('auth.otp.verifyButton')} 
                    onPress={handleVerify} 
                    disabled={otp.length !== 6 || loading}
                    style={styles.button}
                  />
                </Animated.View>
              )}
            </View>

            <View style={styles.footer}>
              <MadeInIndiaBadge />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headingLarge,
    color: colors.textPrimary,
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyText,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  formCard: {
    padding: spacing.xl,
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    ...typography.captionText,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary + '30',
    paddingBottom: spacing.xs,
    marginBottom: spacing.lg,
  },
  prefix: {
    ...typography.bodyText,
    fontWeight: '700',
    marginRight: spacing.sm,
    color: colors.textPrimary,
  },
  textInput: {
    flex: 1,
    ...typography.bodyText,
    fontSize: 18,
    color: colors.textPrimary,
  },
  changeLink: {
    ...typography.captionText,
    color: colors.accentBlue,
    fontWeight: '600',
  },
  button: {
    marginTop: spacing.md,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  timerText: {
    ...typography.captionText,
    color: colors.textSecondary,
  },
  resendLink: {
    ...typography.captionText,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
});
