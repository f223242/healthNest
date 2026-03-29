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
    where,
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
  deliveryType?: "medicine" | "lab";
  qualification?: string;
  createdAt: number;
  profileCompleted?: boolean;
  additionalInfo?: AdditionalInfo;
  dateOfBirth?: string;
  emailVerified?: boolean;
  isApproved?: boolean;
  educationSubmitted?: boolean;
  verificationStatus?: string;
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

export type AdditionalInfo =
  | PatientInfo
  | NurseInfo
  | LabInfo
  | DeliveryInfo
  | AdminInfo;

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
    phone: string,
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
  updateProfile: (data: {
    firstname?: string;
    lastname?: string;
    phoneNumber?: string;
  }) => Promise<void>;

  // Backwards-compatible API used across the app
  register: (values: any) => Promise<any>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  sendPasswordResetOTP: (phoneNumber: string) => Promise<string>;
  verifyPasswordResetOTP: (otp: string) => Promise<boolean>;
  resendPasswordResetOTP: () => Promise<string>;
  updatePassword: (email: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;

  // Submit education details for Lab Delivery Boys
  submitEducationDetails: (values: {
    uid?: string;
    matricType: string;
    certificateUrl: string;
    certificateName: string;
  }) => Promise<{ success: boolean }>;

  isLoading?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const PENDING_USER_KEY = "@healthnest_pending_user";
const OTP_KEY = "@healthnest_otp";
const VERIFICATION_COMPLETE_KEY = "@healthnest_verification_complete";

// Safe JSON parse helper to avoid uncaught exceptions from malformed strings
const safeJSONParse = (s: string | null) => {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch (e) {
    console.warn("safeJSONParse: failed to parse string:", s, e);
    return null;
  }
};

// Normalize display role names to internal stored values
const normalizeRole = (r?: string) => {
  if (!r) return undefined;
  const map: { [k: string]: string } = {
    User: "user",
    user: "user",
    Lab: "lab",
    lab: "lab",
    Nurse: "nurse",
    nurse: "nurse",
    "Medicine Delivery": "delivery",
    "Medicine delivery": "delivery",
    "Delivery Boy": "delivery",
    "delivery boy": "delivery",
    Delivery: "delivery",
    delivery: "delivery",
    "Lab Delivery Boy": "lab-delivery-boy",
    "Lab delivery boy": "lab-delivery-boy",
    "lab-delivery-boy": "lab-delivery-boy",
    "Lab Delivery": "lab-delivery-boy",
  };
  return map[r] || r.toLowerCase();
};

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
    phone: string,
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
    deliveryType?: "medicine" | "lab";
    qualification?: string;
    dateOfBirth: string;
    phoneNumber: string;
  }) => {
    // Backend validation: ensure correct fields for delivery boy registration
    const isDeliveryRole = [
      "Delivery Boy",
      "delivery boy",
      "Medicine Delivery",
      "medicine delivery",
      "Delivery",
      "delivery",
    ].includes(values.role);
    if (isDeliveryRole) {
      const deliveryType =
        values.deliveryType ??
        (values.role === "Medicine Delivery" ? "medicine" : undefined);
      if (!deliveryType) {
        throw new Error("Delivery type is required for Delivery Boy");
      }
      // Remove qualification validation for lab delivery - will be handled in education screen
      if (deliveryType === "medicine") {
        // Medicine delivery can proceed immediately
      }
    }

    // Normalize display role to internal role value
    const mapRoleToInternal = (r: string, deliveryType?: string) => {
      if (deliveryType === "lab") return "lab-delivery-boy";
      const lookup: { [k: string]: string } = {
        User: "user",
        user: "user",
        Lab: "lab",
        lab: "lab",
        Nurse: "nurse",
        nurse: "nurse",
        "Medicine Delivery": "delivery",
        "Medicine delivery": "delivery",
        "Delivery Boy": "delivery",
        "delivery boy": "delivery",
        Delivery: "delivery",
        delivery: "delivery",
        "Lab Delivery": "lab-delivery-boy",
        "Lab delivery": "lab-delivery-boy",
      };
      return lookup[r] || r.toLowerCase();
    };
    try {
      setLoading(true);
      // Check if email already exists is skipped for brevity
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );

      // Send verification email
      await sendEmailVerification(userCredential.user);

      // Save to pendingUsers collection
      const pendingUserPayload = {
        uid: userCredential.user.uid,
        email: values.email,
        firstname: values.firstname,
        lastname: values.lastname,
        role: mapRoleToInternal(values.role, values.deliveryType),
        deliveryType:
          values.deliveryType ||
          (values.role === "Medicine Delivery" ? "medicine" : undefined),
        qualification: values.qualification,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth,
        createdAt: new Date().toISOString(),
        verified: false,
        verificationStatus:
          values.deliveryType === "lab" ? "pending_education" : "pending",
      };

      const cleanPendingUserPayload = Object.fromEntries(
        Object.entries(pendingUserPayload).filter(([_, v]) => v !== undefined),
      );

      console.log("[register] pendingUserPayload", pendingUserPayload);
      console.log(
        "[register] cleanPendingUserPayload",
        cleanPendingUserPayload,
      );

      await setDoc(
        doc(db, "pendingUsers", userCredential.user.uid),
        cleanPendingUserPayload,
      );

      // Sign out so user must verify email
      await signOut(auth);

      // Store pending locally for verification screen
      const pendingUserStore = {
        email: values.email,
        password: values.password,
        uid: userCredential.user.uid,
        role: values.role,
        deliveryType:
          values.deliveryType ||
          (values.role === "Medicine Delivery" ? "medicine" : undefined),
        qualification: values.qualification,
        firstname: values.firstname,
        lastname: values.lastname,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth,
      };

      const cleanPendingUserStore = Object.fromEntries(
        Object.entries(pendingUserStore).filter(([_, v]) => v !== undefined),
      );

      await AsyncStorage.setItem(
        PENDING_USER_KEY,
        JSON.stringify(cleanPendingUserStore),
      );

      toast.show(firebaseMessages.registerSuccess as any);

      return {
        success: true,
        requiresVerification: true,
        requiresEducation: values.deliveryType === "lab",
      };
    } catch (err: any) {
      const firebaseError = (firebaseMessages.errors as any)[
        err?.code as string
      ];
      const msg = firebaseError || {
        type: "error",
        text1: "Registration Failed",
        text2: err?.message || "Failed to register.",
      };

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
  // SUBMIT EDUCATION DETAILS (for Lab Delivery Boys)
  // ---------------------------------------------------
  const submitEducationDetails = async (values: {
    uid?: string;
    matricType: string;
    certificateUrl: string;
    certificateName: string;
  }) => {
    try {
      const uid = values.uid || auth.currentUser?.uid;
      if (!uid) {
        throw new Error("User not authenticated for education submission");
      }

      // Update user document with education details
      await setDoc(
        doc(db, "users", uid),
        {
          matricType: values.matricType,
          certificateUrl: values.certificateUrl,
          certificateName: values.certificateName,
          educationSubmitted: true,
          verificationStatus: "pending_admin_review",
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      return { success: true };
    } catch (error: any) {
      console.error("Education submission error:", error);
      throw new Error(error.message || "Failed to submit education details");
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
        const normalized = normalizeRole(filter) || filter;

        if (filter === "Medicine Delivery") {
          q = query(
            usersRef,
            where("role", "==", "delivery"),
            where("deliveryType", "==", "medicine"),
          );
        } else if (filter === "Lab Delivery") {
          q = query(
            usersRef,
            where("role", "==", "lab-delivery-boy"),
            where("isApproved", "==", true),
          );
        } else {
          q = query(usersRef, where("role", "==", normalized));
        }
      } else {
        q = query(usersRef);
      }

      const snap = await getDocs(q);

      // If a filter was used but no docs were found, try a fallback:
      // 1) query with the raw filter string
      // 2) if still empty, fetch all and filter client-side using case-insensitive matching
      if (filter && snap.empty) {
        try {
          console.warn(
            "getAllUsers: normalized query returned 0 results for filter:",
            filter,
          );
          // try raw filter
          const rawQ = query(usersRef, where("role", "==", filter));
          const rawSnap = await getDocs(rawQ);
          if (!rawSnap.empty) {
            return rawSnap.docs.map(
              (d) => ({ uid: d.id, ...d.data() }) as UserProfile,
            );
          }

          // final fallback: fetch all and filter client-side
          console.warn(
            "getAllUsers: trying client-side filtering fallback for filter:",
            filter,
          );
          const allSnap = await getDocs(query(usersRef));
          const lc = (filter || "").toLowerCase();
          const filtered = allSnap.docs
            .map((d) => ({ uid: d.id, ...d.data() }) as UserProfile)
            .filter((u) => {
              const role = (u.role || "").toString().toLowerCase();
              return role === lc || role.includes(lc) || lc.includes(role);
            });

          return filtered;
        } catch (e) {
          console.warn("getAllUsers fallback failed:", e);
        }
      }

      return snap.docs.map(
        (d) =>
          ({
            uid: d.id,
            ...d.data(),
          }) as UserProfile,
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
      await setDoc(
        userDocRef,
        {
          additionalInfo: info,
          profileCompleted: true,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      // Update local state
      setUser((prev) =>
        prev ? { ...prev, additionalInfo: info, profileCompleted: true } : prev,
      );
    } catch (e) {
      console.error("saveAdditionalInfo error:", e);
      throw e;
    }
  };

  // ---------------------------------------------------
  // Update basic profile fields and maintain publicPhoneIndex
  // ---------------------------------------------------
  const updateProfile = async (data: {
    firstname?: string;
    lastname?: string;
    phoneNumber?: string;
  }): Promise<void> => {
    try {
      if (!auth.currentUser) throw new Error("Not authenticated");
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, "users", uid);
      await setDoc(
        userDocRef,
        { ...data, updatedAt: new Date().toISOString() },
        { merge: true },
      );

      // If phone changed, update publicPhoneIndex
      if (data.phoneNumber) {
        const newDigits = data.phoneNumber.replace(/\D+/g, "");
        try {
          await setDoc(doc(db, "publicPhoneIndex", newDigits), {
            uid,
            email: auth.currentUser?.email || null,
          });
        } catch (e) {
          console.warn("Failed to set publicPhoneIndex:", e);
        }
      }

      // Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              firstname: data.firstname || prev.firstname,
              lastname: data.lastname || prev.lastname,
              phoneNumber: data.phoneNumber || prev.phoneNumber,
            }
          : prev,
      );
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
              const pending = safeJSONParse(pendingStr);
              if (pending && pending.email && pending.password) {
                const userCredential = await signInWithEmailAndPassword(
                  auth,
                  pending.email,
                  pending.password,
                );
                await sendEmailVerification(userCredential.user);
                await signOut(auth);
                return;
              } else {
                console.warn(
                  "resendVerificationEmail: pending data invalid",
                  pendingStr,
                );
              }
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
            const pendingUser = safeJSONParse(pendingUserStr);
            if (!pendingUser) return false;

            // Temporarily sign in to check verification; set skip flag so listener ignores this transient sign-in
            skipAuthHandlingRef.current = true;
            try {
              userCredential = await signInWithEmailAndPassword(
                auth,
                pendingUser.email,
                pendingUser.password,
              );
              await userCredential.user.reload();
              const isVerified = userCredential.user.emailVerified;

              if (isVerified) {
                // 1. Move to users collection
                const normalizedRole = normalizeRole(pendingUser.role) || "user";
                const userPayload: Record<string, any> = {
                  uid: userCredential.user.uid,
                  email: pendingUser.email,
                  firstname: pendingUser.firstname || "",
                  lastname: pendingUser.lastname || "",
                  role: normalizedRole,
                  phoneNumber: pendingUser.phoneNumber || "",
                  dateOfBirth: pendingUser.dateOfBirth || "",
                  emailVerified: true,
                  profileCompleted: false,
                  createdAt: new Date().toISOString(),
                  isApproved: normalizedRole === "lab-delivery-boy" ? false : true,
                  educationSubmitted: normalizedRole === "lab-delivery-boy" ? false : true,
                  status: normalizedRole === "lab-delivery-boy" ? "pending" : "active",
                };

                // Only add delivery-specific fields if applicable
                if (normalizedRole === "delivery") {
                  userPayload.deliveryType = pendingUser.deliveryType || "medicine";
                }
                if (pendingUser.qualification) {
                  userPayload.qualification = pendingUser.qualification;
                }

                await setDoc(doc(db, "users", userCredential.user.uid), userPayload);

                // 2. Clear pending records
                await deleteDoc(doc(db, "pendingUsers", userCredential.user.uid));
                await AsyncStorage.removeItem(PENDING_USER_KEY);
                await AsyncStorage.setItem("@healthnest_verification_complete", "true");
                
                // 3. Clear transient skip flag and manually trigger user fetch to update state
                // We DON'T signOut here anymore to allow "Auto-Login"
                skipAuthHandlingRef.current = false;
                
                // Manually record that we are verified and profile is not completed
                const fullUser = {
                  ...userPayload,
                  emailVerified: true,
                };
                setUser(fullUser as any);
                
                // Mark verification complete and remove pending flag
                await AsyncStorage.setItem(VERIFICATION_COMPLETE_KEY, "true");
                await AsyncStorage.removeItem(PENDING_USER_KEY);
                await AsyncStorage.removeItem("@healthnest_otp");

                // Create publicPhoneIndex entry
                const digitsOnly = (pendingUser.phoneNumber || "").replace(
                  /\D+/g,
                  "",
                );
                if (digitsOnly) {
                  await setDoc(doc(db, "publicPhoneIndex", digitsOnly), {
                    uid: userCredential.user.uid,
                    email: pendingUser.email,
                  });
                }

                // Navigate will be handled by UI or Auth listener, but we can do a push if needed
                // router.replace("/(auth)") is usually Login, but since we are LOGGED IN now, 
                // the _layout will see user and redirect out of (auth).

                return true;
              }

              return false;
            } finally {
              // Sign out ONLY if NOT verified (this was a transient check)
              // If verified, we stay signed in to provide Auto-Login
              try {
                // Fetch latest state to be sure
                const isVerifiedAfterCheck = userCredential?.user?.emailVerified;
                if (userCredential && !isVerifiedAfterCheck) {
                  await signOut(auth);
                }
              } catch (e) {
                /* ignore */
              }
              skipAuthHandlingRef.current = false;
            }
          } catch (e) {
            console.error("checkEmailVerification error:", e);
            try {
              if (userCredential) await signOut(auth);
            } catch (_) {}
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
            await setDoc(doc(db, "passwordResetOTPs", normalized), {
              phoneNumber,
              uid: data.uid,
              email: data.email || null,
              otp,
              verified: false,
              createdAt: new Date().toISOString(),
            });
            await AsyncStorage.setItem(OTP_KEY, otp);
            await AsyncStorage.setItem(
              PENDING_USER_KEY,
              JSON.stringify({
                phoneNumber,
                isPasswordReset: true,
                uid: data.uid,
                email: data.email || null,
                createdAt: new Date().toISOString(),
              }),
            );
            console.log("Password reset OTP:", otp);
            return otp;
          } catch (e) {
            console.error("sendPasswordResetOTP error:", e);
            throw e;
          }
        },
        verifyPasswordResetOTP: async (
          enteredOTP: string,
        ): Promise<boolean> => {
          const stored = await AsyncStorage.getItem(OTP_KEY);
          if (enteredOTP === stored) return true;
          const err: any = new Error("Invalid OTP");
          err.code = "invalid-otp";
          throw err;
        },
        resendPasswordResetOTP: async (): Promise<string> => {
          const pendingStr = await AsyncStorage.getItem(PENDING_USER_KEY);
          if (!pendingStr) {
            throw new Error("No pending reset");
          }
          const pending = safeJSONParse(pendingStr);
          if (!pending) {
            throw new Error("Invalid pending reset data");
          }
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
        changePassword: async (
          currentPassword: string,
          newPassword: string,
        ): Promise<void> => {
          if (!auth.currentUser || !auth.currentUser.email)
            throw new Error("Not authenticated");
          const credential = EmailAuthProvider.credential(
            auth.currentUser.email,
            currentPassword,
          );
          await reauthenticateWithCredential(auth.currentUser, credential);
          await firebaseUpdatePassword(auth.currentUser, newPassword);
        },
        submitEducationDetails,
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
  if (!ctx) throw new Error("useFirebaseAuth must be used inside AuthProvider");
  return ctx;
};

// Alias for compatibility with existing imports
export const useAuthContext = useFirebaseAuth;
