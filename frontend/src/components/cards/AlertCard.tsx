import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface AlertCardProps {
  title: string;
  description: string;
  location?: string;
  time?: string;
  imageUrl?: string;
  urgency?: 'Critical' | 'High' | 'Moderate' | 'Low';
  onPress?: () => void;
  onRespond?: () => void;
  iconName?: keyof typeof Feather.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  description,
  location,
  time,
  imageUrl,
  urgency = 'Moderate',
  onPress,
  onRespond,
  iconName,
  iconColor,
  iconBgColor,
}) => {
  const getUrgencyColor = () => {
    switch (urgency) {
      case 'Critical': return colors.error;
      case 'High': return '#FF8C00';
      case 'Moderate': return colors.warning;
      case 'Low': return colors.info;
      default: return colors.primarySaffron;
    }
  };

  const getIconConfig = () => {
    if (iconName && iconColor) {
      return { name: iconName, color: iconColor, bg: iconBgColor || iconColor + '15' };
    }

    const categoryText = String(title).toLowerCase();

    // Map keywords to specific icons and HSL tailored colors
    if (categoryText.includes('edu') || categoryText.includes('school') || categoryText.includes('teach')) {
      return { name: 'award' as const, color: '#FF8C42', bg: '#FFF3E8' };
    }
    if (categoryText.includes('med') || categoryText.includes('health') || categoryText.includes('hospital') || categoryText.includes('doctor') || categoryText.includes('sick')) {
      return { name: 'plus-circle' as const, color: '#D32F2F', bg: '#FFEBEE' };
    }
    if (categoryText.includes('water') || categoryText.includes('leak') || categoryText.includes('pipe') || categoryText.includes('flood')) {
      return { name: 'droplet' as const, color: '#1976D2', bg: '#E3F2FD' };
    }
    if (categoryText.includes('clean') || categoryText.includes('sanit') || categoryText.includes('garb') || categoryText.includes('waste')) {
      return { name: 'trash-2' as const, color: '#388E3C', bg: '#E8F5E9' };
    }
    if (categoryText.includes('road') || categoryText.includes('pothole') || categoryText.includes('infra') || categoryText.includes('build')) {
      return { name: 'tool' as const, color: '#7B1FA2', bg: '#F3E5F5' };
    }
    if (categoryText.includes('elect') || categoryText.includes('power') || categoryText.includes('light') || categoryText.includes('wire')) {
      return { name: 'zap' as const, color: '#FBC02D', bg: '#FFFDE7' };
    }
    if (categoryText.includes('safe') || categoryText.includes('polic') || categoryText.includes('crime') || categoryText.includes('guard')) {
      return { name: 'shield' as const, color: '#E65100', bg: '#FFE0B2' };
    }

    // Default stable hashed fallback icons based on title + description
    const iconsList = [
      { name: 'award' as const, color: '#FF8C42', bg: '#FFF3E8' },
      { name: 'plus-circle' as const, color: '#D32F2F', bg: '#FFEBEE' },
      { name: 'droplet' as const, color: '#1976D2', bg: '#E3F2FD' },
      { name: 'trash-2' as const, color: '#388E3C', bg: '#E8F5E9' },
      { name: 'tool' as const, color: '#7B1FA2', bg: '#F3E5F5' },
      { name: 'zap' as const, color: '#FBC02D', bg: '#FFFDE7' },
      { name: 'shield' as const, color: '#E65100', bg: '#FFE0B2' },
    ];

    let hash = 0;
    const combinedStr = title + description;
    for (let i = 0; i < combinedStr.length; i++) {
      hash = combinedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % iconsList.length;
    return iconsList[index];
  };

  const config = getIconConfig();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.urgencyBar, { backgroundColor: getUrgencyColor() }]} />
      
      <View style={styles.cardContent}>
        <View style={styles.mainRow}>
          {/* Circular Icon Wrapper */}
          <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
            <Feather name={config.name} size={22} color={config.color} />
          </View>

          {/* Texts and Actions Content */}
          <View style={styles.textContent}>
            <View style={styles.headerRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {urgency === 'Critical' && (
                  <View style={styles.criticalBadge}>
                    <Text style={styles.criticalText}>CRITICAL</Text>
                  </View>
                )}
              </View>
              <Text style={styles.timeText}>{time}</Text>
            </View>

            <Text style={styles.description} numberOfLines={2}>{description}</Text>

            {imageUrl && (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.evidenceImage} 
                resizeMode="cover"
              />
            )}

            <View style={styles.footer}>
              <View style={styles.locationContainer}>
                <Feather name="map-pin" size={14} color={colors.textSecondary} />
                <Text style={styles.locationText} numberOfLines={1}>{location || 'Location shared'}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => {
                  if (onRespond) onRespond();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.actionBtnText}>Respond</Text>
                <Feather name="chevron-right" size={16} color={colors.primarySaffron} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  urgencyBar: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  mainRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  textContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  title: {
    ...typography.headingSmall,
    fontSize: 16,
    color: colors.textPrimary,
  },
  criticalBadge: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  criticalText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.error,
  },
  timeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  description: {
    ...typography.bodyText,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  evidenceImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primarySaffron,
  },
});
