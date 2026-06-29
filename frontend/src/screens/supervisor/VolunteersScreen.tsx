import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { AppHeader, UserAvatar, IconButton, PrimaryButton } from '../../components';
import { colors, spacing, typography, globalStyles } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useNgoStore } from '../../services/store/useNgoStore';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useLanguage } from '../../context/LanguageContext';
import { useChatStore } from '../../services/store/useChatStore';
import { useAuthStore } from '../../services/store/useAuthStore';
import { useEventStore } from '../../services/store/useEventStore';

export const VolunteersScreen = () => {
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'CHATS' | 'PENDING'>('CHATS');
  const { pendingRequests, loadPendingRequests, updateRequest, loading } = useNgoStore();
  const { rooms, loadRooms, loadingRooms, markRoomRead } = useChatStore();
  const { user } = useAuthStore();
  const { volunteerId: currentVolunteerId } = useEventStore();

  const MOCK_SUPERVISOR_NGO_ID = user?.ngo_id || 'ngo_helping_hands';

  // Use the real authenticated user's ID — no hardcoding
  const currentUserId = user?.id || '';

  useEffect(() => {
    if (activeTab === 'PENDING') {
      loadPendingRequests(MOCK_SUPERVISOR_NGO_ID);
    } else {
      if (currentUserId) loadRooms(currentUserId);
    }
  }, [activeTab, currentUserId]);

  const handleReview = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await updateRequest(requestId, status, currentUserId);
      Alert.alert(t('common.success'), t(status === 'APPROVED' ? 'supervisor.volunteers.approveSuccess' : 'supervisor.volunteers.rejectSuccess'));
    } catch (err) {
      Alert.alert(t('common.error'), t('supervisor.volunteers.errorProcessing'));
    }
  };

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active') return t('supervisor.volunteers.activeStatus');
    if (s === 'on break') return t('supervisor.volunteers.onBreakStatus');
    if (s === 'dispatched') return t('supervisor.volunteers.dispatchedStatus');
    return status;
  };

  const renderChats = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {loadingRooms ? (
        <ActivityIndicator size="large" color={colors.primaryGreen} style={{ marginTop: 50 }} />
      ) : rooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="message-square" size={60} color={colors.textSecondary + '40'} />
          <Text style={styles.emptyText}>{t('chat.noConversations')}</Text>
        </View>
      ) : (
        rooms.map(room => {
          const otherName = room.volunteer_name && room.volunteer_name !== 'Me' ? room.volunteer_name : 'Volunteer';
          const hasUnread = (room.unread_count || 0) > 0;
          
          return (
            <TouchableOpacity 
              key={room.id} 
              style={[globalStyles.card, styles.volunteerCard, hasUnread && { backgroundColor: colors.primaryGreen + '05' }]}
              onPress={() => {
                markRoomRead(room.id, currentUserId);
                navigation.navigate('Chat', {
                  volunteer_id: room.volunteer_id,
                  supervisor_id: room.supervisor_id,
                  event_id: room.event_id,
                  recipient_name: otherName,
                  event_name: room.event_id ? (room.event_name || 'Ongoing Mission') : 'General Inquiry'
                });
              }}
            >
              <UserAvatar name={otherName} size={50} style={styles.avatar} />
              <View style={styles.info}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.volunteerName, hasUnread && { fontWeight: '800' }]}>{otherName}</Text>
                  {hasUnread && <View style={styles.unreadDot} />}
                </View>
                <Text style={[styles.lastMessageText, hasUnread && { color: colors.primaryGreen, fontWeight: '700' }]} numberOfLines={1}>
                  {room.last_message || t('chat.noMessages')}
                </Text>
                {room.event_id && (
                  <View style={styles.eventContextBadge}>
                    <Text style={styles.eventContextText}>{t('chat.missionContextActive')}</Text>
                  </View>
                )}
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );

  const renderPendingRequests = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primarySaffron} style={{ marginTop: 50 }} />
      ) : pendingRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="user-check" size={60} color={colors.textSecondary + '40'} />
          <Text style={styles.emptyText}>{t('supervisor.volunteers.noPendingRequests')}</Text>
        </View>
      ) : (
        pendingRequests.map(req => (
          <View key={req.id} style={[globalStyles.card, styles.requestCard]}>
            <View style={styles.requestHeader}>
              <UserAvatar name={req.citizen_name} size={50} />
              <View style={styles.requestInfo}>
                <Text style={styles.volunteerName}>{req.citizen_name}</Text>
                <Text style={styles.locationText}>{req.area}</Text>
              </View>
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>New</Text>
              </View>
            </View>
            
            <View style={styles.motivationBox}>
              <Text style={styles.motivationLabel}>{t('supervisor.volunteers.motivation')}</Text>
              <Text style={styles.motivationText} numberOfLines={3}>"{req.motivation}"</Text>
            </View>

            <View style={styles.skillsRow}>
              {req.skills?.map(s => (
                <View key={s} style={[styles.skillBadge, { backgroundColor: colors.primaryGreen + '15' }]}>
                  <Text style={[styles.skillBadgeText, { color: colors.primaryGreen }]}>
                    {t(`skills.${s}`) !== `skills.${s}` ? t(`skills.${s}`) : s.replace('_', ' ')}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.rejectBtn]} 
                onPress={() => handleReview(req.id, 'REJECTED')}
              >
                <Feather name="x" size={16} color={colors.error} />
                <Text style={styles.rejectBtnText}>{t('supervisor.volunteers.reject')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionBtn, styles.approveBtn]} 
                onPress={() => handleReview(req.id, 'APPROVED')}
              >
                <LinearGradient
                  colors={[colors.primaryGreen, '#1B5E20']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.approveGradient}
                >
                  <Feather name="check" size={16} color="#FFF" />
                  <Text style={styles.approveBtnText}>{t('supervisor.volunteers.approve')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <AppHeader title={t('supervisor.volunteers.title')} rightIcon="settings" />
      
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'CHATS' && styles.activeTab]}
          onPress={() => setActiveTab('CHATS')}
        >
          <Text style={[styles.tabText, activeTab === 'CHATS' && styles.activeTabText]}>{t('chat.title')}</Text>
          {activeTab === 'CHATS' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'PENDING' && styles.activeTab]}
          onPress={() => setActiveTab('PENDING')}
        >
          <View style={styles.pendingTabLabel}>
            <Text style={[styles.tabText, activeTab === 'PENDING' && styles.activeTabText]}>{t('supervisor.volunteers.requests')}</Text>
            {pendingRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            )}
          </View>
          {activeTab === 'PENDING' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>

      {activeTab === 'CHATS' ? renderChats() : renderPendingRequests()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    ...typography.bodyText,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primarySaffron,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: 3,
    backgroundColor: colors.primarySaffron,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  pendingTabLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  volunteerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  avatar: {
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  volunteerName: {
    ...typography.headingSmall,
    color: colors.textPrimary,
  },
  lastMessageText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryGreen,
  },
  eventContextBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryGreen + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  eventContextText: {
    fontSize: 10,
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  skillBadge: {
    backgroundColor: colors.accentBlue + '10',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  skillBadgeText: {
    fontSize: 10,
    color: colors.accentBlue,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  requestCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  locationText: {
    ...typography.captionText,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dateBadge: {
    backgroundColor: colors.primarySaffron + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 10,
    color: colors.primarySaffron,
    fontWeight: '800',
  },
  motivationBox: {
    backgroundColor: '#F9F9F9',
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primarySaffron,
  },
  motivationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  motivationText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: colors.error + '30',
    backgroundColor: colors.error + '05',
  },
  rejectBtnText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 14,
  },
  approveBtn: {
    overflow: 'hidden',
  },
  approveGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  approveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.6,
  },
  emptyText: {
    ...typography.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: 40,
  },
});
