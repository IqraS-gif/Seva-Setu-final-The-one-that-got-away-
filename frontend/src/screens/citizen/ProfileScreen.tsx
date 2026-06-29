import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, Switch, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { AppHeader, UserAvatar, PrimaryButton, DynamicText } from '../../components';
import { colors, spacing, typography, globalStyles } from '../../theme';
import { useAuthStore } from '../../services/store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../../components/common/LanguageToggle';

export const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const userName = user?.name || "Citizen";

  // Modals States
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Personal Details Fields
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editLocation, setEditLocation] = useState(user?.location || 'New Delhi, India');

  // Notifications Switches
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  // Handle Save Personal Details
  const handleSaveDetails = () => {
    if (!editName.trim()) {
      Alert.alert(t('common.error') || 'Error', 'Name cannot be empty.');
      return;
    }
    // Update Zustand state
    useAuthStore.setState({
      user: user ? { ...user, name: editName, phone: editPhone, email: editEmail, location: editLocation } : null
    });
    Alert.alert(t('common.success') || 'Success', 'Personal details updated successfully!');
    setActiveModal(null);
  };

  const renderOption = (icon: any, title: string, subtitle: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.optionItem} onPress={onPress}>
      <View style={styles.optionIconContainer}>
        <Feather name={icon} size={20} color={colors.accentBlue} />
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader title={t('citizen.profile.title')} rightIcon="settings" onRightPress={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerArea}>
          <View style={styles.avatarWrapper}>
            <UserAvatar name={userName} size={90} />
            <TouchableOpacity 
              style={styles.editBadge}
              onPress={() => {
                setEditName(user?.name || '');
                setEditPhone(user?.phone || '');
                setEditEmail(user?.email || '');
                setEditLocation(user?.location || 'New Delhi, India');
                setActiveModal('personal_details');
              }}
            >
              <Feather name="edit-2" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <DynamicText text={userName} style={[typography.headingMedium, styles.name]} />
          <Text style={styles.roleText}>{t('citizen.impactPassport.verifiedCitizen')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('citizen.profile.accountSettings')}</Text>
          <View style={[globalStyles.card, styles.card]}>
            {renderOption('user', t('citizen.profile.personalDetails'), t('citizen.profile.personalDetailsSub'), () => {
              setEditName(user?.name || '');
              setEditPhone(user?.phone || '');
              setEditEmail(user?.email || '');
              setEditLocation(user?.location || 'New Delhi, India');
              setActiveModal('personal_details');
            })}
            <View style={styles.separator} />
            {renderOption('lock', t('citizen.profile.privacySecurity'), t('citizen.profile.privacySecuritySub'), () => setActiveModal('privacy_security'))}
            <View style={styles.separator} />
            {renderOption('bell', t('citizen.profile.notifications'), t('citizen.profile.notificationsSub'), () => setActiveModal('notifications'))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('citizen.profile.community')}</Text>
          <View style={[globalStyles.card, styles.card]}>
            {renderOption('life-buoy', t('citizen.profile.supportCenter'), t('citizen.profile.supportCenterSub'), () => setActiveModal('support_center'))}
            <View style={styles.separator} />
            {renderOption('shield', t('citizen.profile.guidelines'), t('citizen.profile.guidelinesSub'), () => setActiveModal('guidelines'))}
          </View>
        </View>

        {/* Volunteer CTA */}
        <View style={styles.section}>
          <LinearGradient
            colors={[colors.primaryGreen, '#1B5E20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.volunteerCard}
          >
            <View style={styles.volunteerIconBg}>
              <Ionicons name="heart" size={24} color={colors.primaryGreen} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.volunteerTitle}>{t('citizen.profile.becomeVolunteer')}</Text>
              <Text style={styles.volunteerSub}>{t('citizen.profile.becomeVolunteerSub')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.applyBtn}
              onPress={() => navigation.navigate('VolunteerApplication')}
            >
              <Text style={styles.applyBtnText}>{t('citizen.profile.applyNow')}</Text>
              <Feather name="arrow-right" size={16} color={colors.primaryGreen} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
        
        {/* Language Settings */}
        <View style={[styles.section]}>
          <Text style={styles.sectionLabel}>{t('citizen.profile.languageSettings')}</Text>
          <View style={[globalStyles.card, styles.card, { padding: spacing.md }]}>
            <Text style={[typography.captionText, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              {t('citizen.profile.switchLanguage')}
            </Text>
            <LanguageToggle />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={logout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>{t('auth.signOut')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>{t('common.version')}</Text>
      </ScrollView>

      {/* ───── MODALS AREA ───── */}
      {/* Personal Details Modal */}
      <Modal
        visible={activeModal === 'personal_details'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('citizen.profile.personalDetails')}</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor="#A0A0A0"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder="Enter your location"
                placeholderTextColor="#A0A0A0"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setActiveModal(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSaveDetails}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Privacy & Security Modal */}
      <Modal
        visible={activeModal === 'privacy_security'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('citizen.profile.privacySecurity')}</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescText}>
                Your data security is our priority. SevaSetu uses end-to-end encryption to safeguard all local reports and user profiles.
              </Text>
              
              <View style={styles.securityFeatureRow}>
                <Feather name="shield" size={18} color={colors.primaryGreen} />
                <Text style={styles.securityFeatureText}>End-to-End Encryption: Active</Text>
              </View>

              <View style={styles.securityFeatureRow}>
                <Feather name="eye-off" size={18} color={colors.primaryGreen} />
                <Text style={styles.securityFeatureText}>Anonymity Filter: Enabled for sensitive cases</Text>
              </View>

              <TouchableOpacity 
                style={styles.secondaryActionBtn} 
                onPress={() => Alert.alert('Export Data', 'Your complete data history has been compiled and sent to your registered email.')}
              >
                <Feather name="download" size={16} color={colors.accentBlue} />
                <Text style={styles.secondaryActionBtnText}>Export My Data</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryActionBtn, { borderColor: colors.error }]} 
                onPress={() => {
                  Alert.alert(
                    'Delete Account',
                    'Are you sure you want to permanently delete your account? This action is irreversible.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => {
                        logout();
                        setActiveModal(null);
                      }}
                    ]
                  );
                }}
              >
                <Feather name="trash-2" size={16} color={colors.error} />
                <Text style={[styles.secondaryActionBtnText, { color: colors.error }]}>Delete Account</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={activeModal === 'notifications'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('citizen.profile.notifications')}</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Push Notifications</Text>
                  <Text style={styles.switchSub}>Receive alerts on report status updates</Text>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: '#D0D0D0', true: colors.primaryGreen + '40' }}
                  thumbColor={pushEnabled ? colors.primaryGreen : '#F4F3F4'}
                />
              </View>

              <View style={[styles.switchRow, { borderBottomWidth: 0, opacity: 0.7 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Critical Security Alerts</Text>
                  <Text style={styles.switchSub}>High-priority security updates (Cannot be disabled)</Text>
                </View>
                <Switch
                  value={true}
                  disabled={true}
                  trackColor={{ false: '#D0D0D0', true: colors.primaryGreen + '40' }}
                  thumbColor={colors.primaryGreen}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Support Center Modal */}
      <Modal
        visible={activeModal === 'support_center'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('citizen.profile.supportCenter')}</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.faqHeading}>Frequently Asked Questions</Text>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>How do I report a new issue?</Text>
                <Text style={styles.faqAnswer}>Navigate to the "Report" tab on the bottom menu, fill out the category and description, and attach photos or scans.</Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>How does volunteer assignment work?</Text>
                <Text style={styles.faqAnswer}>SevaSetu's AI matching engine evaluates geofence parameters, proximity, availability, and specific skill matches to auto-assign the most suitable volunteer.</Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Who oversees my reports?</Text>
                <Text style={styles.faqAnswer}>All verified issues are directly triaged and managed by local NGO supervisors who coordinate assignments with volunteers.</Text>
              </View>

              <View style={styles.contactDetailsCard}>
                <Text style={styles.contactCardTitle}>Still need assistance?</Text>
                <View style={styles.contactRow}>
                  <Feather name="phone" size={16} color={colors.primarySaffron} />
                  <Text style={styles.contactText}>+91 98765 43210</Text>
                </View>
                <View style={styles.contactRow}>
                  <Feather name="mail" size={16} color={colors.primarySaffron} />
                  <Text style={styles.contactText}>support@sevasetu.org</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Guidelines Modal */}
      <Modal
        visible={activeModal === 'guidelines'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('citizen.profile.guidelines')}</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.guidelineHeading}>Community Code of Conduct</Text>
              
              <View style={styles.guidelineCard}>
                <Text style={styles.guidelineNumber}>1</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guidelineCardTitle}>Be Respectful</Text>
                  <Text style={styles.guidelineCardText}>Treat all volunteers, citizens, and coordinators with courtesy and dignity.</Text>
                </View>
              </View>

              <View style={styles.guidelineCard}>
                <Text style={styles.guidelineNumber}>2</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guidelineCardTitle}>Submit Accurate Information</Text>
                  <Text style={styles.guidelineCardText}>Ensure all reported locations, categories, and photos accurately represent the real situation on the ground.</Text>
                </View>
              </View>

              <View style={styles.guidelineCard}>
                <Text style={styles.guidelineNumber}>3</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guidelineCardTitle}>Protect Privacy</Text>
                  <Text style={styles.guidelineCardText}>Do not post private sensitive details of other residents in description text unless authorized.</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerArea: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accentBlue,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  roleText: {
    ...typography.captionText,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.captionText,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentBlue + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...typography.bodyText,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  optionSubtitle: {
    ...typography.captionText,
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.textSecondary + '10',
    marginLeft: 56,
  },
  logoutBtn: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error + '20',
  },
  logoutText: {
    ...typography.bodyText,
    fontWeight: '700',
    color: colors.error,
    marginLeft: spacing.sm,
  },
  versionText: {
    ...typography.captionText,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xl,
    opacity: 0.5,
  },
  volunteerCard: {
    padding: spacing.lg,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  volunteerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volunteerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  volunteerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    gap: 4,
  },
  applyBtnText: {
    color: colors.primaryGreen,
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navyBlue,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  modalBody: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F5F5F5',
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: colors.accentBlue,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalDescText: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 18,
    marginBottom: 18,
  },
  securityFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  securityFeatureText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.accentBlue,
    borderRadius: 12,
    marginTop: 14,
  },
  secondaryActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  switchSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    paddingRight: 10,
  },
  faqHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqItem: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navyBlue,
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 12,
    color: '#616161',
    lineHeight: 18,
  },
  contactDetailsCard: {
    backgroundColor: '#FFF8F2',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    marginTop: 10,
  },
  contactCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  contactText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
  },
  guidelineHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  guidelineCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  guidelineNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentBlue + '15',
    color: colors.accentBlue,
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  guidelineCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  guidelineCardText: {
    fontSize: 11,
    color: '#616161',
    lineHeight: 16,
  },
});
