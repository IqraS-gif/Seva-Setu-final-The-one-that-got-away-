import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../services/store/useAuthStore';
import { GradientBackground, AshokaChakra, MadeInIndiaBadge } from '../../components';

const { width } = Dimensions.get('window');

type AuthStackParamList = {
  SplashScreen: undefined;
  OnboardingScreen: undefined;
};

type SplashScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SplashScreen'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { hasOnboarded } = useAuthStore();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    // Logo entrance animation using Reanimated (UI thread)
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // Navigation timer
    const timer = setTimeout(() => {
      // Safety check: navigation.replace only exists on Stack navigators.
      // If used inside RootNavigator as a loading state, it might not have stack methods.
      if (typeof navigation.replace === 'function') {
        if (hasOnboarded) {
          navigation.replace('Landing' as any);
        } else {
          navigation.replace('OnboardingScreen');
        }
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigation, hasOnboarded]);

  return (
    <GradientBackground variant="auth" style={styles.container}>
      <Animated.View style={[styles.chakraContainer]}>
        <AshokaChakra size={width * 1.2} opacity={0.03} />
      </Animated.View>
      
      <Animated.View style={animatedStyle}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={styles.footer}>
        <MadeInIndiaBadge />
      </Animated.View>
    </GradientBackground>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  chakraContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
});


export default SplashScreen;
