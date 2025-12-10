import { auth, db } from "@/config/firebase";
import { firebaseMessages } from "@/constant/messages";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  User as FirebaseUser,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

// Helper function to get error message from firebaseMessages
const getFirebaseErrorMessage = (errorCode: string) => {
  const errorMessages = firebaseMessages.errors as { [key: string]: { type: string; text1: string; text2: string } };
  return errorMessages[errorCode] || {
    type: 'error',
    text1: 'Error',
    text2: 'An unexpected error occurred. Please try again.',
  };
};

const USER_ROLE_KEY = "@healthnest_user_role";
const SECURE_TOKEN_KEY = "@healthnest_secure_token";
const PENDING_USER_KEY = "@healthnest_pending_user";
const OTP_KEY = "@healthnest_otp";
const VERIFICATION_COMPLETE_KEY = "@healthnest_verification_complete";

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Define user roles
export type UserRole = "user" | "admin" | "nurse" | "delivery" | "lab";

// Additional info interfaces for each role
export interface PatientInfo {
  address: string;
  city: string;
  emergencyContact: string;
  bloodGroup: string;
  profileImage?: string | null;
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
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
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
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
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface DeliveryInfo {
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  address: string;
  city: string;
  availability: string;
  profileImage?: string | null;
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface AdminInfo {
  profileImage?: string | null;
  address?: string;
  city?: string;
}

export type AdditionalInfo = PatientInfo | NurseInfo | LabInfo | DeliveryInfo | AdminInfo;

// Define what your context provides
export interface User {
  uid: string;
  email: string;
  role: UserRole;
  profileCompleted?: boolean;
  additionalInfo?: AdditionalInfo;
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
}

interface PendingUser {
  email: string;
  uid: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (values: { email: string; password: string }) => Promise<void>;
  register: (values: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    role: string;
    dateOfBirth: string;
    phoneNumber: string;
  }) => Promise<{ requiresVerification: boolean }>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  sendPasswordResetOTP: (phoneNumber: string) => Promise<string>;
  verifyPasswordResetOTP: (otp: string) => Promise<boolean>;
  resendPasswordResetOTP: () => Promise<string>;
  updatePassword: (newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (data: { firstname?: string; lastname?: string; phoneNumber?: string }) => Promise<void>;
  saveAdditionalInfo: (info: AdditionalInfo) => Promise<void>;
  getUserProfile: () => Promise<User | null>;
  getAllUsers: (roleFilter?: string) => Promise<User[]>;
  isLoading: boolean;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Helper function to get user role from Firestore
const getUserRole = async (uid: string): Promise<UserRole> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return (data.role as UserRole) || "user";
    }
    return "user";
  } catch (error) {
    console.error("Error getting user role:", error);
    return "user";
  }
};

// Helper function to save user role locally
const saveRoleLocally = async (role: UserRole) => {
  try {
    await AsyncStorage.setItem(USER_ROLE_KEY, role);
  } catch (error) {
    console.error("Error saving role locally:", error);
  }
};

// Helper function to get role locally (for faster loading)
const getRoleLocally = async (): Promise<UserRole | null> => {
  try {
    const role = await AsyncStorage.getItem(USER_ROLE_KEY);
    return role as UserRole | null;
  } catch (error) {
    console.error("Error getting local role:", error);
    return null;
  }
};

// Helper function to clear local role
const clearLocalRole = async () => {
  try {
    await AsyncStorage.removeItem(USER_ROLE_KEY);
  } catch (error) {
    console.error("Error clearing local role:", error);
  }
};

// AuthProvider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Flag to skip auth state handling during verification check
  const skipAuthHandlingRef = React.useRef(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("Auth state changed:", fbUser?.email);

      // Skip auth handling when checking verification status
      if (skipAuthHandlingRef.current) {
        console.log("Skipping auth handling during verification check");
        return;
      }

      if (fbUser) {
        setFirebaseUser(fbUser);

        // Check if email is verified
        if (!fbUser.emailVerified) {
          console.log("Email not verified, not setting user state");
          setUser(null);
          setIsLoading(false);;
          return;
        }

        // First try to get role locally for faster loading
        let role = await getRoleLocally();

        // If no local role, fetch from Firestore
        if (!role) {
          role = await getUserRole(fbUser.uid);
          await saveRoleLocally(role);
        }

        // Fetch full user profile including profileCompleted status
        try {
          const userDocRef = doc(db, "users", fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : {};

          setUser({
            uid: fbUser.uid,
            email: fbUser.email || "",
            role: role,
            profileCompleted: userData.profileCompleted || false,
            additionalInfo: userData.additionalInfo,
            firstname: userData.firstname,
            lastname: userData.lastname,
            phoneNumber: userData.phoneNumber,
          });

          console.log("User set:", fbUser.email, "Role:", role, "ProfileCompleted:", userData.profileCompleted);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || "",
            role: role,
            profileCompleted: false,
          });
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        await clearLocalRole();
        console.log("User logged out");
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (values: { email: string; password: string }) => {
    try {
      setIsLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      console.log("Login successful:", userCredential.user.email);

      // Get user data from Firestore first to check role
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Check if email is verified (skip for admin users or if emailVerified is true in Firestore)
      const isAdmin = userData.role === "admin";
      const isVerifiedInFirestore = userData.emailVerified === true;

      if (!userCredential.user.emailVerified && !isAdmin && !isVerifiedInFirestore) {
        await signOut(auth);
        setIsLoading(false);
        const errorWithInfo = new Error("Please verify your email before logging in.") as any;
        errorWithInfo.text1 = "Email Not Verified";
        errorWithInfo.text2 = "Please verify your email first. Check your inbox.";
        errorWithInfo.type = "error";
        errorWithInfo.requiresVerification = true;
        throw errorWithInfo;
      }

      // Get user role from Firestore
      const role = await getUserRole(userCredential.user.uid);
      await saveRoleLocally(role);

      // Clear any pending user data (in case user is logging in after verification)
      await AsyncStorage.removeItem(PENDING_USER_KEY);

      // Set user state with full profile data
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email || "",
        role: role,
        profileCompleted: userData.profileCompleted || false,
        additionalInfo: userData.additionalInfo,
        firstname: userData.firstname,
        lastname: userData.lastname,
        phoneNumber: userData.phoneNumber,
      });
      setFirebaseUser(userCredential.user);
      // Store secure token for persistent session (kept in secure storage)
      try {
        const idToken = await userCredential.user.getIdToken();
        if (idToken) {
          try {
            const secureStoreMod = await import('expo-secure-store');
            await secureStoreMod.setItemAsync(SECURE_TOKEN_KEY, idToken);
          } catch (e) {
            console.warn('expo-secure-store not available, falling back to AsyncStorage');
            await AsyncStorage.setItem(SECURE_TOKEN_KEY, idToken);
          }
        }
      } catch (e) {
        console.warn("Failed to store secure token:", e);
      }
      setIsLoading(false);

    } catch (error: any) {
      console.error("Login error:", error);
      setIsLoading(false);

      // If it's our custom error, rethrow it
      if (error.requiresVerification) {
        throw error;
      }

      const errorInfo = getFirebaseErrorMessage(error.code);
      const errorWithInfo = new Error(errorInfo.text2) as any;
      errorWithInfo.text1 = errorInfo.text1;
      errorWithInfo.text2 = errorInfo.text2;
      errorWithInfo.type = errorInfo.type;

      throw errorWithInfo;
    }
  };

  // Register function - stores data temporarily until email is verified
  const register = async (values: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    role: string;
    dateOfBirth: string;
    phoneNumber: string;
  }) => {
    try {
      setIsLoading(true);

      // Check if email already exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, values.email);
      if (signInMethods.length > 0) {
        setIsLoading(false);
        const errorWithInfo = new Error("Email already registered") as any;
        errorWithInfo.text1 = "Email Exists";
        errorWithInfo.text2 = "This email is already registered. Please login or use a different email.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }

      // Create user in Firebase Auth (required to send verification email)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      console.log("User created in Auth:", userCredential.user.email);

      // Send email verification
      const actionCodeSettings = {
        url: 'https://healthnest-812ab.firebaseapp.com',
        handleCodeInApp: false,
      };

      await sendEmailVerification(userCredential.user, actionCodeSettings);
      console.log("Verification email sent to:", values.email);

      // Map role from form to UserRole type
      const roleMap: { [key: string]: UserRole } = {
        "User": "user",
        "Lab": "lab",
        "Nurse": "nurse",
        "Medicine Delivery": "delivery",
      };

      const userRole = roleMap[values.role] || "user";

      // Store user data in pendingUsers collection (will be moved to users after verification)
      await setDoc(doc(db, "pendingUsers", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: values.email,
        firstname: values.firstname,
        lastname: values.lastname,
        role: userRole,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth,
        createdAt: new Date().toISOString(),
        verified: false,
      });

      console.log("User data saved to pendingUsers collection");

      // Sign out - they need to verify email first
      await signOut(auth);

      // Store pending user info locally for verification flow
      await AsyncStorage.setItem(PENDING_USER_KEY, JSON.stringify({
        email: values.email,
        password: values.password,
        uid: userCredential.user.uid,
        role: userRole,
        firstname: values.firstname,
        lastname: values.lastname,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth,
      }));

      setIsLoading(false);
      return { requiresVerification: true };

    } catch (error: any) {
      console.error("Registration error:", error);
      setIsLoading(false);

      if (error.text1) {
        throw error;
      }

      const errorInfo = getFirebaseErrorMessage(error.code);
      const errorWithInfo = new Error(errorInfo.text2) as any;
      errorWithInfo.text1 = errorInfo.text1;
      errorWithInfo.text2 = errorInfo.text2;
      errorWithInfo.type = errorInfo.type;

      throw errorWithInfo;
    }
  };

  // Send OTP to phone number
  const sendOTP = async (phoneNumber: string): Promise<string> => {
    try {
      const otp = generateOTP();
      console.log("Generated OTP for", phoneNumber, ":", otp); // In production, send via SMS

      // Store OTP locally
      await AsyncStorage.setItem(OTP_KEY, otp);

      // In production, you would send OTP via SMS service like Twilio
      // For now, we'll just store it and show in console

      return otp;
    } catch (error: any) {
      console.error("Send OTP error:", error);
      throw error;
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      // Action code settings for email verification
      const actionCodeSettings = {
        url: 'https://healthnest-812ab.firebaseapp.com', // Your Firebase app URL
        handleCodeInApp: false, // Set to true if handling verification in-app
      };

      // If there's a current user, resend to them
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser, actionCodeSettings);
        console.log("Verification email resent");
        return;
      }

      // Try to get pending user and sign in temporarily
      const pendingUserStr = await AsyncStorage.getItem(PENDING_USER_KEY);
      if (pendingUserStr) {
        const pendingUser = JSON.parse(pendingUserStr);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          pendingUser.email,
          pendingUser.password
        );
        await sendEmailVerification(userCredential.user, actionCodeSettings);
        await signOut(auth);
        console.log("Verification email resent to:", pendingUser.email);
        return;
      }

      throw new Error("No user to resend verification to");
    } catch (error: any) {
      console.error("Resend verification error:", error);
      const errorWithInfo = new Error("Failed to resend verification email") as any;
      errorWithInfo.text1 = "Error";
      errorWithInfo.text2 = "Failed to resend verification email. Please try again.";
      errorWithInfo.type = "error";
      throw errorWithInfo;
    }
  };

  // Check if email is verified and move user to users collection
  const checkEmailVerification = async (): Promise<boolean> => {
    try {
      const pendingUserStr = await AsyncStorage.getItem(PENDING_USER_KEY);
      if (!pendingUserStr) {
        console.log("No pending user found");
        return false;
      }

      const pendingUser = JSON.parse(pendingUserStr);

      // Check if this is a password reset flow (not email verification)
      if (pendingUser.isPasswordReset) {
        console.log("This is a password reset flow, not email verification");
        return false;
      }

      // Check if password exists
      if (!pendingUser.password || !pendingUser.email) {
        console.log("Missing email or password in pending user data");
        return false;
      }

      // Set flag to skip auth handling during this check
      skipAuthHandlingRef.current = true;

      // Sign in to check verification status
      const userCredential = await signInWithEmailAndPassword(
        auth,
        pendingUser.email,
        pendingUser.password
      );

      // Reload user to get latest verification status
      await userCredential.user.reload();
      const isVerified = userCredential.user.emailVerified;

      if (isVerified) {
        console.log("Email verified! Moving user to users collection...");

        // Move user data from pendingUsers to users collection
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: pendingUser.email,
          firstname: pendingUser.firstname,
          lastname: pendingUser.lastname,
          role: pendingUser.role,
          phoneNumber: pendingUser.phoneNumber,
          dateOfBirth: pendingUser.dateOfBirth,
          emailVerified: true,
          profileCompleted: false, // Initialize profileCompleted as false
          createdAt: new Date().toISOString(),
        });

        // Delete from pendingUsers collection
        await deleteDoc(doc(db, "pendingUsers", userCredential.user.uid));

        // Set verification complete flag BEFORE clearing pending user
        // This prevents _layout.tsx from redirecting back to otp-screen
        await AsyncStorage.setItem(VERIFICATION_COMPLETE_KEY, "true");

        // Clear pending user from AsyncStorage
        await AsyncStorage.removeItem(PENDING_USER_KEY);

        console.log("User moved to users collection successfully");
      }

      // Sign out - user will login manually after verification
      await signOut(auth);

      // Reset flag after sign out
      skipAuthHandlingRef.current = false;

      return isVerified;

    } catch (error: any) {
      console.error("Check verification error:", error);
      // Reset flag on error too
      skipAuthHandlingRef.current = false;

      // If it's an auth error, don't throw - just return false
      if (error.code?.startsWith("auth/")) {
        console.log("Auth error during verification check:", error.code);
        return false;
      }

      return false;
    }
  };

  // Send OTP for password reset (phone-based)
  // For development: OTP is stored locally and shown in console
  // User will provide email on the next screen for password reset
  const sendPasswordResetOTP = async (phoneNumber: string): Promise<string> => {
    try {
      // Ensure this phone number belongs to a registered user
      const usersQuery = query(collection(db, "users"), where("phoneNumber", "==", phoneNumber));
      const userDocs = await getDocs(usersQuery);
      if (userDocs.empty) {
        const errorWithInfo = new Error("No account found with this phone number") as any;
        errorWithInfo.text1 = "Not Found";
        errorWithInfo.text2 = "No registered account uses this phone number.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }

      // Use first matching user (phone numbers should be unique)
      const userDoc = userDocs.docs[0];
      const userData = userDoc.data();

      const otp = generateOTP();

      // Store OTP locally for verification
      await AsyncStorage.setItem(OTP_KEY, otp);
      await AsyncStorage.setItem(PENDING_USER_KEY, JSON.stringify({
        phoneNumber: phoneNumber,
        isPasswordReset: true,
        uid: userDoc.id,
        email: userData.email || null,
        createdAt: new Date().toISOString(),
      }));

      // For development: show OTP in console
      // In production, this would be sent via SMS (Twilio, etc.)
      console.log("========================================");
      console.log("🔐 PASSWORD RESET OTP:", otp);
      console.log("📱 Phone Number:", phoneNumber);
      console.log("👤 User UID:", userDoc.id);
      console.log("⏰ Valid for 10 minutes");
      console.log("========================================");

      return otp;
    } catch (error: any) {
      console.error("Send password reset OTP error:", error);
      const errorWithInfo = new Error("Failed to send OTP") as any;
      errorWithInfo.text1 = error.text1 || "Error";
      errorWithInfo.text2 = error.text2 || "Failed to generate OTP. Please try again.";
      errorWithInfo.type = "error";
      throw errorWithInfo;
    }
  };

  // Verify password reset OTP
  const verifyPasswordResetOTP = async (enteredOTP: string): Promise<boolean> => {
    try {
      const storedOTP = await AsyncStorage.getItem(OTP_KEY);
      if (enteredOTP === storedOTP) {
        console.log("✅ Password reset OTP verified successfully");
        return true;
      }
      // Throw error for invalid OTP
      const errorWithInfo = new Error("Invalid OTP") as any;
      errorWithInfo.text1 = "Invalid OTP";
      errorWithInfo.text2 = "The OTP you entered is incorrect. Please try again.";
      errorWithInfo.type = "error";
      throw errorWithInfo;
    } catch (error: any) {
      console.error("Verify password reset OTP error:", error);
      if (error.text1) throw error;
      const errorWithInfo = new Error("Verification failed") as any;
      errorWithInfo.text1 = "Error";
      errorWithInfo.text2 = "Failed to verify OTP. Please try again.";
      errorWithInfo.type = "error";
      throw errorWithInfo;
    }
  };

  // Resend password reset OTP
  const resendPasswordResetOTP = async (): Promise<string> => {
    try {
      const pendingUserStr = await AsyncStorage.getItem(PENDING_USER_KEY);
      if (!pendingUserStr) {
        const errorWithInfo = new Error("No pending reset found") as any;
        errorWithInfo.text1 = "Session Expired";
        errorWithInfo.text2 = "Please start the password reset process again.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }

      const pendingUser = JSON.parse(pendingUserStr);
      const otp = generateOTP();

      // Store OTP locally
      await AsyncStorage.setItem(OTP_KEY, otp);

      // For development: show OTP in console
      console.log("========================================");
      console.log("🔄 RESENT PASSWORD RESET OTP:", otp);
      console.log("📱 Phone Number:", pendingUser.phoneNumber);
      console.log("⏰ Valid for 10 minutes");
      console.log("========================================");

      return otp;
    } catch (error: any) {
      console.error("Resend password reset OTP error:", error);
      if (error.text1) throw error;
      const errorWithInfo = new Error("Failed to resend OTP") as any;
      errorWithInfo.text1 = "Error";
      errorWithInfo.text2 = "Failed to resend OTP. Please try again.";
      errorWithInfo.type = "error";
      throw errorWithInfo;
    }
  };

  // Send password reset email after OTP verification
  // User provides email on the reset screen, and Firebase sends reset link
  const updatePassword = async (email: string): Promise<void> => {
    try {
      if (!email) {
        const errorWithInfo = new Error("Email required") as any;
        errorWithInfo.text1 = "Email Required";
        errorWithInfo.text2 = "Please enter your email address.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }

      // Send Firebase password reset email
      await sendPasswordResetEmail(auth, email);

      // Clear local storage
      await AsyncStorage.removeItem(OTP_KEY);
      await AsyncStorage.removeItem(PENDING_USER_KEY);

      console.log("✅ Password reset email sent successfully to:", email);
    } catch (error: any) {
      console.error("Send password reset email error:", error);

      if (error.text1) throw error;

      // Handle Firebase specific errors
      if (error.code === "auth/user-not-found") {
        const errorWithInfo = new Error("User not found") as any;
        errorWithInfo.text1 = "Not Found";
        errorWithInfo.text2 = "No account found with this email address.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }

      if (error.code === "auth/invalid-email") {
        const errorWithInfo = new Error("Invalid email") as any;
        errorWithInfo.text1 = "Invalid Email";
        errorWithInfo.text2 = "Please enter a valid email address.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }

      const errorWithInfo = new Error("Failed to send email") as any;
      errorWithInfo.text1 = "Error";
      errorWithInfo.text2 = "Failed to send password reset email. Please try again.";
      errorWithInfo.type = "error";
      throw errorWithInfo;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log("Logging out user");
      await signOut(auth);
      // Clear secure token
      try {
        try {
          const secureStoreMod = await import('expo-secure-store');
          await secureStoreMod.deleteItemAsync(SECURE_TOKEN_KEY);
        } catch (e) {
          console.warn('expo-secure-store not available, falling back to AsyncStorage');
          await AsyncStorage.removeItem(SECURE_TOKEN_KEY);
        }
      } catch (e) {
        console.warn("Failed to clear secure token:", e);
      }
      await clearLocalRole();
      // Clear pending user data to prevent redirect to reset-password
      await AsyncStorage.removeItem(PENDING_USER_KEY);
      await AsyncStorage.removeItem(OTP_KEY);
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      console.error("Logout error:", error);
      const errorInfo = getFirebaseErrorMessage(error.code);
      const errorWithInfo = new Error(errorInfo.text2) as any;
      errorWithInfo.text1 = errorInfo.text1;
      errorWithInfo.text2 = errorInfo.text2;
      errorWithInfo.type = errorInfo.type;

      throw errorWithInfo;
    }
  };

  // Change password (requires current password for re-authentication)
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        const errorWithInfo = new Error("Not authenticated") as any;
        errorWithInfo.text1 = "Error";
        errorWithInfo.text2 = "You must be logged in to change your password.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }

      // Re-authenticate user with current password
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword: firebaseUpdatePassword } = await import("firebase/auth");
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);

      try {
        await reauthenticateWithCredential(currentUser, credential);
      } catch (reAuthError: any) {
        const errorWithInfo = new Error("Invalid current password") as any;
        errorWithInfo.text1 = "Invalid Password";
        errorWithInfo.text2 = "Your current password is incorrect. Please try again.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }

      // Check if new password is same as current
      if (currentPassword === newPassword) {
        const errorWithInfo = new Error("Same password") as any;
        errorWithInfo.text1 = "Same Password";
        errorWithInfo.text2 = "New password cannot be the same as your current password.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }

      // Update password
      await firebaseUpdatePassword(currentUser, newPassword);
      console.log("Password changed successfully");
    } catch (error: any) {
      console.error("Change password error:", error);
      if (error.text1) throw error;
      const errorWithInfo = new Error("Password change failed") as any;
      errorWithInfo.text1 = "Error";
      errorWithInfo.text2 = "Failed to change password. Please try again.";
      errorWithInfo.type = "error";
      throw errorWithInfo;
    }
  };

  // Update user profile (basic info)
  const updateProfile = async (data: { firstname?: string; lastname?: string; phoneNumber?: string }): Promise<void> => {
    try {
      if (!user) {
        const errorWithInfo = new Error("Not authenticated") as any;
        errorWithInfo.text1 = "Error";
        errorWithInfo.text2 = "You must be logged in to update profile.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Update local user state
      setUser({
        ...user,
        firstname: data.firstname || user.firstname,
        lastname: data.lastname || user.lastname,
        phoneNumber: data.phoneNumber || user.phoneNumber,
      });

      console.log("Profile updated successfully");
    } catch (error: any) {
      console.error("Update profile error:", error);
      if (error.text1) throw error;
      const errorWithInfo = new Error("Profile update failed") as any;
      errorWithInfo.text1 = "Error";
      errorWithInfo.text2 = "Failed to update profile. Please try again.";
      errorWithInfo.type = "error";
      throw errorWithInfo;
    }
  };

  // Save additional info for user profile
  const saveAdditionalInfo = async (info: AdditionalInfo): Promise<void> => {
    try {
      if (!user) {
        console.log("saveAdditionalInfo: No user found in context");
        const errorWithInfo = new Error("Not authenticated") as any;
        errorWithInfo.text1 = "Error";
        errorWithInfo.text2 = "You must be logged in to update profile.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }

      console.log("saveAdditionalInfo: Saving for user:", user.uid, "role:", user.role);

      const userDocRef = doc(db, "users", user.uid);

      // Check if document exists first
      const existingDoc = await getDoc(userDocRef);
      console.log("saveAdditionalInfo: Document exists:", existingDoc.exists());

      await setDoc(userDocRef, {
        additionalInfo: info,
        profileCompleted: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Update local user state
      setUser({
        ...user,
        additionalInfo: info,
        profileCompleted: true,
      });

      console.log("Additional info saved successfully for role:", user.role);
    } catch (error: any) {
      console.error("Save additional info error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      if (error.text1) throw error;
      const errorWithInfo = new Error("Failed to save info") as any;
      errorWithInfo.text1 = "Error";
      errorWithInfo.text2 = "Failed to save additional information. Please try again.";
      errorWithInfo.type = "error";
      throw errorWithInfo;
    }
  };

  // Get all users from Firestore (for admin)
  const getAllUsers = async (roleFilter?: string): Promise<User[]> => {
    try {
      const usersRef = collection(db, "users");
      let q;

      if (roleFilter && roleFilter !== "All") {
        // Map display names to actual role values
        const roleMap: { [key: string]: string } = {
          "User": "user",
          "Lab": "lab",
          "Nurse": "nurse",
          "Medicine Delivery": "delivery",
        };
        const actualRole = roleMap[roleFilter] || roleFilter.toLowerCase();
        q = query(usersRef, where("role", "==", actualRole));
      } else {
        q = query(usersRef);
      }

      const querySnapshot = await getDocs(q);
      const users: User[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          uid: doc.id,
          email: data.email || "",
          role: data.role || "user",
          profileCompleted: data.profileCompleted || false,
          additionalInfo: data.additionalInfo,
          firstname: data.firstname,
          lastname: data.lastname,
          phoneNumber: data.phoneNumber,
        });
      });

      return users;
    } catch (error: any) {
      console.error("Get all users error:", error);
      return [];
    }
  };

  // Get full user profile from Firestore
  const getUserProfile = async (): Promise<User | null> => {
    try {
      if (!user) return null;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const fullUser: User = {
          uid: user.uid,
          email: user.email,
          role: user.role,
          profileCompleted: data.profileCompleted || false,
          additionalInfo: data.additionalInfo,
          firstname: data.firstname,
          lastname: data.lastname,
          phoneNumber: data.phoneNumber,
        };

        // Update local state
        setUser(fullUser);
        return fullUser;
      }

      return user;
    } catch (error: any) {
      console.error("Get user profile error:", error);
      return user;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        login,
        register,
        logout,
        resendVerificationEmail,
        checkEmailVerification,
        sendPasswordResetOTP,
        verifyPasswordResetOTP,
        resendPasswordResetOTP,
        updatePassword,
        changePassword,
        updateProfile,
        saveAdditionalInfo,
        getUserProfile,
        getAllUsers,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
