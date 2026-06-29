import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { AppHeader, SectionTitle, MissionCard, DynamicText } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthStore } from '../../services/store/useAuthStore';
import { API_BASE_URL } from '../../config/apiConfig';

export const MyRequestsScreen = () => {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [completedRequests, setCompletedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/reports`, {
        params: { citizen_id: user?.id }
      });
      if (response.data.success) {
        const reports = response.data.reports || [];
        const active = reports.filter((r: any) => r.status !== 'Resolved' && r.status !== 'Completed');
        const completed = reports.filter((r: any) => r.status === 'Resolved' || r.status === 'Completed');
        
        // Sort by created_at descending
        active.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        completed.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

        setActiveRequests(active);
        setCompletedRequests(completed);
      }
    } catch (error) {
      console.error('Error fetching my requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.id) fetchReports();
    }, [user?.id])
  );

  return (
    <View style={styles.container}>
      <AppHeader title={t('citizen.myRequests.title')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primarySaffron} style={{ marginTop: 40 }} />
        ) : (
          <>
            <SectionTitle title={t('citizen.myRequests.activeRequests') || 'Active Requests'} />
            <View style={styles.listContainer}>
              {activeRequests.length > 0 ? activeRequests.map(req => (
                <MissionCard 
                  key={req.id}
                  title={req.primary_category || 'General Issue'}
                  description={req.description || 'No description provided.'}
                  location={req.precise_location || req.location || 'Location Not Provided'}
                  urgency={req.urgency_level || 'Medium'}
                  onPress={() => navigation.navigate('CitizenReportDetail', { report: req })}
                />
              )) : (
                <Text style={styles.emptyText}>No active requests found.</Text>
              )}
            </View>

            <SectionTitle title={t('citizen.myRequests.completed') || 'Completed Requests'} />
            <View style={styles.listContainer}>
              {completedRequests.length > 0 ? completedRequests.map(req => (
                <MissionCard 
                  key={req.id}
                  title={req.primary_category || 'General Issue'}
                  description={req.description || 'No description provided.'}
                  location={req.resolved_at ? `Resolved on ${new Date(req.resolved_at).toLocaleDateString()}` : "Resolved"}
                  urgency="Low"
                  onPress={() => navigation.navigate('CitizenReportDetail', { report: req })}
                />
              )) : (
                <Text style={styles.emptyText}>No completed requests found.</Text>
              )}
            </View>
          </>
        )}
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
  listContainer: {
    paddingHorizontal: spacing.md,
  },
  emptyText: {
    ...typography.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.lg,
    fontStyle: 'italic',
  },
});
