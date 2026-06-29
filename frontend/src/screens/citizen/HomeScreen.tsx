import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground, UserAvatar, DynamicText } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { MOCK_CITIZEN_STATS, MOCK_MISSIONS } from '../../services/mock';
import { useAuthStore } from '../../services/store/useAuthStore';
import { useLanguage } from '../../context/LanguageContext';
import { useEventStore } from '../../services/store/useEventStore';

const getCategoryIcon = (category: any) => {
  let catStr = '';
  if (typeof category === 'object' && category !== null) {
    catStr = category.en || category.hi || '';
  } else if (typeof category === 'string') {
    catStr = category;
  }
  catStr = catStr.toLowerCase();

  if (catStr.includes('water')) {
    return { name: 'droplet', color: '#1E88E5', bgColor: '#E3F2FD' };
  } else if (catStr.includes('health') || catStr.includes('medical')) {
    return { name: 'activity', color: '#E53935', bgColor: '#FFEBEE' };
  } else if (catStr.includes('food') || catStr.includes('sanitation')) {
    return { name: 'shopping-bag', color: '#43A047', bgColor: '#E8F5E9' };
  } else if (catStr.includes('infra') || catStr.includes('road')) {
    return { name: 'tool', color: '#FB8C00', bgColor: '#FFF3E0' };
  } else if (catStr.includes('electricity') || catStr.includes('power')) {
    return { name: 'zap', color: '#FDD835', bgColor: '#FFFDE7' };
  } else {
    return { name: 'alert-circle', color: '#757575', bgColor: '#F5F5F5' };
  }
};

const getUrgencyBadgeColor = (urgency: any) => {
  let urgStr = '';
  if (typeof urgency === 'object' && urgency !== null) {
    urgStr = urgency.en || urgency.hi || '';
  } else if (typeof urgency === 'string') {
    urgStr = urgency;
  }
  urgStr = urgStr.toLowerCase();

  if (urgStr.includes('immediate') || urgStr.includes('critical') || urgStr.includes('high')) {
    return { text: '#D32F2F', bg: '#FFEBEE', label: 'HIGH' };
  } else if (urgStr.includes('moderate') || urgStr.includes('medium')) {
    return { text: '#F57C00', bg: '#FFF3E0', label: 'MODERATE' };
  } else {
    return { text: '#388E3C', bg: '#E8F5E9', label: 'LOW' };
  }
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return 'Recently';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60000);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Recently';
  }
};

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { t, language } = useLanguage();
  const { reports, loadReports } = useEventStore();
  
  const userName = user?.name || t('auth.roles.CITIZEN');
  const citizenLocation = user?.location || '';
  const [showNotifications, setShowNotifications] = useState(false);

  // My own submitted reports (matched by citizen_id or citizen_name)
  const myReports = reports.filter((r: any) => {
    if (user?.id && r.citizen_id) return r.citizen_id === user.id;
    if (user?.name && r.citizen_name) return r.citizen_name === user.name;
    return false;
  });
  const myOpenCount = myReports.filter((r: any) => r.status !== 'Resolved').length;

  useFocusEffect(
    React.useCallback(() => {
      loadReports();
    }, [])
  );

  // Matching logic to filter complaints near the citizen
  const isReportNearCitizen = (report: any) => {
    if (!citizenLocation) return true; // If citizen location is not specified, show all local reports
    
    // Resolve report location text
    let reportLoc = report.precise_location || report.location || '';
    if (typeof reportLoc === 'object' && reportLoc !== null) {
      reportLoc = reportLoc[language] || reportLoc.en || reportLoc.hi || JSON.stringify(reportLoc);
    }
    
    const citizenLower = citizenLocation.toLowerCase().trim();
    const reportLower = reportLoc.toLowerCase().trim();
    
    // Substring match
    if (reportLower.includes(citizenLower) || citizenLower.includes(reportLower)) {
      return true;
    }
    
    // Word matching
    const citizenWords = citizenLower.split(/[\s,./-]+/).filter(w => w.length > 3 && !['india', 'near', 'delhi', 'road', 'street', 'city', 'area', 'block', 'sector', 'lane'].includes(w));
    for (const word of citizenWords) {
      if (reportLower.includes(word)) {
        return true;
      }
    }
    return false;
  };

  // Filtered list of complaints near citizen
  const localReports = reports.filter(isReportNearCitizen);
  
  // Fallback to all reports if no matching ones, or show matching, limited to top 5
  const reportsToDisplay = (localReports.length > 0 ? localReports : reports).slice(0, 5);

  return (
    <GradientBackground variant="dashboard" style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContent}>
        <View style={styles.greetingHeader}>
          <Text style={styles.greetingText}>{t('citizen.home.greeting') || "Good Morning,"}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <DynamicText text={userName} style={styles.userNameText} />
            <Text style={[styles.userNameText, { marginLeft: 4 }]}>👋</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.bellBtn} 
            activeOpacity={0.7}
            onPress={() => setShowNotifications(true)}
          >
            <Feather name="bell" size={22} color="#FFFFFF" />
            {myOpenCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{myOpenCount > 9 ? '9+' : myOpenCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.avatarWrapper}>
            <UserAvatar name={userName} size={54} />
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          
          {/* Section 1: Quick Actions */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.verticalBar} />
              <Text style={styles.sectionText}>{t('citizen.home.quickActions') || "Quick Actions"} ✨</Text>
            </View>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('Report Issue')}
                activeOpacity={0.9}
              >
                <LinearGradient 
                  colors={['#FFA726', '#FB8C00']} 
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.actionIconBg}>
                    <Feather name="alert-circle" size={22} color="#FB8C00" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>{t('citizen.home.reportIssue') || "Report Issue"}</Text>
                    <Text style={styles.actionSubtitle}>Help your community</Text>
                  </View>
                  <View style={styles.actionArrowBg}>
                    <Feather name="chevron-right" size={14} color="#FB8C00" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('VolunteerApplication')}
                activeOpacity={0.9}
              >
                <LinearGradient 
                  colors={['#43A047', '#2E7D32']} 
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.actionIconBg}>
                    <Feather name="heart" size={22} color="#2E7D32" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>Serve Community</Text>
                    <Text style={styles.actionSubtitle}>Apply as volunteer</Text>
                  </View>
                  <View style={styles.actionArrowBg}>
                    <Feather name="chevron-right" size={14} color="#2E7D32" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 2: Your Recent Activity */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.verticalBar} />
                <Text style={styles.sectionText}>{t('citizen.home.recentActivity') || "Your Recent Activity"}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('My Requests')} activeOpacity={0.7}>
                <Text style={styles.viewAllText}>View all <Feather name="chevron-right" size={12} /></Text>
              </TouchableOpacity>
            </View>

            <View style={styles.activityRow}>
              <View style={[styles.activityCard, styles.activityCardOrange]}>
                <View style={styles.activityCardHeader}>
                  <View style={[styles.activityIconBg, { backgroundColor: '#FFF3E0' }]}>
                    <Feather name="alert-circle" size={20} color="#FB8C00" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityValue}>{MOCK_CITIZEN_STATS.issuesReported}</Text>
                    <Text style={styles.activityLabel} numberOfLines={1}>{t('citizen.home.issuesReported') || "Issues Reported"}</Text>
                  </View>
                </View>
                <View style={styles.activityBadgeOrange}>
                  <Text style={styles.activityBadgeTextOrange}>🧡 Making a difference</Text>
                </View>
              </View>

              <View style={[styles.activityCard, styles.activityCardBlue]}>
                <View style={styles.activityCardHeader}>
                  <View style={[styles.activityIconBg, { backgroundColor: '#E8EAF6' }]}>
                    <Feather name="life-buoy" size={20} color="#3F51B5" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityValueBlue}>{MOCK_CITIZEN_STATS.helpRequests}</Text>
                    <Text style={styles.activityLabel} numberOfLines={1}>{t('citizen.home.helpRequests') || "Help Requests"}</Text>
                  </View>
                </View>
                <View style={styles.activityBadgeBlue}>
                  <Text style={styles.activityBadgeTextBlue}>💜 Thanks for helping</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section 3: Local Updates */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.verticalBar} />
                <Text style={styles.sectionText}>{t('citizen.home.localUpdates') || "Local Updates"}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('My Requests')} activeOpacity={0.7}>
                <Text style={styles.viewAllText}>View all <Feather name="chevron-right" size={12} /></Text>
              </TouchableOpacity>
            </View>

            {reportsToDisplay.length === 0 ? (
              <View style={styles.noReportsCard}>
                <Feather name="info" size={24} color="#757575" style={{ marginBottom: 8 }} />
                <Text style={styles.noReportsText}>{t('citizen.home.noLocalReports') || "No local updates available at this time."}</Text>
              </View>
            ) : (
              reportsToDisplay.map((r) => {
                const iconInfo = getCategoryIcon(r.primary_category);
                const urgencyInfo = getUrgencyBadgeColor(r.urgency_level);
                const reportLocation = r.precise_location || r.location || 'Location N/A';
                const reportTime = r.created_at ? formatTimeAgo(r.created_at) : 'Recently';

                return (
                  <View key={r.id} style={[styles.updateCard, { marginBottom: spacing.md }]}>
                    <View style={styles.updateCardHeader}>
                      <View style={[styles.updateIconContainer, { backgroundColor: iconInfo.bgColor }]}>
                        <Feather name={iconInfo.name as any} size={22} color={iconInfo.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.updateTitleRow}>
                          <DynamicText style={styles.updateTitle} numberOfLines={1} text={r.primary_category} />
                          <View style={[styles.highBadge, { backgroundColor: urgencyInfo.bg }]}>
                            <Text style={[styles.highBadgeText, { color: urgencyInfo.text }]}>{urgencyInfo.label}</Text>
                          </View>
                        </View>
                        <DynamicText style={styles.updateDesc} numberOfLines={2} text={r.description || ''} />
                      </View>
                    </View>

                    <View style={styles.updateCardDivider} />

                    <View style={styles.updateCardFooter}>
                      <View style={styles.updateFooterMeta}>
                        <View style={styles.updateMetaItem}>
                          <Feather name="map-pin" size={12} color="#757575" />
                          <DynamicText style={styles.updateMetaText} numberOfLines={1} text={reportLocation} />
                        </View>
                        <View style={[styles.updateMetaItem, { marginTop: 4 }]}>
                          <Feather name="clock" size={12} color="#757575" />
                          <Text style={styles.updateMetaText}>{reportTime}</Text>
                        </View>
                      </View>

                      <TouchableOpacity 
                        style={styles.viewDetailsBtn}
                        onPress={() => navigation.navigate('CitizenReportDetail', { report: r })}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.viewDetailsText}>View Details <Feather name="chevron-right" size={12} /></Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>

        </View>
      </ScrollView>

      {/* ── Notification Panel Modal ─────────────────────────── */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <TouchableOpacity 
          style={styles.notifOverlay} 
          activeOpacity={1} 
          onPress={() => setShowNotifications(false)}
        />
        <View style={styles.notifPanel}>
          {/* Handle bar */}
          <View style={styles.notifHandle} />

          <View style={styles.notifHeader}>
            <View>
              <Text style={styles.notifTitle}>My Notifications</Text>
              <Text style={styles.notifSubtitle}>
                {myOpenCount > 0 ? `${myOpenCount} active complaint${myOpenCount > 1 ? 's' : ''}` : 'All caught up!'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.notifCloseBtn}>
              <Feather name="x" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.notifList}>
            {myReports.length === 0 ? (
              <View style={styles.notifEmpty}>
                <Feather name="bell-off" size={40} color="#C0C0C0" />
                <Text style={styles.notifEmptyTitle}>No notifications yet</Text>
                <Text style={styles.notifEmptyText}>Submit a complaint to start tracking your reports here.</Text>
              </View>
            ) : (
              myReports.map((r: any, idx: number) => {
                const status = r.status || 'Open';
                const isResolved = status === 'Resolved';
                const isInProgress = status === 'In Progress' || status === 'Verified';

                const statusColor = isResolved ? '#2E7D32' : isInProgress ? '#1565C0' : '#E65100';
                const statusBg = isResolved ? '#E8F5E9' : isInProgress ? '#E3F2FD' : '#FFF3E0';
                const statusIcon = isResolved ? 'check-circle' : isInProgress ? 'clock' : 'alert-circle';

                const titleObj = r.executive_summary || r.description || r.issue_type;
                const title = typeof titleObj === 'object' ? (titleObj?.en || titleObj?.hi || 'Complaint') : (titleObj || 'Complaint');

                const loc = r.precise_location || r.location || 'Location not specified';
                const locText = typeof loc === 'object' ? (loc?.en || loc?.hi || '') : loc;

                const message = isResolved
                  ? 'Your issue has been resolved ✅'
                  : isInProgress
                  ? 'A volunteer is working on this 🔄'
                  : 'Waiting for volunteer assignment ⏳';

                return (
                  <TouchableOpacity
                    key={r.id || idx}
                    style={styles.notifCard}
                    activeOpacity={0.8}
                    onPress={() => { setShowNotifications(false); navigation.navigate('CitizenReportDetail', { report: r }); }}
                  >
                    <View style={[styles.notifCardIcon, { backgroundColor: statusBg }]}>
                      <Feather name={statusIcon as any} size={20} color={statusColor} />
                    </View>
                    <View style={styles.notifCardBody}>
                      <Text style={styles.notifCardTitle} numberOfLines={1}>{title}</Text>
                      <Text style={styles.notifCardMsg}>{message}</Text>
                      <View style={styles.notifCardMeta}>
                        <Feather name="map-pin" size={11} color="#9E9E9E" />
                        <Text style={styles.notifCardLoc} numberOfLines={1}>{locText}</Text>
                      </View>
                    </View>
                    <View style={[styles.notifStatusBadge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.notifStatusText, { color: statusColor }]}>{status}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </Modal>

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
    paddingTop: 55,
    height: 180,
    zIndex: 1,
  },
  greetingHeader: {
    flexDirection: 'column',
  },
  greetingText: {
    ...typography.bodyText,
    color: colors.navyBlue,
    marginBottom: 4,
    fontWeight: '600',
  },
  userNameText: {
    ...typography.headingMedium,
    color: colors.navyBlue,
    fontWeight: '800',
    fontSize: 26,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 10,
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 30,
    padding: 2,
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
    paddingTop: spacing.xl,
    minHeight: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  verticalBar: {
    width: 4,
    height: 16,
    backgroundColor: '#FB8C00',
    borderRadius: 2,
    marginRight: 8,
  },
  sectionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A237E',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  viewAllText: {
    fontSize: 12,
    color: '#FB8C00',
    fontWeight: '700',
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'space-between',
    flex: 1,
  },
  actionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 4,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionSubtitle: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  actionArrowBg: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  activityCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    alignItems: 'center',
  },
  activityCardOrange: {
    backgroundColor: '#FFFBF5',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  activityCardBlue: {
    backgroundColor: '#F7F8FC',
    borderWidth: 1,
    borderColor: '#C5CAE9',
  },
  activityIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 10,
  },
  activityValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FB8C00',
  },
  activityValueBlue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#3F51B5',
  },
  activityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#424242',
    marginTop: 1,
  },
  activityBadgeOrange: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activityBadgeTextOrange: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E65100',
  },
  activityBadgeBlue: {
    backgroundColor: '#E8EAF6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activityBadgeTextBlue: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3F51B5',
  },
  noReportsCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  noReportsText: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
    textAlign: 'center',
  },
  updateCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  updateCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  updateIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A237E',
    flex: 1,
  },
  highBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  highBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D32F2F',
  },
  updateDesc: {
    fontSize: 12,
    color: '#616161',
    lineHeight: 18,
  },
  updateCardDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 12,
  },
  updateCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateFooterMeta: {
    flex: 1,
    marginRight: 10,
  },
  updateMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  updateMetaText: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '600',
  },
  viewDetailsBtn: {
    borderWidth: 1,
    borderColor: '#FB8C00',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FB8C00',
  },

  // ── Notification Panel ─────────────────────────────────────────
  notifOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  notifPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  notifHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notifTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  notifSubtitle: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  notifCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  notifEmpty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  notifEmptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#424242',
    marginTop: 16,
  },
  notifEmptyText: {
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  notifCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifCardBody: {
    flex: 1,
  },
  notifCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  notifCardMsg: {
    fontSize: 12,
    color: '#616161',
    marginTop: 2,
  },
  notifCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  notifCardLoc: {
    fontSize: 11,
    color: '#9E9E9E',
    flex: 1,
  },
  notifStatusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  notifStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
