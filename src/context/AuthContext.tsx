'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  getIdTokenResult
} from 'firebase/auth';
import { auth, googleProvider, firestore } from '../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { UserProfile, UserPlan, PLAN_CONFIGS, normalizePlan } from '../lib/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  consumeTokens: (tokens: number) => Promise<boolean>;
  upgradePlan: (plan: UserPlan) => Promise<void>;
  hasTokensLeft: boolean;
  remainingTokens: number;
  remainingDailyTokens: number;
  refreshUserProfile: () => Promise<void>;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const DEFAULT_GUEST_PROFILE: UserProfile = {
  uid: 'guest_user',
  email: null,
  displayName: 'زائر TOLZY',
  photoURL: null,
  plan: 'free',
  tokensUsed: 0,
  tokensLimit: PLAN_CONFIGS.free.tokenLimit,
  dailyTokensUsed: 0,
  dailyTokensLimit: PLAN_CONFIGS.free.dailyTokenLimit,
  lastActiveDate: getTodayString(),
  createdAt: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_GUEST_PROFILE);
  const [loading, setLoading] = useState<boolean>(true);

  // Setup Firestore real-time listener for the user's plan & token data
  const setupFirestoreListener = (firebaseUser: User): Unsubscribe => {
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const today = getTodayString();

    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnap) => {
        let rawPlanValue: any = null;
        let data: any = {};

        if (docSnap.exists()) {
          data = docSnap.data();
          rawPlanValue =
            data.plan ||
            data.subscription ||
            data.subscriptionPlan ||
            data.tier ||
            data.package ||
            data.role ||
            data.membership ||
            data.currentPlan ||
            (data.subscription && (data.subscription.plan || data.subscription.tier || data.subscription.name));
        } else {
          // Fallback query by email if doc doesn't exist by UID
          try {
            if (firebaseUser.email) {
              const q = query(collection(firestore, 'users'), where('email', '==', firebaseUser.email));
              const querySnap = await getDocs(q);
              if (!querySnap.empty) {
                data = querySnap.docs[0].data();
                rawPlanValue = data.plan || data.subscription || data.tier || data.package;
              }
            }
          } catch (e) {
            console.warn('Fallback query notice:', e);
          }

          // Check custom claims
          try {
            const tokenResult = await getIdTokenResult(firebaseUser, false);
            if (tokenResult.claims.plan) {
              rawPlanValue = tokenResult.claims.plan;
            } else if (tokenResult.claims.subscription) {
              rawPlanValue = tokenResult.claims.subscription;
            }
          } catch (e) {}

          // Initialize user document in Firestore if new
          try {
            const detectedPlan = normalizePlan(rawPlanValue || 'free');
            const initialDoc = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'مستخدم TOLZY',
              photoURL: firebaseUser.photoURL || null,
              plan: detectedPlan,
              tokensUsed: 0,
              tokensLimit: PLAN_CONFIGS[detectedPlan].tokenLimit,
              dailyTokensUsed: 0,
              dailyTokensLimit: PLAN_CONFIGS[detectedPlan].dailyTokenLimit,
              lastActiveDate: today,
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, initialDoc, { merge: true });
          } catch (e) {
            console.warn('Initial setDoc notice:', e);
          }
        }

        const detectedPlan = normalizePlan(rawPlanValue || 'free');
        const planConfig = PLAN_CONFIGS[detectedPlan];
        const tokensLimit = data.tokensLimit || planConfig.tokenLimit;
        const dailyTokensLimit = data.dailyTokensLimit || planConfig.dailyTokenLimit;
        const tokensUsed = typeof data.tokensUsed === 'number' ? data.tokensUsed : 0;

        // Daily reset logic: if lastActiveDate is not today, dailyTokensUsed resets to 0
        const isNewDay = data.lastActiveDate !== today;
        let dailyTokensUsed = isNewDay ? 0 : (typeof data.dailyTokensUsed === 'number' ? data.dailyTokensUsed : 0);

        if (isNewDay && docSnap.exists()) {
          try {
            await setDoc(userDocRef, { dailyTokensUsed: 0, lastActiveDate: today }, { merge: true });
          } catch (e) {}
        }

        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || data.displayName || data.name || 'مستخدم TOLZY',
          photoURL: firebaseUser.photoURL || data.photoURL || data.avatar || null,
          plan: detectedPlan,
          tokensUsed: tokensUsed,
          tokensLimit: tokensLimit,
          dailyTokensUsed: dailyTokensUsed,
          dailyTokensLimit: dailyTokensLimit,
          lastActiveDate: today,
          createdAt: data.createdAt || new Date().toISOString()
        };

        setUserProfile(profile);
      },
      (error) => {
        console.warn('Firestore user listener error:', error);
        setUserProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'مستخدم TOLZY',
          photoURL: firebaseUser.photoURL || null,
          plan: 'free',
          tokensUsed: 0,
          tokensLimit: PLAN_CONFIGS.free.tokenLimit,
          dailyTokensUsed: 0,
          dailyTokensLimit: PLAN_CONFIGS.free.dailyTokenLimit,
          lastActiveDate: today,
          createdAt: new Date().toISOString()
        });
      }
    );

    return unsubscribe;
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const rawPlanValue = data.plan || data.subscription || data.tier;
        const detectedPlan = normalizePlan(rawPlanValue || 'free');
        const planConfig = PLAN_CONFIGS[detectedPlan];
        const today = getTodayString();
        const isNewDay = data.lastActiveDate !== today;

        setUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || data.displayName || 'مستخدم TOLZY',
          photoURL: user.photoURL || data.photoURL || null,
          plan: detectedPlan,
          tokensUsed: typeof data.tokensUsed === 'number' ? data.tokensUsed : 0,
          tokensLimit: data.tokensLimit || planConfig.tokenLimit,
          dailyTokensUsed: isNewDay ? 0 : (typeof data.dailyTokensUsed === 'number' ? data.dailyTokensUsed : 0),
          dailyTokensLimit: data.dailyTokensLimit || planConfig.dailyTokenLimit,
          lastActiveDate: today,
          createdAt: data.createdAt || new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Refresh profile error:', e);
    }
  };

  useEffect(() => {
    let firestoreUnsubscribe: Unsubscribe | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        firestoreUnsubscribe = setupFirestoreListener(firebaseUser);
      } else {
        try {
          const storedGuest = localStorage.getItem('axiom_guest_profile');
          const today = getTodayString();
          if (storedGuest) {
            const parsed = JSON.parse(storedGuest);
            if (parsed.lastActiveDate !== today) {
              parsed.dailyTokensUsed = 0;
              parsed.lastActiveDate = today;
            }
            setUserProfile(parsed);
          } else {
            setUserProfile(DEFAULT_GUEST_PROFILE);
          }
        } catch (e) {
          setUserProfile(DEFAULT_GUEST_PROFILE);
        }
      }
      setLoading(false);
    });

    return () => {
      authUnsubscribe();
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  }, []);

  const updateProfileState = async (updater: (prev: UserProfile) => UserProfile) => {
    setUserProfile((prev) => {
      const next = updater(prev);
      const today = getTodayString();
      if (user) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          setDoc(
            userDocRef,
            {
              plan: next.plan,
              tokensUsed: next.tokensUsed,
              tokensLimit: next.tokensLimit,
              dailyTokensUsed: next.dailyTokensUsed || 0,
              dailyTokensLimit: next.dailyTokensLimit || PLAN_CONFIGS[next.plan].dailyTokenLimit,
              lastActiveDate: today
            },
            { merge: true }
          ).catch(console.warn);
        } catch (e) {}
      } else {
        try {
          localStorage.setItem('axiom_guest_profile', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  // Auth Methods
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      setupFirestoreListener(result.user);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      setupFirestoreListener(result.user);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await updateProfile(result.user, { displayName: name });
      const today = getTodayString();
      const userDocRef = doc(firestore, 'users', result.user.uid);
      await setDoc(
        userDocRef,
        {
          uid: result.user.uid,
          email: result.user.email,
          displayName: name,
          plan: 'free',
          tokensUsed: 0,
          tokensLimit: PLAN_CONFIGS.free.tokenLimit,
          dailyTokensUsed: 0,
          dailyTokensLimit: PLAN_CONFIGS.free.dailyTokenLimit,
          lastActiveDate: today,
          createdAt: new Date().toISOString()
        },
        { merge: true }
      );
      setupFirestoreListener(result.user);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(DEFAULT_GUEST_PROFILE);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const consumeTokens = async (tokens: number): Promise<boolean> => {
    let allowed = true;
    const today = getTodayString();

    await updateProfileState((prev) => {
      const isNewDay = prev.lastActiveDate !== today;
      const currentDaily = isNewDay ? 0 : (prev.dailyTokensUsed || 0);
      const currentMonthly = prev.tokensUsed || 0;

      const dailyLimit = prev.dailyTokensLimit || PLAN_CONFIGS[prev.plan].dailyTokenLimit;
      const monthlyLimit = prev.tokensLimit || PLAN_CONFIGS[prev.plan].tokenLimit;

      const newDaily = currentDaily + tokens;
      const newMonthly = currentMonthly + tokens;

      if (newDaily > dailyLimit || newMonthly > monthlyLimit) {
        allowed = false;
      }

      return {
        ...prev,
        tokensUsed: Math.min(newMonthly, monthlyLimit),
        dailyTokensUsed: Math.min(newDaily, dailyLimit),
        lastActiveDate: today
      };
    });

    return allowed;
  };

  const upgradePlan = async (newPlan: UserPlan) => {
    const config = PLAN_CONFIGS[newPlan];
    await updateProfileState((prev) => ({
      ...prev,
      plan: newPlan,
      tokensLimit: config.tokenLimit,
      dailyTokensLimit: config.dailyTokenLimit
    }));
  };

  const dailyLimit = userProfile.dailyTokensLimit || PLAN_CONFIGS[userProfile.plan].dailyTokenLimit;
  const monthlyLimit = userProfile.tokensLimit || PLAN_CONFIGS[userProfile.plan].tokenLimit;

  const remainingTokens = Math.max(0, monthlyLimit - (userProfile.tokensUsed || 0));
  const remainingDailyTokens = Math.max(0, dailyLimit - (userProfile.dailyTokensUsed || 0));
  const hasTokensLeft = remainingTokens > 0 && remainingDailyTokens > 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        resetPassword,
        consumeTokens,
        upgradePlan,
        hasTokensLeft,
        remainingTokens,
        remainingDailyTokens,
        refreshUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
