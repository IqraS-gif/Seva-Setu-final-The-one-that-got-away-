import { useLanguage } from '../../context/LanguageContext';
import { getBilingualText } from '../../utils/bilingualHelpers';
import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GradientBackground, SectionTitle, MissionCard, UserAvatar, DynamicText } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { MOCK_MISSIONS, MOCK_VOLUNTEER_STATS } from '../../services/mock';
import { useEventStore } from '../../services/store/useEventStore';
import { useChatStore } from '../../services/store/useChatStore';
import { useAuthStore } from '../../services/store/useAuthStore';
import { reportStorage } from '../../services/storage/reportStorage';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

export const VolunteerHomeScreen = () => {
  const { t, language } = useLanguage();
  const navigation = useNavigation<any>();
  const { 
    unreadCount, 
    pendingAssignments, 
    volunteerProfile, 
    volunteerId,
    loadAssignments, 
    loadPredictions, 
    loadVolunteerProfile,
    loadLiveMatches,
    liveMatches,
  } = useEventStore();

  const { role, user } = useAuthStore();
  const { rooms, loadRooms } = useChatStore();
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const currentUserId = user?.id || volunteerId;

  const checkSyncQueue = async () => {
    const queue = await reportStorage.getSyncQueue();
    setPendingSyncCount(queue.length);
  };

  useFocusEffect(
    React.useCallback(() => {
      if (currentUserId) {
        loadAssignments(currentUserId);
        loadVolunteerProfile(currentUserId);
        loadPredictions();
        loadLiveMatches(currentUserId);
        loadRooms(currentUserId);
      }
      checkSyncQueue();
    }, [currentUserId])
  );

  const totalUnread = rooms.reduce((sum, r) => sum + (r.unread_count || 0), 0);

  const pendingList = typeof pendingAssignments === 'function' ? pendingAssignments() : [];
  const pendingCount = pendingList.length;
  
  const displayName = (!volunteerProfile?.name || volunteerProfile?.name === 'Volunteer') 
    ? (user?.name || "Volunteer") 
    : volunteerProfile.name;
  const userName = displayName;

  return (
    <GradientBackground variant="dashboard" style={styles.container}>
      <View style={styles.headerContent}>
        <View style={styles.greetingHeader}>
          <Text style={styles.greetingText}>{t('volunteer.home.greeting')} 👋</Text>
          <DynamicText 
            style={styles.userNameText} 
            text={userName} 
            collection="users"
            docId={currentUserId}
            field="name"
            numberOfLines={1}
          />
          <Text style={styles.subtitleText}>{t('volunteer.home.impactSubtitle')}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('ChatList')}
            style={styles.chatHeaderBtn}
          >
            <Feather name="message-circle" size={22} color={colors.primarySaffron} />
            {totalUnread > 0 && (
              <View style={[styles.chatBadge, totalUnread > 9 && styles.chatBadgeWide]}>
                <Text style={styles.chatBadgeText}>{totalUnread > 99 ? '99+' : totalUnread}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('SyncDashboard')}
            style={styles.chatHeaderBtn}
          >
            <Feather name="cloud" size={22} color={pendingSyncCount > 0 ? colors.error : colors.primarySaffron} />
            {pendingSyncCount > 0 && (
              <View style={styles.chatBadge}>
                <DynamicText style={styles.chatBadgeText} text={pendingSyncCount.toString()} />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.avatarWrapper}>
            <UserAvatar name={userName} size={50} />
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {/* Quick Actions Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWithBar}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitleText}>{t('volunteer.home.quickActions')}</Text>
            </View>
          </View>

          {/* Large Card: My Assignments */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Assignments')}
            activeOpacity={0.9}
            style={styles.assignmentsWrapper}
          >
            <LinearGradient
              colors={['#FF7E21', '#FFA852']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.assignmentsCard}
            >
              <View style={styles.assignmentsLeft}>
                <View style={styles.calendarIconBg}>
                  <Feather name="calendar" size={24} color="#FF7E21" />
                </View>
                <View style={styles.assignmentsTexts}>
                  <Text style={styles.assignmentsTitle}>{t('volunteer.home.myAssignments')}</Text>
                  <Text style={styles.assignmentsSubtitle}>{t('volunteer.home.viewManageTasks')}</Text>
                </View>
              </View>
              <View style={styles.chevronCircle}>
                <Feather name="chevron-right" size={18} color="#FFFFFF" />
              </View>
              {pendingCount > 0 && (
                <View style={styles.assignmentBadge}>
                  <Text style={styles.assignmentBadgeText}>{pendingCount}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Row Cards: Availability & Verify Passport */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Availability')}
              activeOpacity={0.8}
              style={[styles.smallActionCard, { marginRight: spacing.xs }]}
            >
              <View style={styles.smallCardContent}>
                <View style={styles.smallIconWrapper}>
                  <Feather name="clock" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.smallCardTexts}>
                  <Text style={styles.smallCardTitle}>{t('volunteer.home.availability')}</Text>
                </View>
                <View style={styles.smallChevronCircle}>
                  <Feather name="chevron-right" size={12} color="#6B7280" />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('VerifyPassport')}
              activeOpacity={0.8}
              style={[styles.smallActionCard, { marginLeft: spacing.xs }]}
            >
              <View style={styles.smallCardContent}>
                <View style={styles.smallIconWrapper}>
                  <Feather name="user-check" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.smallCardTexts}>
                  <Text style={styles.smallCardTitle}>{t('volunteer.home.verifyPassport')}</Text>
                </View>
                <View style={styles.smallChevronCircle}>
                  <Feather name="chevron-right" size={12} color="#6B7280" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Your Impact Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWithBar}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitleText}>{t('volunteer.home.yourImpact')}</Text>
            </View>
          </View>

          <View style={styles.impactRow}>
            {/* Hours Card */}
            <View style={[styles.impactCard, { backgroundColor: '#F2F4FF', marginRight: spacing.xs }]}>
              <View style={styles.impactCardHeader}>
                <View style={styles.impactIconCircle}>
                  <Feather name="clock" size={20} color="#4D6BFF" />
                </View>
                <Text style={[styles.impactValue, { color: '#1A237E' }]}>
                  {MOCK_VOLUNTEER_STATS.hoursLogged}
                </Text>
              </View>
              
              <View style={styles.impactTextsContainer}>
                <Text style={[styles.impactSubtitle, { color: '#4D6BFF' }]}>{t('volunteer.home.hours').toUpperCase()}</Text>
                <Text style={styles.impactDescription}>{t('volunteer.home.totalVolunteered')}</Text>
              </View>

              <View style={styles.waveContainer}>
                <Svg height="25" width="130">
                  <Path
                    d="M 5 15 Q 20 2, 35 15 T 65 15 T 95 15 T 125 10"
                    fill="none"
                    stroke="#4D6BFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>

              <View style={[styles.impactBlob, { backgroundColor: 'rgba(77, 107, 255, 0.08)' }]} />
            </View>

            {/* Tasks Completed Card */}
            <View style={[styles.impactCard, { backgroundColor: '#F1FAF4', marginLeft: spacing.xs }]}>
              <View style={styles.impactCardHeader}>
                <View style={styles.impactIconCircle}>
                  <Feather name="check-circle" size={20} color="#2E7D32" />
                </View>
                <Text style={[styles.impactValue, { color: '#1A237E' }]}>
                  {MOCK_VOLUNTEER_STATS.tasksCompleted}
                </Text>
              </View>
              
              <View style={styles.impactTextsContainer}>
                <Text style={[styles.impactSubtitle, { color: '#2E7D32' }]}>{t('volunteer.home.tasksDone').toUpperCase()}</Text>
                <Text style={styles.impactDescription}>{t('volunteer.home.greatJob')}</Text>
              </View>

              <View style={styles.waveContainer}>
                <Svg height="25" width="130">
                  <Path
                    d="M 5 15 Q 15 5, 25 15 T 45 15 T 65 15 T 85 15 T 105 15 T 125 10"
                    fill="none"
                    stroke="#2E7D32"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>

              <View style={[styles.impactBlob, { backgroundColor: 'rgba(46, 125, 50, 0.08)' }]} />
            </View>
          </View>

          {/* Urgent Missions Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWithBar}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitleText}>{t('volunteer.home.urgentMissions')}</Text>
            </View>
          </View>

          <View style={styles.listContainer}>
            {pendingList.slice(0, 2).map((m: any) => {
              const typeStr = getBilingualText(m.event_type, language);
              const cardTitle = t(`demo.${typeStr}`) !== `demo.${typeStr}` ? t(`demo.${typeStr}`) : typeStr;
              return (
                <MissionCard 
                  key={m.id}
                  title={cardTitle}
                  description={m.event_description || t('volunteer.home.noUrgentSubtitle')}
                  location={m.volunteer_area}
                  urgency={m.urgency as any || "Medium"}
                  onPress={() => navigation.navigate('Assignments')}
                />
              );
            })}
            {pendingList.length === 0 && (
              <View style={styles.emptyUrgentCard}>
                <View style={styles.emptyBellCircle}>
                  <Feather name="bell" size={22} color="#FF8C42" />
                </View>
                <View style={styles.emptyUrgentTexts}>
                  <Text style={styles.emptyUrgentTitle}>{t('volunteer.home.noUrgentMissions')}</Text>
                  <Text style={styles.emptyUrgentSubtitle}>{t('volunteer.home.caughtUp')}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Upcoming Trainings Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWithBar}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitleText}>{t('volunteer.home.upcomingTrainings')}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Learning')} activeOpacity={0.7}>
              <View style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>{t('volunteer.home.viewAll')}</Text>
                <Feather name="chevron-right" size={14} color="#FF8C42" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
            <MissionCard 
              title={t('volunteer.home.firstAidTitle')}
              description={t('volunteer.home.firstAidDesc')}
              location={t('volunteer.home.online')}
              urgency="Low"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 50,
    height: 190,
    zIndex: 1,
  },
  greetingHeader: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 8,
  },
  greetingText: {
    ...typography.bodyText,
    color: '#1A237E', // Navy blue color
    marginBottom: 2,
    fontWeight: '600',
    fontSize: 16,
  },
  userNameText: {
    ...typography.headingMedium,
    color: '#1A237E', // Navy blue color
    fontWeight: '800',
    fontSize: 24, // Decreased size a bit to fit names
  },
  subtitleText: {
    color: 'rgba(26, 35, 126, 0.85)', // Navy blue with opacity
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 28,
    padding: 2,
    marginLeft: 4,
  },
  chatHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  chatBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 2,
  },
  chatBadgeWide: {
    paddingHorizontal: 4,
  },
  chatBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingBottom: spacing.xxl * 2,
  },
  mainContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: spacing.md,
    minHeight: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitleWithBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accentBar: {
    width: 4,
    height: 18,
    backgroundColor: '#FF8C42', // primarySaffron
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  sectionTitleText: {
    color: '#1A237E', // navyBlue
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#FF8C42',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
  assignmentsWrapper: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    shadowColor: '#FF7E21',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  assignmentsCard: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  assignmentsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  calendarIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  assignmentsTexts: {
    marginLeft: 14,
    flex: 1,
  },
  assignmentsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  assignmentsSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 4,
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignmentBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  assignmentBadgeText: {
    color: '#FF7E21',
    fontSize: 10,
    fontWeight: '900',
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  smallActionCard: {
    flex: 1,
    backgroundColor: '#FFF3E8', // colors.saffronLight
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  smallCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 36,
  },
  smallIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FF8C42', // primarySaffron
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallCardTexts: {
    marginLeft: 6,
    flex: 1,
    marginRight: 24, // Leave space for absolutely positioned chevron
    justifyContent: 'center',
  },
  smallCardTitle: {
    color: '#1A237E', // navyBlue
    fontSize: 12,
    fontWeight: '700',
  },
  smallCardSubtitle: {
    color: '#6B7280', // textSecondary
    fontSize: 10,
    marginTop: 2,
  },
  smallChevronCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
  },
  impactRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  impactCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    height: 155,
  },
  impactCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  impactIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  impactValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  impactTextsContainer: {
    marginBottom: 10,
  },
  impactSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  impactDescription: {
    color: '#6B7280', // textSecondary
    fontSize: 10.5,
    marginTop: 2.5,
    fontWeight: '500',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 15,
    left: 10,
    opacity: 0.8,
  },
  impactBlob: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: -1,
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
  },
  emptyUrgentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: spacing.md,
  },
  emptyBellCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF3E8', // colors.saffronLight
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyUrgentTexts: {
    marginLeft: 12,
    flex: 1,
  },
  emptyUrgentTitle: {
    color: '#1A237E', // colors.navyBlue
    fontSize: 13,
    fontWeight: '700',
  },
  emptyUrgentSubtitle: {
    color: '#6B7280', // colors.textSecondary
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
});
