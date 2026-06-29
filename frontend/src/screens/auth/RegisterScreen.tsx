import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  SafeAreaView, 
  Platform, 
  StatusBar, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView 
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, spacing, typography, globalStyles } from '../../theme';
import { PrimaryButton, MadeInIndiaBadge, GradientBackground, IconButton, AshokaChakra, ConfettiOverlay, DynamicText } from '../../components';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { useAuthStore } from '../../services/store/useAuthStore';
import { useNgoStore } from '../../services/store/useNgoStore';
import { useLanguage } from '../../context/LanguageContext';

export const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [selectedNgo, setSelectedNgo] = useState<any>(null);
  const [showNgoSelector, setShowNgoSelector] = useState(false);
  const { ngos, loadNgos } = useNgoStore();

  const register = useAuthStore(state => state.register);
  const { t, language } = useLanguage();

  React.useEffect(() => {
    loadNgos();
  }, []);

  const handleRegister = async () => {
    const roleParam = (navigation.getState().routes.find((r: any) => r.name === 'Register')?.params as any)?.role || 'CITIZEN';

    if (!fullName || !email || !phone || !password) {
      Alert.alert(t('auth.register.missingInfo'), t('auth.register.enterFullName'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('auth.register.failed'), t('auth.register.passwordMismatch'));
      return;
    }
    
    if (roleParam === 'SUPERVISOR' && !selectedNgo) {
      Alert.alert(t('auth.register.missingInfo'), 'Please select an NGO');
      return;
    }

    setLoading(true);
    try {
      const result = await register(email, password, fullName, phone, roleParam, selectedNgo?.id, selectedNgo?.name);
      if (result.success) {
        setShowConfetti(true);
      } else {
        Alert.alert(t('auth.register.failed'), result.message);
      }
    } catch (err) {
      Alert.alert(t('common.error'), t('auth.register.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground style={styles.container}>
      <ConfettiOverlay play={showConfetti} onAnimationFinish={() => setShowConfetti(false)} />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <SafeAreaView>
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
                <AshokaChakra size={50} color="#FFFFFF" opacity={0.15} style={styles.headerChakra} />
                <Text style={styles.title}>{t('auth.register.title')}</Text>
                <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>
              </Animated.View>
            </SafeAreaView>
          </View>

          <View style={styles.content}>
            <Animated.View 
              entering={FadeInDown.delay(400).springify()}
              style={styles.formCard}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('auth.register.fullName')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="E.g. Rajesh Kumar"
                    placeholderTextColor={colors.textSecondary + '60'}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('auth.register.email')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    keyboardType="email-address"
                    placeholder="E.g. rajesh@email.com"
                    placeholderTextColor={colors.textSecondary + '60'}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('auth.register.phone')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    keyboardType="phone-pad"
                    placeholder="10-digit number"
                    placeholderTextColor={colors.textSecondary + '60'}
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('auth.register.password')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    secureTextEntry
                    placeholder="Min 6 characters"
                    placeholderTextColor={colors.textSecondary + '60'}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('auth.register.confirmPassword')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    secureTextEntry
                    placeholder="Re-enter password"
                    placeholderTextColor={colors.textSecondary + '60'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </View>

              {((navigation.getState().routes.find((r: any) => r.name === 'Register')?.params as any)?.role === 'SUPERVISOR') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NGO Name</Text>
                  <TouchableOpacity
                    style={[styles.inputContainer, { justifyContent: 'space-between', paddingRight: 10 }]}
                    onPress={() => setShowNgoSelector(!showNgoSelector)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Feather name="home" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                      <Text style={[styles.textInput, !selectedNgo && { color: colors.textSecondary + '60' }]}>
                        {selectedNgo ? selectedNgo.name : 'Select NGO'}
                      </Text>
                    </View>
                    <Ionicons name={showNgoSelector ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {showNgoSelector && (
                    <View style={styles.ngoList}>
                      {ngos.map((ngo: any) => (
                        <TouchableOpacity
                          key={ngo.id}
                          style={[styles.ngoOption, selectedNgo?.id === ngo.id && styles.ngoOptionSelected]}
                          onPress={() => {
                            setSelectedNgo(ngo);
                            setShowNgoSelector(false);
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <DynamicText text={ngo.name} style={[styles.ngoName, selectedNgo?.id === ngo.id && styles.ngoTextSelected]} />
                            <DynamicText text={ngo.city} style={styles.ngoCity} />
                          </View>
                          {selectedNgo?.id === ngo.id && <Ionicons name="checkmark-circle" size={20} color={colors.primaryGreen} />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              <PrimaryButton 
                title={loading ? t('auth.register.loading') : t('auth.register.button')} 
                onPress={handleRegister} 
                style={styles.registerBtn}
                disabled={loading}
              />
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(600).springify()}
              style={styles.loginContainer}
            >
              <Text style={styles.loginText}>{language === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'} </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Login')}>
                 <Text style={styles.loginLink}>{t('auth.loginButton')}</Text>
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
    paddingBottom: 40,
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
    marginTop: Platform.OS === 'ios' ? 0 : 20,
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
    top: -10,
  },
  title: {
    ...typography.displayTitle,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyText,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
    maxWidth: '85%',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    marginTop: -30,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.navyBlue,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    height: 52,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.navyBlue,
  },
  registerBtn: {
    height: 54,
    borderRadius: 16,
    marginTop: 10,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primarySaffron,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  ngoList: {
    marginTop: spacing.xs,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  ngoOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  ngoOptionSelected: {
    backgroundColor: colors.primaryGreen + '08',
  },
  ngoName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ngoTextSelected: {
    color: colors.primaryGreen,
  },
  ngoCity: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default RegisterScreen;
