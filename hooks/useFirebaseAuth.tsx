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
const PENDING_USER_KEY = "@healthnest_pending_user";
const OTP_KEY = "@healthnest_otp";

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Define user roles
export type UserRole = "user" | "admin" | "nurse" | "delivery" | "lab";

// Define what your context provides
interface User {
  uid: string;
  email: string;
  role: UserRole;
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
        
        setUser({
          uid: fbUser.uid,
          email: fbUser.email || "",
          role: role,
        });
        
        console.log("User set:", fbUser.email, "Role:", role);
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
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
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
      
      // Set user state manually for verified users
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email || "",
        role: role,
      });
      setFirebaseUser(userCredential.user);
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
          createdAt: new Date().toISOString(),
        });
        
        // Delete from pendingUsers collection
        await deleteDoc(doc(db, "pendingUsers", userCredential.user.uid));
        
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
  const sendPasswordResetOTP = async (phoneNumber: string): Promise<string> => {
    try {
      // Find user by phone number in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phoneNumber", "==", phoneNumber));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        const errorWithInfo = new Error("Phone number not found") as any;
        errorWithInfo.text1 = "Not Found";
        errorWithInfo.text2 = "No account found with this phone number.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      const otp = generateOTP();
      console.log("Password Reset OTP for", phoneNumber, ":", otp);
      
      // Store OTP in a separate collection (more permissive rules)
      // Use phone number as document ID for easy lookup
      const otpDocRef = doc(db, "passwordResetOTPs", phoneNumber.replace(/\+/g, ""));
      await setDoc(otpDocRef, {
        otp: otp,
        phoneNumber: phoneNumber,
        userId: userDoc.id,
        email: userData.email,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes expiry
        used: false,
      });
      
      // Store locally for verification
      await AsyncStorage.setItem(OTP_KEY, otp);
      await AsyncStorage.setItem(PENDING_USER_KEY, JSON.stringify({
        email: userData.email,
        uid: userDoc.id,
        phoneNumber: phoneNumber,
        isPasswordReset: true,
      }));
      
      // TODO: In production, send SMS via backend service (Twilio, Firebase Cloud Functions, etc.)
      // For development, OTP is logged to console and stored in Firestore
      // The OTP can be retrieved from Firestore or console for testing
      console.log("========================================");
      console.log("PASSWORD RESET OTP:", otp);
      console.log("Phone Number:", phoneNumber);
      console.log("========================================");
      
      return otp;
    } catch (error: any) {
      console.error("Send password reset OTP error:", error);
      if (error.text1) throw error;
      const errorWithInfo = new Error("Failed to send OTP") as any;
      errorWithInfo.text1 = "Error";
      errorWithInfo.text2 = "Failed to send OTP. Please try again.";
      errorWithInfo.type = "error";
      throw errorWithInfo;
    }
  };

  // Verify password reset OTP
  const verifyPasswordResetOTP = async (enteredOTP: string): Promise<boolean> => {
    try {
      const storedOTP = await AsyncStorage.getItem(OTP_KEY);
      if (enteredOTP === storedOTP) {
        console.log("Password reset OTP verified");
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
      console.log("Resent Password Reset OTP for", pendingUser.phoneNumber, ":", otp);
      
      // Store OTP locally
      await AsyncStorage.setItem(OTP_KEY, otp);
      
      // Store in passwordResetOTPs collection (not users collection)
      const otpDocRef = doc(db, "passwordResetOTPs", pendingUser.phoneNumber.replace(/\+/g, ""));
      await setDoc(otpDocRef, {
        otp: otp,
        phoneNumber: pendingUser.phoneNumber,
        userId: pendingUser.uid,
        email: pendingUser.email,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        used: false,
      });
      
      // TODO: In production, send SMS via backend service
      console.log("========================================");
      console.log("RESENT PASSWORD RESET OTP:", otp);
      console.log("Phone Number:", pendingUser.phoneNumber);
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

  // Update password after OTP verification
  const updatePassword = async (newPassword: string): Promise<void> => {
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
      const email = pendingUser.email;
      
      if (!email) {
        const errorWithInfo = new Error("Email not found") as any;
        errorWithInfo.text1 = "Error";
        errorWithInfo.text2 = "Email not found. Please try again.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      }
      
      // Try to sign in with the new password to check if it's the same as current
      // Use skipAuthHandlingRef to prevent auth state changes
      try {
        skipAuthHandlingRef.current = true;
        await signInWithEmailAndPassword(auth, email, newPassword);
        // If login succeeds, the password is the same as the current one
        await signOut(auth);
        skipAuthHandlingRef.current = false;
        
        const errorWithInfo = new Error("Same password") as any;
        errorWithInfo.text1 = "Same Password";
        errorWithInfo.text2 = "New password cannot be the same as your current password. Please choose a different password.";
        errorWithInfo.type = "error";
        throw errorWithInfo;
      } catch (signInError: any) {
        skipAuthHandlingRef.current = false;
        // If sign in fails with wrong-password, it means the new password is different (good!)
        if (signInError.code === "auth/wrong-password" || signInError.code === "auth/invalid-credential") {
          // Password is different, proceed with reset via email
          console.log("New password is different from current password - proceeding with reset");
        } else if (signInError.text1 === "Same Password") {
          // This is our custom error, re-throw it
          throw signInError;
        } else {
          // Some other error occurred during sign in attempt
          console.log("Sign in check error:", signInError.code);
        }
      }
      
      // Send Firebase password reset email
      // User will click the link in email to set new password
      await sendPasswordResetEmail(auth, email);
      
      // Mark OTP as used in passwordResetOTPs collection (public access)
      const otpDocRef = doc(db, "passwordResetOTPs", pendingUser.phoneNumber.replace(/\\+/g, ""));
      await setDoc(otpDocRef, {
        used: true,
        usedAt: new Date().toISOString(),
      }, { merge: true });
      
      // Clear local storage
      await AsyncStorage.removeItem(OTP_KEY);
      await AsyncStorage.removeItem(PENDING_USER_KEY);
      
      console.log("Password reset email sent successfully to:", email);
    } catch (error: any) {
      // Ensure flag is reset on any error
      skipAuthHandlingRef.current = false;
      console.error("Update password error:", error);
      if (error.text1) throw error;
      const errorWithInfo = new Error("Failed to update password") as any;
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
