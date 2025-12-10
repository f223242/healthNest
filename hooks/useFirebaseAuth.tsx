import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  updatePassword as firebaseUpdatePassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where
} from "firebase/firestore";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { useToast } from "@/component/Toast/ToastProvider";
import { auth, db } from "@/config/firebase";
import { firebaseMessages } from "@/constant/messages";

// -------------------------------
// User Type
// -------------------------------
export interface UserProfile {
  uid: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
  role: string;
  createdAt: number;
  profileCompleted?: boolean;
  additionalInfo?: AdditionalInfo;
  dateOfBirth?: string;
  emailVerified?: boolean;
}

// Additional role-specific info (lightweight definitions used across the app)
export interface PatientInfo {
  address: string;
  city: string;
  emergencyContact: string;
  bloodGroup: string;
  profileImage?: string | null;
  coordinates?: { latitude: number; longitude: number } | null;
}

export interface NurseInfo {
  specialization: string;
  experience: string;
  hourlyRate: string;
  availability: string;
  address: string;
  city: string;
  certifications: string;
  profileImage?: string | null;
  coordinates?: { latitude: number; longitude: number } | null;
}

export interface LabInfo {
  labName: string;
  address: string;
  city: string;
  licenseNumber: string;
  homeSampling: boolean;
  operatingHours: string;
  servicesOffered: string;
  profileImage?: string | null;
  coordinates?: { latitude: number; longitude: number } | null;
}

export interface DeliveryInfo {
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  address: string;
  city: string;
  availability: string;
  profileImage?: string | null;
  coordinates?: { latitude: number; longitude: number } | null;
}

export interface AdminInfo {
  profileImage?: string | null;
  address?: string;
  city?: string;
}

export type AdditionalInfo = PatientInfo | NurseInfo | LabInfo | DeliveryInfo | AdminInfo;

// Backwards-compatible exports expected elsewhere in the app
export type User = UserProfile;

// -------------------------------
// Auth Context Types
// -------------------------------
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;

  signup: (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => Promise<any>;

  login: (values: { email: string; password: string }) => Promise<any>;

  logout: () => Promise<void>;

  resetPassword: (email: string) => Promise<void>;

  getUserProfile: () => Promise<UserProfile | null>;

  getAllUsers: (filter?: string) => Promise<UserProfile[]>;
  findUserByPhone: (phone: string) => Promise<any>;

  // Save role-specific additional information and mark profileCompleted
  saveAdditionalInfo: (info: AdditionalInfo) => Promise<void>;

  // Update basic profile fields (firstname, lastname, phoneNumber)
  updateProfile: (data: { firstname?: string; lastname?: string; phoneNumber?: string }) => Promise<void>;
  
  // Backwards-compatible API used across the app
  register: (values: any) => Promise<any>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  sendPasswordResetOTP: (phoneNumber: string) => Promise<string>;
  verifyPasswordResetOTP: (otp: string) => Promise<boolean>;
  resendPasswordResetOTP: () => Promise<string>;
  updatePassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const PENDING_USER_KEY = "@healthnest_pending_user";
const OTP_KEY = "@healthnest_otp";
const VERIFICATION_COMPLETE_KEY = "@healthnest_verification_complete";

// -------------------------------
// Provider
// -------------------------------

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();
  const skipAuthHandlingRef = useRef(false);

  // ---------------------------------------------------
  // GET USER PROFILE
  // ---------------------------------------------------
  const getUserProfile = async () => {
    try {
      if (!auth.currentUser) return null;

      const ref = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) return null;

      return {
        uid: auth.currentUser.uid,
        ...snap.data(),
      } as UserProfile;
    } catch (e) {
      return null;
    }
  };

  // ---------------------------------------------------
  // AUTH LISTENER
  // ---------------------------------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (current) => {
      // If we're performing a temporary sign-in (e.g. to check verification), skip handling
      if (skipAuthHandlingRef.current) return;

      if (current) {
        const profile = await getUserProfile();
        setUser(profile);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  // ---------------------------------------------------
  // SIGNUP
  // ---------------------------------------------------
  const signup = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => {
    try {
      setLoading(true);

      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      // Send email verification
      await sendEmailVerification(res.user);

      const userData: UserProfile = {
        uid,
        email,
        firstname: fullName || undefined,
        lastname: "",
        phoneNumber: phone || undefined,
        role: "user",
        createdAt: Date.now(),
      };

      // Save user profile
      await setDoc(doc(db, "users", uid), userData);

      // Save phone → uid mapping (matches your rules)
      await setDoc(doc(db, "publicPhoneIndex", phone.replace(/\D/g, "")), {
        uid,
        email,
      });

      const profile = await getUserProfile();
      setUser(profile);

      toast.show(firebaseMessages.registerSuccess as any);

      return { success: true, user: profile };
    } catch (err: any) {
      const msg =
        (firebaseMessages.errors as any)[err.code as string] ||
        firebaseMessages.errors["auth/internal-error"];

      toast.show(msg as any);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // REGISTER (used by sign-up screen) - stores pending user and sends verification
  // ---------------------------------------------------
  const register = async (values: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    role: string;
    dateOfBirth: string;
    phoneNumber: string;
  }) => {
    // Normalize display role to internal role value
    const mapRoleToInternal = (r: string) => {
      const lookup: { [k: string]: string } = {
        User: "user",
        user: "user",
        Lab: "lab",
        lab: "lab",
        Nurse: "nurse",
        nurse: "nurse",
        "Medicine Delivery": "delivery",
        "Medicine delivery": "delivery",
        Delivery: "delivery",
        delivery: "delivery",
      };
      return lookup[r] || r.toLowerCase();
    };
    try {
      setLoading(true);
      // Check if email already exists is skipped for brevity
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);

      // Send verification email
      await sendEmailVerification(userCredential.user);

      // Save to pendingUsers collection
      await setDoc(doc(db, "pendingUsers", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: values.email,
        firstname: values.firstname,
        lastname: values.lastname,
        role: mapRoleToInternal(values.role),
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth,
        createdAt: new Date().toISOString(),
        verified: false,
      });

      // Sign out so user must verify email
      await signOut(auth);

      // Store pending locally for verification screen
      await AsyncStorage.setItem(PENDING_USER_KEY, JSON.stringify({
        email: values.email,
        password: values.password,
        uid: userCredential.user.uid,
        role: values.role,
        firstname: values.firstname,
        lastname: values.lastname,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth,
      }));

      toast.show(firebaseMessages.registerSuccess as any);

      return { requiresVerification: true };
    } catch (err: any) {
      const msg = (firebaseMessages.errors as any)[err.code as string] || firebaseMessages.errors["auth/internal-error"];
      toast.show(msg as any);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // LOGIN
  // ---------------------------------------------------
  const login = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, values.email, values.password);

      const profile = await getUserProfile();
      setUser(profile);

      // Toast displayed by callers (UI) to avoid duplicate messages

      return { success: true, user: profile };
    } catch (err: any) {
      const msg =
        (firebaseMessages.errors as any)[err.code as string] ||
        firebaseMessages.errors["auth/internal-error"];

      toast.show(msg as any);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------
  const logout = async () => {
    await signOut(auth);
    // Don't show toast here — let callers display a toast to avoid duplicates
    setUser(null);
  };

  // ---------------------------------------------------
  // PASSWORD RESET (email based)
  // ---------------------------------------------------
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.show(firebaseMessages.passwordResetSuccess as any);
    } catch (err: any) {
      const msg =
        (firebaseMessages.errors as any)[err.code as string] ||
        firebaseMessages.errors["auth/internal-error"];
      toast.show(msg as any);
    }
  };

  // ---------------------------------------------------
  // GET ALL USERS WITH OPTIONAL ROLE FILTER
  // ---------------------------------------------------
  const getAllUsers = async (filter?: string) => {
    try {
      const usersRef = collection(db, "users");

      let q;

      if (filter) {
        q = query(usersRef, where("role", "==", filter));
      } else {
        q = query(usersRef);
      }

      const snap = await getDocs(q);

      return snap.docs.map(
        (d) =>
          ({
            uid: d.id,
            ...d.data(),
          } as UserProfile)
      );
    } catch {
      return [];
    }
  };

  // ---------------------------------------------------
  // Save additional info (role-specific) and mark profile completed
  // ---------------------------------------------------
  const saveAdditionalInfo = async (info: AdditionalInfo): Promise<void> => {
    try {
      if (!auth.currentUser) throw new Error("Not authenticated");
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, {
        additionalInfo: info,
        profileCompleted: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Update local state
      setUser((prev) => prev ? { ...prev, additionalInfo: info, profileCompleted: true } : prev);
    } catch (e) {
      console.error("saveAdditionalInfo error:", e);
      throw e;
    }
  };

  // ---------------------------------------------------
  // Update basic profile fields and maintain publicPhoneIndex
  // ---------------------------------------------------
  const updateProfile = async (data: { firstname?: string; lastname?: string; phoneNumber?: string }): Promise<void> => {
    try {
      if (!auth.currentUser) throw new Error("Not authenticated");
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });

      // If phone changed, update publicPhoneIndex
      if (data.phoneNumber) {
        const newDigits = data.phoneNumber.replace(/\D+/g, "");
        try {
          await setDoc(doc(db, "publicPhoneIndex", newDigits), { uid, email: auth.currentUser?.email || null });
        } catch (e) {
          console.warn("Failed to set publicPhoneIndex:", e);
        }
      }

      // Update local state
      setUser((prev) => prev ? { ...prev, firstname: data.firstname || prev.firstname, lastname: data.lastname || prev.lastname, phoneNumber: data.phoneNumber || prev.phoneNumber } : prev);
    } catch (e) {
      console.error("updateProfile error:", e);
      throw e;
    }
  };

  // ---------------------------------------------------
  // FIND USER BY PHONE (for OTP flow)
  // ---------------------------------------------------
  const findUserByPhone = async (phone: string) => {
    try {
      const normalized = phone.replace(/\D/g, "");
      const ref = doc(db, "publicPhoneIndex", normalized);
      const snap = await getDoc(ref);

      if (!snap.exists()) return null;

      return snap.data();
    } catch {
      return null;
    }
  };

  // ---------------------------------------------------
  // RETURN PROVIDER
  // ---------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        resetPassword,
        getUserProfile,
        getAllUsers,
        findUserByPhone,
        saveAdditionalInfo,
        updateProfile,
        // Backwards-compatible API
        register,
        resendVerificationEmail: async () => {
          // resend verification: try to send to current user or pending user
          try {
            if (auth.currentUser) {
              await sendEmailVerification(auth.currentUser);
              return;
            }
            const pendingStr = await AsyncStorage.getItem(PENDING_USER_KEY);
            if (pendingStr) {
              const pending = JSON.parse(pendingStr);
              const userCredential = await signInWithEmailAndPassword(auth, pending.email, pending.password);
              await sendEmailVerification(userCredential.user);
              await signOut(auth);
              return;
            }
          } catch (e) {
            console.warn("resendVerificationEmail error:", e);
            throw e;
          }
        },
        checkEmailVerification: async (): Promise<boolean> => {
          let userCredential: any = null;
          try {
            const pendingUserStr = await AsyncStorage.getItem(PENDING_USER_KEY);
            if (!pendingUserStr) return false;
            const pendingUser = JSON.parse(pendingUserStr);

            // Temporarily sign in to check verification; set skip flag so listener ignores this transient sign-in
            skipAuthHandlingRef.current = true;
            try {
              userCredential = await signInWithEmailAndPassword(auth, pendingUser.email, pendingUser.password);
              await userCredential.user.reload();
              const isVerified = userCredential.user.emailVerified;

              if (isVerified) {
                // Move to users collection
                  // Ensure role is normalized when moving to users collection
                  const normalizedRole = ((): string => {
                    const r = pendingUser.role || "user";
                    const map: { [k: string]: string } = {
                      User: "user",
                      user: "user",
                      Lab: "lab",
                      lab: "lab",
                      Nurse: "nurse",
                      nurse: "nurse",
                      "Medicine Delivery": "delivery",
                      "Medicine delivery": "delivery",
                      Delivery: "delivery",
                      delivery: "delivery",
                    };
                    return map[r] || (typeof r === "string" ? r.toLowerCase() : "user");
                  })();

                  await setDoc(doc(db, "users", userCredential.user.uid), {
                    uid: userCredential.user.uid,
                    email: pendingUser.email,
                    firstname: pendingUser.firstname,
                    lastname: pendingUser.lastname,
                    role: normalizedRole,
                    phoneNumber: pendingUser.phoneNumber,
                    dateOfBirth: pendingUser.dateOfBirth,
                    emailVerified: true,
                    profileCompleted: false,
                    createdAt: new Date().toISOString(),
                  });

                // Delete pending user doc
                await deleteDoc(doc(db, "pendingUsers", userCredential.user.uid));

                // Create publicPhoneIndex entry
                const digitsOnly = (pendingUser.phoneNumber || "").replace(/\D+/g, "");
                if (digitsOnly) {
                  await setDoc(doc(db, "publicPhoneIndex", digitsOnly), { uid: userCredential.user.uid, email: pendingUser.email });
                }

                // Mark verification complete and remove pending flag
                await AsyncStorage.setItem(VERIFICATION_COMPLETE_KEY, "true");
                await AsyncStorage.removeItem(PENDING_USER_KEY);

                // Navigate to login screen
                try {
                  router.replace("/(auth)");
                } catch (navErr) {
                  console.warn("Router navigation failed after verification:", navErr);
                }

                return true;
              }

              return false;
            } finally {
              // Always sign out the temporary session and resume normal auth handling
              try { if (userCredential) await signOut(auth); } catch (e) { /* ignore */ }
              skipAuthHandlingRef.current = false;
            }
          } catch (e) {
            console.error("checkEmailVerification error:", e);
            try { if (userCredential) await signOut(auth); } catch (_) {}
            skipAuthHandlingRef.current = false;
            return false;
          }
        },
        sendPasswordResetOTP: async (phoneNumber: string): Promise<string> => {
          try {
            // Resolve via publicPhoneIndex
            const normalized = phoneNumber.replace(/\D+/g, "");
            const idx = await getDoc(doc(db, "publicPhoneIndex", normalized));
            if (!idx.exists()) {
              const err: any = new Error("No account found");
              err.code = "not-found";
              throw err;
            }
            const data: any = idx.data();
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await setDoc(doc(db, "passwordResetOTPs", normalized), { phoneNumber, uid: data.uid, email: data.email || null, otp, verified: false, createdAt: new Date().toISOString() });
            await AsyncStorage.setItem(OTP_KEY, otp);
            await AsyncStorage.setItem(PENDING_USER_KEY, JSON.stringify({ phoneNumber, isPasswordReset: true, uid: data.uid, email: data.email || null, createdAt: new Date().toISOString() }));
            console.log("Password reset OTP:", otp);
            return otp;
          } catch (e) {
            console.error("sendPasswordResetOTP error:", e);
            throw e;
          }
        },
        verifyPasswordResetOTP: async (enteredOTP: string): Promise<boolean> => {
          const stored = await AsyncStorage.getItem(OTP_KEY);
          if (enteredOTP === stored) return true;
          const err: any = new Error("Invalid OTP"); err.code = "invalid-otp"; throw err;
        },
        resendPasswordResetOTP: async (): Promise<string> => {
          const pendingStr = await AsyncStorage.getItem(PENDING_USER_KEY);
          if (!pendingStr) { throw new Error("No pending reset"); }
          const pending = JSON.parse(pendingStr);
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          await AsyncStorage.setItem(OTP_KEY, otp);
          console.log("Resent OTP:", otp);
          return otp;
        },
        updatePassword: async (email: string): Promise<void> => {
          await sendPasswordResetEmail(auth, email);
          await AsyncStorage.removeItem(OTP_KEY);
          await AsyncStorage.removeItem(PENDING_USER_KEY);
        },
        changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
          if (!auth.currentUser || !auth.currentUser.email) throw new Error("Not authenticated");
          const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
          await reauthenticateWithCredential(auth.currentUser, credential);
          await firebaseUpdatePassword(auth.currentUser, newPassword);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// -------------------------------
// useFirebaseAuth Hook
// -------------------------------
export const useFirebaseAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useFirebaseAuth must be used inside AuthProvider");
  return ctx;
};

// Alias for compatibility with existing imports
export const useAuthContext = useFirebaseAuth;
