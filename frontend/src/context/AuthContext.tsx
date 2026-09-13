import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { auth } from "../config/firebase";
import { 
  AuthSession, 
  UserRole,
  getStoredSession, 
  setStoredSession, 
  clearStoredSession,
  firebaseLoginWithEmail,
  firebaseRegisterWithEmail,
  firebaseLoginWithGoogle,
  firebaseSendPhoneOTP,
  firebaseVerifyPhoneOTP,
  firebaseResetPassword,
  firebaseLogout
} from "../services/firebaseAuth";

export interface AuthContextType {
  currentUser: User | null;
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  loginWithEmail: (email: string, pass: string, role: UserRole) => Promise<AuthSession>;
  registerWithEmail: (email: string, pass: string, name: string, role: UserRole) => Promise<AuthSession>;
  loginWithGoogle: (role: UserRole) => Promise<AuthSession>;
  sendPhoneOTP: (phone: string, verifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyPhoneOTP: (confirmResult: ConfirmationResult, code: string, role: UserRole, name?: string) => Promise<AuthSession>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen to Firebase auth state transitions
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const existingSession = getStoredSession();
          const updatedSession: AuthSession = {
            authenticated: true,
            email: firebaseUser.email || existingSession?.email || "user@aegisnet.org",
            name: firebaseUser.displayName || existingSession?.name || "AegisNet User",
            role: existingSession?.role || "patient",
            token: token,
            uid: firebaseUser.uid,
            phone: firebaseUser.phoneNumber || existingSession?.phone || undefined,
            photoURL: firebaseUser.photoURL || undefined
          };
          setStoredSession(updatedSession);
          setSession(updatedSession);
        } catch {
          // Token retrieval failed, fallback to stored session
          setSession(getStoredSession());
        }
      } else {
        // If there's no Firebase user, check if we have a demo session or clear
        const existingSession = getStoredSession();
        if (existingSession && existingSession.token.startsWith("firebase-demo-token")) {
          setSession(existingSession);
        } else {
          setSession(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string, role: UserRole) => {
    const s = await firebaseLoginWithEmail(email, pass, role);
    setSession(s);
    return s;
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: UserRole) => {
    const s = await firebaseRegisterWithEmail(email, pass, name, role);
    setSession(s);
    return s;
  };

  const loginWithGoogle = async (role: UserRole) => {
    const s = await firebaseLoginWithGoogle(role);
    setSession(s);
    return s;
  };

  const sendPhoneOTP = async (phone: string, verifier: RecaptchaVerifier) => {
    return await firebaseSendPhoneOTP(phone, verifier);
  };

  const verifyPhoneOTP = async (confirmResult: ConfirmationResult, code: string, role: UserRole, name?: string) => {
    const s = await firebaseVerifyPhoneOTP(confirmResult, code, role, name);
    setSession(s);
    return s;
  };

  const resetPassword = async (email: string) => {
    await firebaseResetPassword(email);
  };

  const logout = async () => {
    await firebaseLogout();
    setSession(null);
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    session,
    loading,
    isAuthenticated: Boolean(session?.authenticated),
    userRole: session?.role || null,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    sendPhoneOTP,
    verifyPhoneOTP,
    resetPassword,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
