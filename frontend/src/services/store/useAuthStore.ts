import { create } from 'zustand';
import { useEventStore } from './useEventStore';
import * as ngoService from '../api/ngoService';
import { firebaseAuthService, UserProfile } from '../auth/firebaseAuthService';
import { MOCK_USERS, MOCK_PASSWORD, User as MockUser } from '../mockAuthData';

// Map our local User type to what the rest of the app expects
export type Role = 'CITIZEN' | 'VOLUNTEER' | 'SUPERVISOR' | null;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  role: 'CITIZEN' | 'VOLUNTEER' | 'SUPERVISOR';
  ngo_id?: string | null;
  ngo_name?: string | null;
  avatar?: string | null;
}

interface AuthState {
  role: Role;
  user: AppUser | null;
  hasOnboarded: boolean;
  isLoading: boolean;
  setRole: (role: Role) => void;
  setAuthSession: (user: AppUser, role: Role) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, pass: string, name: string, phone: string, role: Role, ngo_id?: string, ngo_name?: string) => Promise<{ success: boolean; message: string }>;
  sendOtp: (phone: string, recaptchaVerifier: any) => Promise<{ success: boolean; message: string; confirmation?: any }>;
  verifyOtp: (confirmation: any, otp: string, role: Role) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  completeOnboarding: () => void;
  initAuth: () => () => void; // Returns unsubscribe function
}

const IS_PROD = process.env.EXPO_PUBLIC_USE_PRODUCTION === 'true';

export const useAuthStore = create<AuthState>((set, get) => ({
  role: null,
  user: null,
  hasOnboarded: false,
  isLoading: true,
  
  setRole: (role) => {
    set((state) => {
      let newUser = state.user ? { ...state.user, role: role as any } : null;
      
      // MOCK FALLBACK: If in dev and no user, pick a mock one
      if (!IS_PROD && !newUser && role) {
        const defaultForRole = MOCK_USERS.find(u => u.role === role);
        if (defaultForRole) {
          newUser = { ...defaultForRole, id: defaultForRole.id } as AppUser;
        }
      }
      
      if (role === 'VOLUNTEER' && newUser) {
        useEventStore.getState().setVolunteerId(newUser.id);
      }
      
      return { role, user: newUser };
    });
  },

  setAuthSession: (user, role) => {
    set({ user, role, isLoading: false });
    if (role === 'VOLUNTEER') {
      const es = useEventStore.getState();
      es.setVolunteerId(user.id);
      es.syncVolunteerProfile(user);
    }
  },

  login: async (email, pass) => {
    set({ isLoading: true });
    
    // ────────── DEMO OVERRIDE: CHECK MOCK USERS FIRST ──────────
    // This allows "deepak@ngo.com" to work as a supervisor even in production mode
    const demoUser = MOCK_USERS.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    const isMockMatch = demoUser && (pass === (demoUser.password || MOCK_PASSWORD));

    if (isMockMatch) {
      console.log(`[AuthStore] Demo user detected: ${email}. Overriding session.`);
      const appUser: AppUser = { ...demoUser } as AppUser;
      let finalRole = demoUser.role;

      // Check if they have an approved volunteer status (optional upgrade)
      try {
        const res = await ngoService.fetchUserRequest(demoUser.id);
        if (res && (res as any).status === 'APPROVED') {
          finalRole = 'VOLUNTEER';
          appUser.role = 'VOLUNTEER';
          appUser.ngo_id = (res as any).ngo_id;
          appUser.ngo_name = (res as any).ngo_name;
        }
      } catch (err) {
        // Ignore and keep original role
      }

      get().setAuthSession(appUser, finalRole);
      
      // Load necessary data based on role
      const eventStore = useEventStore.getState();
      if (finalRole === 'VOLUNTEER') {
        await eventStore.loadAssignments(appUser.id);
        await eventStore.loadLiveMatches(appUser.id);
      } else if (finalRole === 'SUPERVISOR') {
        await eventStore.loadPredictions();
        await eventStore.loadAllVolunteerProfiles();
      }

      return { success: true, message: 'Welcome back!' };
    }
    
    // ────────── PRODUCTION FLOW: REAL FIREBASE ──────────
    if (IS_PROD) {
      try {
        const { user, profile } = await firebaseAuthService.loginWithEmail(email, pass);
        
        if (!profile) {
          set({ isLoading: false });
          return { success: false, message: 'User profile not found in database.' };
        }

        const appUser: AppUser = {
          id: profile.uid,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          ngo_id: profile.ngo_id,
          ngo_name: profile.ngo_name,
          avatar: profile.avatar
        };

        get().setAuthSession(appUser, profile.role);
        
        // Load volunteer specific data if needed
        const eventStore = useEventStore.getState();
        if (profile.role === 'VOLUNTEER') {
          await eventStore.loadAssignments(profile.uid);
          await eventStore.loadLiveMatches(profile.uid);
        } else if (profile.role === 'SUPERVISOR') {
          await eventStore.loadPredictions();
          await eventStore.loadAllVolunteerProfiles();
        }

        return { success: true, message: 'Login successful' };
      } catch (error: any) {
        set({ isLoading: false });
        console.error('[AuthStore] Firebase Login Error:', error);
        return { success: false, message: error.message || 'Login failed' };
      }
    }

    set({ isLoading: false });
    return { success: false, message: 'Invalid credentials' };
  },

  register: async (email, pass, name, phone, role, ngo_id, ngo_name) => {
    set({ isLoading: true });
    
    if (IS_PROD) {
      try {
        const { user, profile } = await firebaseAuthService.registerWithEmail(email, pass, name, phone, role || 'CITIZEN', ngo_id, ngo_name);
        
        const appUser: AppUser = {
          id: profile.uid,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          ngo_id: profile.ngo_id,
          ngo_name: profile.ngo_name,
          avatar: profile.avatar
        };

        get().setAuthSession(appUser, profile.role);
        return { success: true, message: 'Registration successful' };
      } catch (error: any) {
        set({ isLoading: false });
        console.error('[AuthStore] Firebase Register Error:', error);
        return { success: false, message: error.message || 'Registration failed' };
      }
    }

    // Mock Registration
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser: AppUser = {
      id: `mock_${Date.now()}`,
      name,
      email,
      phone,
      role: role || 'CITIZEN'
    };
    
    get().setAuthSession(newUser, newUser.role);
    return { success: true, message: 'Mock Registration successful' };
  },

  sendOtp: async (phone, recaptchaVerifier) => {
    if (IS_PROD) {
      try {
        const confirmation = await firebaseAuthService.sendPhoneOtp(phone, recaptchaVerifier);
        return { success: true, message: 'OTP sent', confirmation };
      } catch (error: any) {
        return { success: false, message: error.message || 'Failed to send OTP' };
      }
    }
    // Mock
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Mock OTP sent (Any 6 digits will work)' };
  },

  verifyOtp: async (confirmation, otp, role) => {
    set({ isLoading: true });
    if (IS_PROD) {
      try {
        const { profile } = await firebaseAuthService.verifyOtp(confirmation, otp);
        const appUser: AppUser = {
          id: profile.uid,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          ngo_id: profile.ngo_id,
          ngo_name: profile.ngo_name,
          avatar: profile.avatar
        };
        get().setAuthSession(appUser, profile.role);
        return { success: true, message: 'OTP verified' };
      } catch (error: any) {
        set({ isLoading: false });
        return { success: false, message: error.message || 'Invalid OTP' };
      }
    }
    
    // Mock Verify
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockUser = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
    get().setAuthSession({ ...mockUser, id: mockUser.id } as AppUser, role || 'CITIZEN');
    return { success: true, message: 'Mock OTP verified' };
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      if (IS_PROD) {
        await firebaseAuthService.signOut();
      }
    } catch (e) {
      console.warn('Firebase signout failed', e);
    }
    
    useEventStore.getState().resetStore();
    set({ role: null, user: null, isLoading: false });
  },

  completeOnboarding: () => set({ hasOnboarded: true }),

  initAuth: () => {
    console.log('[AuthStore] Initializing Firebase Auth listener...');
    
    return firebaseAuthService.onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        console.log(`[AuthStore] Session detected for: ${firebaseUser.email}`);
        try {
          const profile = await firebaseAuthService.getUserProfile(firebaseUser.uid);
          if (profile) {
            const appUser: AppUser = {
              id: profile.uid,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              role: profile.role,
              ngo_id: profile.ngo_id,
              ngo_name: profile.ngo_name,
              avatar: profile.avatar
            };
            get().setAuthSession(appUser, profile.role);
          } else {
            console.warn('[AuthStore] Logged in but no Firestore profile found.');
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('[AuthStore] Failed to fetch session profile:', error);
          set({ isLoading: false });
        }
      } else {
        console.log('[AuthStore] No active session.');
        set({ user: null, role: null, isLoading: false });
      }
    });
  }
}));
