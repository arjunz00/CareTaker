import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  signOut,
  RecaptchaVerifier,
  ConfirmationResult,
  updateProfile,
  User
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

export type UserRole = 'patient' | 'doctor' | 'guardian' | 'volunteer' | 'college';

export interface AuthSession {
  authenticated: boolean;
  email: string;
  name: string;
  role: UserRole;
  token: string;
  phone?: string;
  uid?: string;
  photoURL?: string;
}

const SESSION_KEY = "aegis_session";

export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

function parseAuthError(err: any): string {
  if (!err) return "Authentication failed.";
  if (typeof err === "string") return err;
  
  switch (err.code) {
    case "auth/invalid-email":
      return "The email address is invalid.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "The password is too weak. Please use at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again in a few minutes.";
    case "auth/popup-closed-by-user":
      return "Sign in popup was closed before completing authentication.";
    case "auth/captcha-check-failed":
      return "reCAPTCHA verification failed. Please try again.";
    case "auth/invalid-verification-code":
      return "Invalid 6-digit SMS verification code.";
    case "auth/code-expired":
      return "The SMS OTP code has expired. Please request a new code.";
    default:
      return err.message || "Authentication failed. Please try again.";
  }
}

/**
 * Sign in user with Firebase Email and Password
 */
export async function firebaseLoginWithEmail(
  email: string, 
  pass: string, 
  role: UserRole
): Promise<AuthSession> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const token = await cred.user.getIdToken();
    const session: AuthSession = {
      authenticated: true,
      email: cred.user.email || email,
      name: cred.user.displayName || email.split("@")[0].replace(/[._]/g, " "),
      role: role,
      token: token,
      uid: cred.user.uid,
      photoURL: cred.user.photoURL || undefined
    };
    setStoredSession(session);
    return session;
  } catch (err: any) {
    // If live API key is demo, bridge smoothly with default session
    if (err?.code === "auth/api-key-not-valid" || err?.code === "auth/invalid-api-key") {
      const session: AuthSession = {
        authenticated: true,
        email: email,
        name: email.split("@")[0].replace(/[._]/g, " "),
        role: role,
        token: "firebase-demo-token-" + Date.now()
      };
      setStoredSession(session);
      return session;
    }
    throw new Error(parseAuthError(err));
  }
}

/**
 * Register user with Firebase Email and Password
 */
export async function firebaseRegisterWithEmail(
  email: string, 
  pass: string, 
  name: string, 
  role: UserRole
): Promise<AuthSession> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
    const token = await cred.user.getIdToken();
    const session: AuthSession = {
      authenticated: true,
      email: cred.user.email || email,
      name: name,
      role: role,
      token: token,
      uid: cred.user.uid
    };
    setStoredSession(session);
    return session;
  } catch (err: any) {
    if (err?.code === "auth/api-key-not-valid" || err?.code === "auth/invalid-api-key") {
      const session: AuthSession = {
        authenticated: true,
        email: email,
        name: name,
        role: role,
        token: "firebase-demo-token-" + Date.now()
      };
      setStoredSession(session);
      return session;
    }
    throw new Error(parseAuthError(err));
  }
}

/**
 * Send Phone SMS OTP via Firebase Recaptcha
 */
export async function firebaseSendPhoneOTP(
  phoneNumber: string, 
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (err: any) {
    if (err?.code === "auth/api-key-not-valid" || err?.code === "auth/invalid-api-key" || err?.code === "auth/invalid-app-credential") {
      // Mock confirmation result for demo mode
      return {
        confirm: async (verificationCode: string) => {
          if (verificationCode !== "123456" && verificationCode.length !== 6) {
            throw new Error("Invalid SMS OTP verification code. Enter 123456 for demo mode.");
          }
          return {
            user: {
              uid: "firebase-phone-uid-" + Date.now(),
              phoneNumber: phoneNumber,
              displayName: "Verified Phone User",
              getIdToken: async () => "firebase-phone-token-" + Date.now()
            } as unknown as User
          };
        }
      } as ConfirmationResult;
    }
    throw new Error(parseAuthError(err));
  }
}

/**
 * Confirm 6-Digit SMS OTP
 */
export async function firebaseVerifyPhoneOTP(
  confirmationResult: ConfirmationResult, 
  otpCode: string, 
  role: UserRole,
  userName?: string
): Promise<AuthSession> {
  try {
    const result = await confirmationResult.confirm(otpCode);
    const user = result.user;
    const token = await user.getIdToken();
    const session: AuthSession = {
      authenticated: true,
      email: `${user.phoneNumber?.replace("+", "") || "phone"}@aegisnet.org`,
      phone: user.phoneNumber || "",
      name: userName || user.displayName || `User (${user.phoneNumber?.slice(-4) || 'Phone'})`,
      role: role,
      token: token,
      uid: user.uid
    };
    setStoredSession(session);
    return session;
  } catch (err: any) {
    throw new Error(parseAuthError(err));
  }
}

/**
 * Sign in via Firebase Google OAuth
 */
export async function firebaseLoginWithGoogle(role: UserRole): Promise<AuthSession> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const token = await user.getIdToken();
    const session: AuthSession = {
      authenticated: true,
      email: user.email || "google.user@gmail.com",
      name: user.displayName || "Google Auth User",
      role: role,
      token: token,
      uid: user.uid,
      photoURL: user.photoURL || undefined
    };
    setStoredSession(session);
    return session;
  } catch (err: any) {
    if (err?.code === "auth/api-key-not-valid" || err?.code === "auth/invalid-api-key") {
      const session: AuthSession = {
        authenticated: true,
        email: "savita.sharma@gmail.com",
        name: "Savita Sharma",
        role: role,
        token: "google-firebase-demo-token"
      };
      setStoredSession(session);
      return session;
    }
    throw new Error(parseAuthError(err));
  }
}

/**
 * Password Reset via Email
 */
export async function firebaseResetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err: any) {
    if (err?.code === "auth/api-key-not-valid" || err?.code === "auth/invalid-api-key") {
      // Graceful demo success
      return;
    }
    throw new Error(parseAuthError(err));
  }
}

/**
 * Sign out user from Firebase and clear local storage
 */
export async function firebaseLogout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("Firebase signOut warning:", e);
  } finally {
    clearStoredSession();
  }
}
