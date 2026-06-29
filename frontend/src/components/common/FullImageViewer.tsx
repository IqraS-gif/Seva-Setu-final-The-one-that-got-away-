import React from 'react';
import { Modal, View, Image, StyleSheet, TouchableOpacity, Text, useWindowDimensions, Platform, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface FullImageViewerProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

export const FullImageViewer: React.FC<FullImageViewerProps> = ({ visible, imageUri, onClose }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  if (!imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.overlay, { width: windowWidth, height: windowHeight }]}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.9)" />
        
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
          activeOpacity={0.7}
        >
          <View style={styles.closeIconBg}>
            <Feather name="x" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        
        <View style={[styles.imageContainer, { width: windowWidth, height: windowHeight * 0.85 }]}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.tipBadge}>
            <Text style={styles.tipText}>Tap outside or 'X' to close</Text>
          </View>
        </View>
        
        {/* Background tap to close */}
        <TouchableOpacity 
          onPress={onClose} 
          activeOpacity={1}
          style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 25,
    zIndex: 10000,
    padding: 10,
  },
  closeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  tipBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tipText: {
    ...typography.captionText,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  }
});
