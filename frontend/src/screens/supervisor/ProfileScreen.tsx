import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { AppHeader, UserAvatar, PrimaryButton, DynamicText } from '../../components';
import { colors, spacing, typography, globalStyles } from '../../theme';
import { useAuthStore } from '../../services/store/useAuthStore';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LanguageToggle } from '../../components/common/LanguageToggle';

export const SupervisorProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { t } = useLanguage();
  const userName = user?.name || "NGO Supervisor";

  return (
    <View style={styles.container}>
      <AppHeader title={t('supervisor.profile.title')} rightIcon="settings" onRightPress={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerArea}>
          <UserAvatar name={userName} size={80} />
          <DynamicText style={[typography.headingMedium, styles.name]} text={userName} />
          <DynamicText style={typography.captionText} text={`${user?.ngo_name || "Regional Supervisor"} • NGO Head`} />
        </View>

        <View style={[globalStyles.card, styles.card]}>
          <Text style={typography.headingSmall}>{t('supervisor.profile.orgInfo')}</Text>
          <DynamicText style={[typography.bodyText, styles.detailItem]} text={user?.ngo_name || "Helping Hands Foundation"} />
          <Text style={[typography.bodyText, styles.detailItem]}>{t('supervisor.profile.assignedRole')} NGO Supervisor</Text>
        </View>

        <View style={[globalStyles.card, styles.card]}>
          <Text style={typography.headingSmall}>{t('supervisor.profile.systemAccess')}</Text>
          <Text style={[typography.bodyText, styles.detailItem]}>{t('supervisor.profile.adminPrivileges')} {t('supervisor.profile.granted')}</Text>
          <Text style={[typography.bodyText, styles.detailItem]}>{t('supervisor.profile.reportingLevel')} Tier 1</Text>
        </View>

        {/* Verification Tools */}
        <TouchableOpacity 
          style={styles.verificationCard}
          onPress={() => navigation.navigate('VerifyCertificate')}
          activeOpacity={0.8}
        >
          <View style={styles.linkContent}>
            <View style={styles.verificationIconBg}>
              <Feather name="maximize" size={20} color={colors.primaryGreen} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkTitle}>{t('volunteer.recognition.verifyCertificate')}</Text>
              <Text style={styles.linkSub}>{t('volunteer.recognition.verifySubtitle')}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#7C8B9E" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.passportVerificationCard}
          onPress={() => navigation.navigate('VerifyPassport')}
          activeOpacity={0.8}
        >
          <View style={styles.linkContent}>
            <View style={styles.passportIconBg}>
              <Feather name="user-check" size={20} color={colors.accentBlue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkTitle}>{t('volunteer.home.verifyPassport')}</Text>
              <Text style={styles.linkSub}>{t('citizen.impactPassport.scanToVerify')}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#7C8B9E" />
          </View>
        </TouchableOpacity>

        {/* Language Settings */}
        <View style={[globalStyles.card, styles.card]}>
          <Text style={typography.headingSmall}>{t('supervisor.profile.languageSettings')}</Text>
          <Text style={[styles.detailItem, { fontSize: 12, marginBottom: spacing.sm }]}>
            {t('supervisor.profile.switchLanguage')}
          </Text>
          <LanguageToggle />
        </View>
        
        <TouchableOpacity
          onPress={logout}
          activeOpacity={0.8}
          style={styles.logoutBtnCustom}
        >
          <Text style={styles.logoutBtnText}>{t('auth.logoutButton')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerArea: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary + '20',
    marginBottom: spacing.md,
  },
  name: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  detailItem: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  logoutBtnCustom: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    backgroundColor: '#FF8C42', // Orange color (colors.primarySaffron)
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A237E', // Premium Navy Blue text
  },
  linkSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  verificationCard: { 
    marginHorizontal: spacing.md, 
    marginBottom: spacing.md, 
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#B7E1CD', // Brighter green border
    backgroundColor: '#E6F4EA', // Brighter green background
  },
  verificationIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passportVerificationCard: { 
    marginHorizontal: spacing.md, 
    marginBottom: spacing.md, 
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D2E3FC', // Brighter blue border
    backgroundColor: '#E8F0FE', // Brighter blue background
  },
  passportIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
