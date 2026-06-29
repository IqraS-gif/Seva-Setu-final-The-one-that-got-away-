import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { AppHeader, PrimaryButton, ConfettiOverlay } from '../../components';
import { colors, spacing, typography, globalStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { LottieSuccess, LottieLoading } from '../../components/common/LottieAnimations';
import { useLanguage } from '../../context/LanguageContext';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';
import { useAuthStore } from '../../services/store/useAuthStore';
import { uploadGenericFile } from '../../services/api/UploadService';

type IssueType = 'Water Shortage' | 'Food Assistance' | 'Medical Help' | 'Education' | 'Other';

export const ReportIssueScreen = () => {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const [selectedType, setSelectedType] = useState<IssueType | null>(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // New state
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [locationStr, setLocationStr] = useState<string>('');
  const [gpsCoords, setGpsCoords] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);

  const ISSUE_CATEGORIES: { label: IssueType, key: string, icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Water Shortage', key: 'waterShortage', icon: 'water' },
    { label: 'Food Assistance', key: 'foodAssistance', icon: 'restaurant' },
    { label: 'Medical Help', key: 'medicalHelp', icon: 'medical' },
    { label: 'Education', key: 'education', icon: 'book' },
    { label: 'Other', key: 'other', icon: 'ellipsis-horizontal-circle' },
  ];

  const pickPhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      Alert.alert(t('common.success'), t('citizen.reportIssue.photoAdded') || 'Photo Attached');
    }
  };

  const handleRecord = async () => {
    if (recording) {
      // Stop recording
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setRecording(null);
        Alert.alert(t('common.success'), t('citizen.reportIssue.voiceAdded') || 'Voice Note Attached');
      } catch (err) {
        console.error('Failed to stop recording', err);
      }
    } else {
      // Start recording
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
      } catch (err) {
        console.error('Failed to start recording', err);
      }
    }
  };

  const fetchLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location services.');
        setIsLocating(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const coords = `${location.coords.latitude}, ${location.coords.longitude}`;
      setGpsCoords(coords);

      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const addr = `${geocode[0].street || ''} ${geocode[0].city || ''}, ${geocode[0].region || ''}`;
        setLocationStr(addr.trim());
      } else {
        setLocationStr(coords);
      }
      Alert.alert(t('common.success'), t('citizen.reportIssue.locationAdded') || 'Location Captured');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch location.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    setStatus('loading');
    
    try {
      let finalPhotoUrl = undefined;
      let finalAudioUrl = undefined;

      if (photoUri) {
        const photoExt = photoUri.split('.').pop() || 'jpg';
        const photoName = `citizen_photo_${Date.now()}.${photoExt}`;
        const uploaded = await uploadGenericFile(photoUri, photoName, `image/${photoExt}`);
        if (uploaded) finalPhotoUrl = uploaded;
      }

      if (audioUri) {
        const audioExt = audioUri.split('.').pop() || 'm4a';
        const audioName = `citizen_audio_${Date.now()}.${audioExt}`;
        const uploaded = await uploadGenericFile(audioUri, audioName, `audio/${audioExt}`);
        if (uploaded) finalAudioUrl = uploaded;
      }

      const payload = {
        volunteer_id: user?.id || 'citizen',
        citizen_id: user?.id,
        report_source: 'citizen_report',
        primary_category: selectedType,
        description: description,
        precise_location: locationStr || 'Location not provided',
        location: locationStr || 'Location not provided',
        gps_coordinates: gpsCoords,
        citizen_name: user?.name,
        urgency_level: 'Moderate',
        status: 'Pending',
        photo_url: finalPhotoUrl,
        audio_url: finalAudioUrl,
      };

      await axios.post(`${API_BASE_URL}/submit-report`, payload);
      
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setSelectedType(null);
        setDescription('');
        setPhotoUri(null);
        setAudioUri(null);
        setLocationStr('');
        setGpsCoords('');
      }, 3000);
    } catch (error) {
      console.error('Submit report error:', error);
      Alert.alert(t('common.error'), 'Failed to submit report. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <View style={[styles.container, styles.centerAll]}>
        <LottieSuccess message={t('citizen.reportIssue.successMessage')} size={200} />
        <PrimaryButton
          title={t('citizen.reportIssue.reportAnother')}
          onPress={() => { setStatus('idle'); setSelectedType(null); setDescription(''); setPhotoUri(null); setAudioUri(null); setLocationStr(''); setGpsCoords(''); }}
          style={styles.backBtn}
        />
        <ConfettiOverlay play={true} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={t('citizen.reportIssue.title')} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={[globalStyles.card, styles.promptCard]}>
          <Text style={typography.headingMedium}>{t('citizen.reportIssue.whatIssue')}</Text>
          <Text style={styles.subtitle}>{t('citizen.reportIssue.selectCategory')}</Text>
          
          <View style={styles.categoriesGrid}>
            {ISSUE_CATEGORIES.map((cat) => {
              const isSelected = selectedType === cat.label;
              return (
                <TouchableOpacity 
                  key={cat.label}
                  activeOpacity={0.7}
                  style={[styles.categoryBtn, isSelected && styles.categoryBtnSelected]}
                  onPress={() => setSelectedType(cat.label)}
                >
                  <Ionicons 
                    name={cat.icon} 
                    size={24} 
                    color={isSelected ? colors.cardBackground : colors.accentBlue} 
                  />
                  <Text style={[styles.categoryBtnText, isSelected && styles.categoryBtnTextSelected]}>
                    {t(`citizen.reportIssue.${cat.key}`) || cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.mediaSection}>
          <TouchableOpacity 
            style={[styles.actionBtn, photoUri && { backgroundColor: colors.success + '20' }]}
            onPress={pickPhoto}
          >
            <Ionicons name="camera-outline" size={24} color={photoUri ? colors.success : colors.textPrimary} />
            <Text style={[styles.actionBtnText, photoUri && { color: colors.success }]}>
              {photoUri ? t('survey.photoAttached') : t('citizen.reportIssue.addPhoto')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, recording && { backgroundColor: colors.error + '20' }, audioUri && { backgroundColor: colors.success + '20' }]}
            onPress={handleRecord}
          >
            <Ionicons name={recording ? "stop-circle-outline" : "mic-outline"} size={24} color={recording ? colors.error : (audioUri ? colors.success : colors.textPrimary)} />
            <Text style={[styles.actionBtnText, recording && { color: colors.error }, audioUri && { color: colors.success }]}>
              {recording ? t('citizen.reportIssue.recording') || 'Recording...' : (audioUri ? t('survey.audioAttached') : t('citizen.reportIssue.voiceDescription'))}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, locationStr ? { backgroundColor: colors.success + '20' } : null]}
            onPress={fetchLocation}
            disabled={isLocating}
          >
            <Ionicons name="location-outline" size={24} color={locationStr ? colors.success : colors.textPrimary} />
            <Text style={[styles.actionBtnText, locationStr ? { color: colors.success } : null]}>
              {isLocating ? '...' : (locationStr ? t('citizen.reportIssue.locationAdded') || 'Added' : t('citizen.reportIssue.addLocation'))}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <Text style={typography.headingSmall}>{t('citizen.reportIssue.additionalDetails')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('citizen.reportIssue.descriptionPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.submitContainer}>
          {status === 'loading' ? (
            <LottieLoading message={t('citizen.reportIssue.submittingReport')} size={80} />
          ) : (
            <PrimaryButton 
              title={t('citizen.reportIssue.submitReport')} 
              onPress={handleSubmit} 
              style={[styles.submitBtn, !selectedType && styles.submitBtnDisabled]}
              disabled={!selectedType}
            />
          )}
        </View>

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
  centerAll: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  promptCard: {
    margin: spacing.md,
    padding: spacing.lg,
  },
  subtitle: {
    ...typography.bodyText,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentBlue + '15', // 15% opacity soft background
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.xs,
  },
  categoryBtnSelected: {
    backgroundColor: colors.accentBlue,
  },
  categoryBtnText: {
    ...typography.bodyText,
    color: colors.accentBlue,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  categoryBtnTextSelected: {
    color: colors.cardBackground,
  },
  mediaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    backgroundColor: colors.cardBackground,
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionBtnText: {
    ...typography.captionText,
    marginTop: spacing.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  textInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
    height: 120,
    ...typography.bodyText,
    borderWidth: 1,
    borderColor: colors.textSecondary + '30',
  },
  submitContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  submitBtn: {
    width: '100%',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  loadingText: {
    ...typography.bodyText,
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  backBtn: {
    width: '100%',
    marginTop: spacing.lg,
  },
});
