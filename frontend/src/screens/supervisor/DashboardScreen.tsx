import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, Alert, ActivityIndicator, Image, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionTitle, StatCard, GradientButton, UserAvatar, SkeletonCard, GradientBackground, DynamicText, AlertCard } from '../../components';
import { useLanguage } from '../../context/LanguageContext';
import { colors, spacing, typography } from '../../theme';
import { MOCK_STATS } from '../../services/mock';
import { useEventStore } from '../../services/store/useEventStore';
import { PredictedEvent, MOCK_PREDICTIONS } from '../../services/api/eventPredictionService';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useChatStore } from '../../services/store/useChatStore';
import { useAuthStore } from '../../services/store/useAuthStore';
import { Audio } from 'expo-av';
import { API_BASE_URL } from '../../config/apiConfig';

// ── Audio Player Helper ────────────────────────────────────────────────────────
const AudioPlayer = ({ url }: { url: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSound = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const fullUrl = url.startsWith('http') || url.startsWith('file://') ? url : API_BASE_URL + url;
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: fullUrl },
          { shouldPlay: true }
        );
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
        });
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (e) {
      console.log('Error playing sound', e);
    }
  };

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  return (
    <TouchableOpacity 
      style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#FFF8F2', 
        padding: spacing.md, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: colors.primarySaffron + '40', 
        marginTop: spacing.sm, 
        marginBottom: spacing.md 
      }} 
      onPress={playSound}
    >
      <Feather name={isPlaying ? "pause-circle" : "play-circle"} size={24} color={colors.primarySaffron} />
      <Text style={{ ...typography.bodyText, color: colors.primarySaffron, marginLeft: spacing.sm, fontWeight: '700' }}>
        {isPlaying ? "Playing Voice Note..." : "Play Voice Note"}
      </Text>
    </TouchableOpacity>
  );
};

// ── Report Modal Content Sub-Component ──────────────────────────────────────────

const ReportModalContent = ({
  report,
  language,
  assigningReportId,
  handleAutoAssign,
  styles,
}: {
  report: any;
  language: string;
  assigningReportId: string | null;
  handleAutoAssign: (r: any) => void;
  styles: any;
}) => {
  let title = report.primary_category || 'Community Issue';
  if (typeof title === 'object' && title !== null) {
    title = title[language] || title.en || title.hi || 'Community Issue';
  }
  title = String(title);

  let description = report.description || report.executive_summary || 'No description provided.';
  if (typeof description === 'object' && description !== null) {
    description = description[language] || description.en || description.hi || 'No description provided.';
  }
  description = String(description);

  let urgency = report.urgency_level || 'Moderate';
  if (typeof urgency === 'object' && urgency !== null) {
    urgency = urgency[language] || urgency.en || urgency.hi || 'Moderate';
  }
  urgency = String(urgency);

  let location = report.precise_location || report.location || 'Location shared';
  if (typeof location === 'object' && location !== null) {
    location = (location as any)[language] || (location as any).en || (location as any).hi || 'Location shared';
  }
  location = String(location);

  let imageUrl = '';
  try {
    if (report.field_report_data) {
      const parsed = typeof report.field_report_data === 'string'
        ? JSON.parse(report.field_report_data)
        : report.field_report_data;
      const imageItem = parsed.media_library?.find((m: any) => m.type === 'image');
      if (imageItem) imageUrl = String(imageItem.url || '');
    }
    if (!imageUrl && report.photo_url) {
      imageUrl = String(report.photo_url);
    }
  } catch (e) {
    console.warn('Error parsing photo url:', e);
  }

  const getUrgencyColor = (urg: string) => {
    switch (urg) {
      case 'Critical': return colors.error;
      case 'High': return '#FF8C00';
      case 'Moderate': return colors.warning;
      case 'Low': return colors.info;
      default: return colors.primarySaffron;
    }
  };
  const urgencyColor = getUrgencyColor(urgency);

  const resolvedImageUrl = imageUrl
    ? (imageUrl.startsWith('http') || imageUrl.startsWith('file://')
        ? imageUrl
        : API_BASE_URL + imageUrl)
    : '';

  return (
    <ScrollView
      style={styles.modalScroll}
      contentContainerStyle={styles.modalScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Urgency badges */}
      <View style={styles.modalCategoryRow}>
        <View style={[styles.modalUrgencyBadge, { backgroundColor: urgencyColor + '15' }]}>
          <Text style={[styles.modalUrgencyText, { color: urgencyColor }]}>{urgency.toUpperCase()}</Text>
        </View>
        {Boolean(report.severity_score) && (
          <View style={styles.modalSeverityBadge}>
            <Text style={styles.modalSeverityText}>Severity {report.severity_score}/10</Text>
          </View>
        )}
      </View>

      <Text style={styles.modalReportTitle}>{title}</Text>

      <Text style={styles.modalSectionLabel}>1. PROBLEM DESCRIPTION</Text>
      <Text style={styles.modalDescriptionText}>{description}</Text>

      {Boolean(resolvedImageUrl) && (
        <Image
          source={{ uri: resolvedImageUrl }}
          style={styles.modalEvidenceImage}
          resizeMode="cover"
        />
      )}

      {Boolean(report.audio_url) && (
        <>
          <Text style={styles.modalSectionLabel}>AUDIO EVIDENCE</Text>
          <AudioPlayer url={String(report.audio_url)} />
        </>
      )}

      <Text style={styles.modalSectionLabel}>2. REPORT DETAILS</Text>
      <View style={styles.modalDetailRow}>
        <Feather name="user" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <Text style={styles.modalDetailVal}>
          Reporter: <Text style={styles.boldText}>{report.citizen_name || 'Anonymous Citizen'}</Text>
        </Text>
      </View>

      {Boolean(report.phone) && (
        <TouchableOpacity
          style={styles.modalDetailRow}
          onPress={() => Linking.openURL(`tel:${report.phone}`)}
        >
          <Feather name="phone" size={16} color={colors.primarySaffron} style={{ marginRight: 8 }} />
          <Text style={[styles.modalDetailVal, { color: colors.primarySaffron, textDecorationLine: 'underline' }]}>
            {report.phone}
          </Text>
          <Feather name="external-link" size={12} color={colors.primarySaffron} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      )}

      <View style={styles.modalDetailRow}>
        <Feather name="map-pin" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <Text style={styles.modalDetailVal}>
          Location: <Text style={styles.boldText}>{location}</Text>
        </Text>
      </View>

      {Boolean(report.gps_coordinates) && (
        <View style={styles.modalDetailRow}>
          <Feather name="navigation" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <Text style={styles.modalDetailVal}>
            GPS: <Text style={styles.boldText}>{String(report.gps_coordinates)}</Text>
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.modalRespondBtn}
        onPress={() => handleAutoAssign(report)}
        disabled={assigningReportId === report.id}
      >
        <LinearGradient
          colors={['#FF8C00', '#FF5722']}
          style={styles.modalRespondGradient}
        >
          {assigningReportId === report.id ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="zap" size={18} color="#fff" />
              <Text style={styles.modalRespondBtnText}>Respond & Auto-Assign</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ── Main screen ─────────────────────────────────────────────────────────────────

export const DashboardScreen = () => {
  const { t, language } = useLanguage();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { predictions, loadPredictions, reports, loadReports, addManualEvent } = useEventStore();
  const { rooms, loadRooms } = useChatStore();
  const [loading, setLoading] = useState(predictions.length === 0 && reports.length === 0);
  const { role, user } = useAuthStore();

  const currentUserId = user?.id || '';

  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [assigningReportId, setAssigningReportId] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        const hasCache = predictions.length > 0 || reports.length > 0;
        if (!hasCache) {
          setLoading(true);
        }
        await Promise.all([
          loadPredictions(),
          loadRooms(currentUserId),
          loadReports()
        ]);
        setLoading(false);
      };
      
      fetchData();
    }, [currentUserId, predictions.length, reports.length])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadPredictions(),
      loadRooms(currentUserId),
      loadReports()
    ]);
    setRefreshing(false);
  };

  const handleAutoAssign = async (report: any) => {
    if (!report) return;
    
    // Determine category
    let rawCategory = report.primary_category || report.auto_category || report.issue_type || 'Other';
    if (typeof rawCategory === 'object' && rawCategory !== null) {
      rawCategory = rawCategory[language] || rawCategory.en || rawCategory.hi || 'Other';
    }
    const categoryStr = String(rawCategory).trim();
    
    // Determine title / event type
    let rawTitle = report.primary_category || report.auto_category || 'Community Intervention';
    if (typeof rawTitle === 'object' && rawTitle !== null) {
      rawTitle = rawTitle[language] || rawTitle.en || rawTitle.hi || 'Community Intervention';
    }
    const eventType = `${rawTitle} Response Drive`;

    // Map category to skills
    const mapCategoryToSkills = (cat: string) => {
      const lower = cat.toLowerCase();
      if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('flood')) {
        return ['logistics', 'construction', 'driving'];
      }
      if (lower.includes('med') || lower.includes('health') || lower.includes('hospital') || lower.includes('doctor') || lower.includes('sick')) {
        return ['first_aid', 'medical', 'documentation'];
      }
      if (lower.includes('clean') || lower.includes('sanit') || lower.includes('garb') || lower.includes('waste')) {
        return ['logistics', 'crowd_management', 'documentation'];
      }
      if (lower.includes('edu') || lower.includes('school') || lower.includes('teach')) {
        return ['teaching', 'counseling', 'documentation'];
      }
      if (lower.includes('road') || lower.includes('pothole') || lower.includes('infra') || lower.includes('build')) {
        return ['construction', 'logistics', 'driving'];
      }
      if (lower.includes('safe') || lower.includes('polic') || lower.includes('crime') || lower.includes('guard')) {
        return ['crowd_management', 'first_aid', 'counseling'];
      }
      return ['logistics', 'crowd_management'];
    };

    const requiredSkills = mapCategoryToSkills(categoryStr);

    // Get coordinates
    let lat: number | undefined = undefined;
    let lon: number | undefined = undefined;
    if (report.gps_coordinates && typeof report.gps_coordinates === 'string') {
      const parts = report.gps_coordinates.split(',');
      if (parts.length === 2) {
        const parsedLat = parseFloat(parts[0].trim());
        const parsedLon = parseFloat(parts[1].trim());
        if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
          lat = parsedLat;
          lon = parsedLon;
        }
      }
    }

    // Determine location string
    let locationStr = report.precise_location || report.location || 'Location shared';
    if (typeof locationStr === 'object' && locationStr !== null) {
      locationStr = locationStr[language] || locationStr.en || locationStr.hi || 'Location shared';
    }

    // Formulate date strings (start today, end in 3 days)
    const todayStr = new Date().toISOString().split('T')[0];
    const endStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Build description
    let desc = report.description || report.executive_summary || 'AI-Assigned Community Issue Response';
    if (typeof desc === 'object' && desc !== null) {
      desc = desc[language] || desc.en || desc.hi || JSON.stringify(desc);
    }

    const payload = {
      event_type: eventType,
      category: categoryStr,
      description: desc,
      area: locationStr,
      latitude: lat,
      longitude: lon,
      geofence_radius: 150.0,
      predicted_date_start: todayStr,
      predicted_date_end: endStr,
      estimated_headcount: 5,
      required_skills: requiredSkills,
      supervisor_id: user?.id || currentUserId,
      supervisor_name: user?.name || 'NGO Supervisor',
    };

    setAssigningReportId(report.id);
    try {
      await addManualEvent(payload);
      Alert.alert(
        t('common.success') || 'Success',
        'Auto-assignment engine successfully triggered! Best matching volunteers have been assigned and notified in real-time.'
      );
      setSelectedReport(null); // Close modal if open
    } catch (err) {
      console.error('Auto assign failed:', err);
      Alert.alert(
        t('common.error') || 'Error',
        'Auto-assignment dispatch failed. Please check network connection.'
      );
    } finally {
      setAssigningReportId(null);
    }
  };

  const totalUnread = rooms.reduce((sum, r) => sum + (r.unread_count || 0), 0);

  const displayPredictions = predictions.length > 0 ? predictions : MOCK_PREDICTIONS;
  const activePredictions = displayPredictions.filter((p) => p.status !== 'dismissed');

  return (
    <GradientBackground variant="dashboard" style={styles.container}>
      <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
        <View style={styles.greetingHeader}>
          <Text style={styles.greetingText}>{t('supervisor.dashboard.greeting')} 👋</Text>
          <DynamicText 
            style={styles.userNameText} 
            text={user?.name || "NGO Supervisor"} 
            collection="users"
            docId={user?.id || currentUserId}
            field="name"
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.7}
          />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('ChatList')}
            style={styles.chatHeaderBtn}
          >
            <Feather name="message-circle" size={24} color={colors.primarySaffron} />
            {totalUnread > 0 && (
              <View style={[styles.chatBadge, totalUnread > 9 && styles.chatBadgeWide]}>
                <Text style={styles.chatBadgeText}>{totalUnread > 99 ? '99+' : totalUnread}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.avatarWrapper}>
            <UserAvatar name={user?.name || "Supervisor"} size={54} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <SectionTitle title={t('supervisor.dashboard.metrics')} />
          <View style={styles.metricsGrid}>
            {loading ? (
               <>
                 <SkeletonCard style={styles.gridCard} />
                 <SkeletonCard style={styles.gridCard} />
                 <SkeletonCard style={styles.gridCard} />
                 <SkeletonCard style={styles.gridCard} />
               </>
            ) : (
               <>
                 <StatCard title={t('supervisor.dashboard.activeVolunteers')} value={MOCK_STATS.activeVolunteers.toString()} iconName="users" style={styles.gridCard} />
                 <StatCard title={t('supervisor.dashboard.openMissions')} value={MOCK_STATS.openMissions.toString()} iconName="crosshair" style={styles.gridCard} iconColor={colors.warning} />
                 <StatCard title={t('supervisor.dashboard.issuesReported')} value={(reports.length || MOCK_STATS.issuesReported).toString()} iconName="alert-triangle" style={styles.gridCard} iconColor={colors.error} />
                 <StatCard title={t('supervisor.dashboard.totalImpact')} value={MOCK_STATS.totalImpactHours} iconName="award" style={styles.gridCard} iconColor={colors.success} />
               </>
            )}
          </View>

          {/* New Active Alerts Section */}
          {reports.length > 0 && (
            <>
              <SectionTitle title={t('supervisor.dashboard.activeAlerts')} />
              {reports.slice(0, 3).map((report, idx) => {
                let imageUrl = '';
                let description = report.description || report.executive_summary || '';
                if (typeof description === 'object' && description !== null) {
                  description = description[language] || description.en || description.hi || JSON.stringify(description);
                }

                let title = report.primary_category || 'Community Issue';
                if (typeof title === 'object' && title !== null) {
                  title = title[language] || title.en || title.hi || JSON.stringify(title);
                }

                let urgency = report.urgency_level || 'Moderate';
                if (typeof urgency === 'object' && urgency !== null) {
                  urgency = urgency[language] || urgency.en || urgency.hi || JSON.stringify(urgency);
                }

                let location = report.precise_location || report.location || 'Location shared';
                if (typeof location === 'object' && location !== null) {
                  location = (location as any)[language] || (location as any).en || (location as any).hi || JSON.stringify(location);
                }

                try {
                  // Strategy 1: Check field_report_data (from Scan & Survey)
                  if (report.field_report_data) {
                    const parsed = typeof report.field_report_data === 'string' 
                      ? JSON.parse(report.field_report_data) 
                      : report.field_report_data;
                      
                    const imageItem = parsed.media_library?.find((m: any) => m.type === 'image');
                    if (imageItem) imageUrl = imageItem.url;
                  }
                  
                  // Strategy 2: Check direct photo_url (from Telegram/WhatsApp Bots)
                  if (!imageUrl && report.photo_url) {
                    imageUrl = report.photo_url;
                  }
                } catch (e) {
                  console.warn('Error parsing report data for dashboard:', e);
                }

                return (
                  <AlertCard
                    key={report.id || idx}
                    title={title}
                    description={description}
                    imageUrl={imageUrl}
                    location={location}
                    urgency={urgency as any}
                    time="JUST NOW"
                    onPress={() => setSelectedReport(report)}
                    onRespond={() => handleAutoAssign(report)}
                  />
                )
              })}
            </>
          )}

          <SectionTitle title={t('supervisor.dashboard.operations')} />
          <View style={styles.actionsContainer}>
            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
              <GradientButton title={t('supervisor.dashboard.dispatch')} icon="send" onPress={() => navigation.navigate('AssignmentManager')} style={{ flex: 1 }} />
              <TouchableOpacity 
                style={styles.manualActionBtn}
                onPress={() => navigation.navigate('ManualEvent')}
              >
                <Feather name="plus-circle" size={18} color={colors.primarySaffron} />
                <Text style={styles.manualActionText}>{t('supervisor.dashboard.manualEvent')}</Text>
              </TouchableOpacity>
            </View>
            <GradientButton title={t('supervisor.dashboard.viewHeatmap')} icon="map" onPress={() => navigation.navigate('Crisis Heatmap')} style={styles.actionBtn} />
          </View>

          {/* Impact Reports Section */}
          <View style={styles.forecastHeader}>
            <SectionTitle title={t('supervisor.impactReports.title')} />
            <TouchableOpacity onPress={() => navigation.navigate('ImpactReports')}>
               <Text style={styles.viewAllText}>{t('supervisor.dashboard.viewAll')}</Text>
            </TouchableOpacity>
            <View style={styles.forecastBadge}>
              <Text style={styles.forecastBadgeText}>{t('supervisor.impactReports.autoReport')}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.reportsDashboardCard}
            onPress={() => navigation.navigate('ImpactReports')}
          >
            <LinearGradient
              colors={['#F5FAF6', '#FFFFFF']}
              style={styles.reportsGradient}
            >
              <View style={styles.reportsIconContainer}>
                <Feather name="bar-chart-2" size={24} color={colors.primaryGreen} />
              </View>
              <View style={styles.reportsInfo}>
                <Text style={styles.reportsTitle}>{t('supervisor.impactReports.weeklyHighlights')}</Text>
                <Text style={styles.reportsSub}>{t('supervisor.impactReports.foodDrive')} • {t('supervisor.impactReports.mealsServed')}</Text>
              </View>
              <Feather name="arrow-right" size={20} color={colors.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Complaint Detail Overlay — no Modal to avoid Android animation crash */}
      {selectedReport !== null && (
        <View style={styles.overlayContainer}>
          <TouchableWithoutFeedback onPress={() => setSelectedReport(null)}>
            <View style={styles.overlayBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Feather name="alert-circle" size={20} color={colors.primarySaffron} />
                <Text style={styles.modalTitle}>Complaint Details</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedReport(null)} style={styles.closeBtn}>
                <Feather name="x" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ReportModalContent
              report={selectedReport}
              language={language}
              assigningReportId={assigningReportId}
              handleAutoAssign={handleAutoAssign}
              styles={styles}
            />
          </View>
        </View>
      )}
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
    height: 200,
    zIndex: 1,
  },
  greetingHeader: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 12,
  },
  greetingText: {
    ...typography.bodyText,
    color: '#1A237E', // Cohesive Navy Blue text
    marginBottom: 2,
    fontWeight: '600',
    fontSize: 16,
  },
  userNameText: {
    ...typography.headingMedium,
    color: '#1A237E', // Cohesive Navy Blue text
    fontWeight: '800',
    fontSize: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 30,
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
    paddingBottom: spacing.xl,
  },
  mainContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    minHeight: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
  },
  gridCard: {
    width: '46%',
    margin: '2%',
  },
  actionsContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  actionBtn: {
    marginBottom: spacing.md,
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.xl,
  },
  forecastBadge: {
    backgroundColor: colors.primarySaffron + '20',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  forecastBadgeText: {
    fontSize: 11,
    color: colors.primarySaffron,
    fontWeight: '700' as const,
  },
  forecastScroll: {
    paddingBottom: spacing.md,
    paddingLeft: spacing.sm,
  },
  viewAllText: {
    color: colors.primarySaffron,
    fontSize: 12,
    fontWeight: '800',
    marginRight: spacing.sm,
  },
  manualActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primarySaffron,
    backgroundColor: '#fff',
  },
  reportsDashboardCard: {
    marginHorizontal: spacing.xl,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: spacing.xl,
  },
  reportsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: 15,
  },
  reportsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryGreen + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportsInfo: {
    flex: 1,
  },
  reportsTitle: {
    ...typography.headingSmall,
    fontSize: 15,
    color: colors.textPrimary,
  },
  reportsSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  manualActionText: {
    color: colors.primarySaffron,
    fontWeight: '800',
    fontSize: 14,
  },
  // Overlay (replaces Modal)
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  overlayBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    ...typography.headingMedium,
    fontSize: 18,
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    paddingHorizontal: 24,
  },
  modalScrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  modalCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalUrgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalUrgencyText: {
    fontSize: 11,
    fontWeight: '800',
  },
  modalSeverityBadge: {
    backgroundColor: colors.error + '12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalSeverityText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.error,
  },
  modalReportTitle: {
    ...typography.headingLarge,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  modalDescriptionText: {
    ...typography.bodyText,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 16,
  },
  modalEvidenceImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  modalDetailVal: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalRespondBtn: {
    marginTop: 28,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalRespondGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalRespondBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
