import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useChatStore } from '../../services/store/useChatStore';
import { useAuthStore } from '../../services/store/useAuthStore';
import { useEventStore } from '../../services/store/useEventStore';
import { MOCK_USERS } from '../../services/mockAuthData';
import { colors, spacing, typography } from '../../theme';
import { UserAvatar, AppHeader } from '../../components';

// ── Contact Picker Item ─────────────────────────────────────────────────────
const ContactItem = ({ contact, onPress }: { contact: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.contactItem} onPress={onPress}>
    <UserAvatar name={contact.name} size={46} />
    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>{contact.name}</Text>
      <Text style={styles.contactRole}>
        {contact.role === 'SUPERVISOR' ? '👤 Supervisor' : '🙋 Volunteer'}
        {contact.ngo_name ? ` · ${contact.ngo_name}` : ''}
      </Text>
    </View>
    <Feather name="message-circle" size={20} color={colors.primaryGreen} />
  </TouchableOpacity>
);

// ── Chat Room Item ──────────────────────────────────────────────────────────
const ChatRoomItem = ({ room, currentUserId, onPress }: { room: any; currentUserId: string; onPress: () => void }) => {
  const iAmVolunteer = room.volunteer_id === currentUserId;
  const iAmSupervisor = room.supervisor_id === currentUserId;

  let otherName: string;
  if (iAmVolunteer) {
    otherName = (room.supervisor_name && room.supervisor_name !== 'Me') ? room.supervisor_name : 'Supervisor';
  } else if (iAmSupervisor) {
    otherName = (room.volunteer_name && room.volunteer_name !== 'Me') ? room.volunteer_name : 'Volunteer';
  } else {
    otherName = (room.volunteer_name && room.volunteer_name !== 'Me')
      ? room.volunteer_name
      : (room.supervisor_name && room.supervisor_name !== 'Me') ? room.supervisor_name : 'User';
  }

  const hasUnread = (room.unread_count || 0) > 0;

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity style={[styles.roomItem, hasUnread && styles.unreadRoomItem]} onPress={onPress}>
      <View>
        <UserAvatar name={otherName} size={50} />
        {hasUnread && (
          <View style={styles.unreadBadgeMini}>
            <Text style={styles.unreadBadgeTextMini}>{room.unread_count}</Text>
          </View>
        )}
      </View>
      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={[styles.roomName, hasUnread && styles.unreadText]}>{otherName}</Text>
          <Text style={[styles.roomTime, hasUnread && styles.unreadTime]}>{formatTime(room.updated_at)}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={[styles.lastMessage, hasUnread && styles.unreadLastMessage]} numberOfLines={1}>
            {room.last_message || 'Tap to start chatting'}
          </Text>
          {hasUnread && <View style={styles.unreadDot} />}
        </View>
        {room.event_id && (
          <View style={styles.eventBadge}>
            <Text style={styles.eventBadgeText}>Mission context</Text>
          </View>
        )}
      </View>
      <Feather name="chevron-right" size={20} color={hasUnread ? colors.primaryGreen : colors.textSecondary} />
    </TouchableOpacity>
  );
};

// ── Main Screen ─────────────────────────────────────────────────────────────
export const ChatListScreen = () => {
  const navigation = useNavigation<any>();
  const { role, user } = useAuthStore();
  const { volunteerId: currentVolunteerId } = useEventStore();
  const [showContacts, setShowContacts] = useState(false);

  const currentUserId = user?.id || currentVolunteerId || '';

  // Build contacts list from MOCK_USERS filtered by same NGO and opposite role
  const contacts = MOCK_USERS.filter((u) => {
    if (!user?.ngo_id || u.id === user.id) return false;
    if (u.ngo_id !== user.ngo_id) return false;
    // Supervisors see volunteers; volunteers see supervisors
    if (role === 'SUPERVISOR') return u.role === 'VOLUNTEER';
    if (role === 'VOLUNTEER') return u.role === 'SUPERVISOR';
    return false;
  });

  const { rooms, loadRooms, loadingRooms, markRoomRead } = useChatStore();

  useFocusEffect(
    useCallback(() => {
      if (currentUserId) loadRooms(currentUserId);
    }, [currentUserId])
  );

  const openChatWith = (contact: any) => {
    setShowContacts(false);
    const isSupervisor = role === 'SUPERVISOR';
    navigation.navigate('Chat', {
      volunteer_id: isSupervisor ? contact.id : currentUserId,
      supervisor_id: isSupervisor ? currentUserId : contact.id,
      recipient_name: contact.name,
      volunteer_name: isSupervisor ? contact.name : (user?.name || 'Volunteer'),
      supervisor_name: isSupervisor ? (user?.name || 'Supervisor') : contact.name,
      event_name: 'General Inquiry',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with compose button */}
      <View style={styles.headerRow}>
        <AppHeader title="Messages" />
        <TouchableOpacity
          style={styles.composeBtn}
          onPress={() => setShowContacts(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="edit" size={22} color={colors.primaryGreen} />
        </TouchableOpacity>
      </View>

      {loadingRooms ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primaryGreen} size="large" />
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatRoomItem
              room={item}
              currentUserId={currentUserId}
              onPress={() => {
                const iAmVol = item.volunteer_id === currentUserId;
                const navName = iAmVol
                  ? (item.supervisor_name && item.supervisor_name !== 'Me' ? item.supervisor_name : 'Supervisor')
                  : (item.volunteer_name && item.volunteer_name !== 'Me' ? item.volunteer_name : 'Volunteer');
                markRoomRead(item.id, currentUserId);
                navigation.navigate('Chat', {
                  volunteer_id: item.volunteer_id,
                  supervisor_id: item.supervisor_id,
                  event_id: item.event_id,
                  recipient_name: navName,
                  event_name: item.event_id ? (item.event_name || 'Ongoing Mission') : 'General Inquiry',
                });
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="message-square" size={60} color={colors.textSecondary + '40'} />
              <Text style={styles.emptyText}>No conversations yet.</Text>
              <Text style={styles.emptySubtext}>
                Tap the ✏️ button above to start a new conversation.
              </Text>
              {contacts.length > 0 && (
                <TouchableOpacity style={styles.startChatBtn} onPress={() => setShowContacts(true)}>
                  <Feather name="edit" size={16} color="#fff" />
                  <Text style={styles.startChatBtnText}>New Chat</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          contentContainerStyle={[styles.listContent, rooms.length === 0 && { flex: 1 }]}
        />
      )}

      {/* Contact Picker Modal */}
      <Modal visible={showContacts} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {role === 'SUPERVISOR' ? 'Message a Volunteer' : 'Message your Supervisor'}
              </Text>
              <TouchableOpacity onPress={() => setShowContacts(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              {role === 'SUPERVISOR'
                ? `Volunteers in ${user?.ngo_name || 'your NGO'}`
                : `Supervisors in ${user?.ngo_name || 'your NGO'}`}
            </Text>

            {contacts.length === 0 ? (
              <View style={styles.noContactsBox}>
                <Text style={styles.noContactsText}>No contacts found in your NGO.</Text>
              </View>
            ) : (
              <FlatList
                data={contacts}
                keyExtractor={(c) => c.id}
                renderItem={({ item }) => (
                  <ContactItem contact={item} onPress={() => openChatWith(item)} />
                )}
                contentContainerStyle={{ paddingBottom: 40 }}
              />
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { position: 'relative' },
  composeBtn: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 14,
    zIndex: 10,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: spacing.xxl },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadRoomItem: { backgroundColor: colors.primaryGreen + '05' },
  roomInfo: { flex: 1, marginLeft: spacing.md },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  roomName: { ...typography.headingSmall, fontSize: 16 },
  roomTime: { fontSize: 12, color: colors.textSecondary },
  lastMessage: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  unreadText: { fontWeight: '800', color: '#000' },
  unreadLastMessage: { fontWeight: '700', color: colors.primaryGreen },
  unreadTime: { color: colors.primaryGreen, fontWeight: '700' },
  unreadBadgeMini: {
    position: 'absolute', right: -2, top: -2,
    backgroundColor: colors.primaryGreen, minWidth: 18, height: 18,
    borderRadius: 9, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  unreadBadgeTextMini: { color: '#fff', fontSize: 10, fontWeight: '800' },
  messageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryGreen, marginLeft: spacing.xs },
  eventBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.primaryGreen + '15',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
  },
  eventBadgeText: { fontSize: 10, color: colors.primaryGreen, fontWeight: '700' },
  emptyContainer: { flex: 1, marginTop: 80, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyText: { ...typography.headingSmall, color: colors.textSecondary, marginTop: spacing.md },
  emptySubtext: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  startChatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primaryGreen, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 24, marginTop: spacing.lg,
  },
  startChatBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  // ── Modal ──
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '75%', paddingHorizontal: spacing.lg,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd',
    alignSelf: 'center', marginTop: 12, marginBottom: 16,
  },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { ...typography.headingSmall, fontSize: 18 },
  modalSub: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },
  noContactsBox: { alignItems: 'center', paddingVertical: 40 },
  noContactsText: { color: colors.textSecondary, fontSize: 15 },
  // ── Contact Item ──
  contactItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  contactInfo: { flex: 1, marginLeft: spacing.md },
  contactName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  contactRole: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});

