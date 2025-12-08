import { auth, db } from "@/config/firebase";
import { firebaseMessages } from "@/constant/messages";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createUserWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    User as FirebaseUser,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
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

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("Auth state changed:", fbUser?.email);
      
      if (fbUser) {
        setFirebaseUser(fbUser);
        
        // Check if email is verified
        if (!fbUser.emailVerified) {
          console.log("Email not verified, not setting user state");
          setUser(null);
          setIsLoading(false);
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

  // Register function
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
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      
      console.log("User created:", userCredential.user.email);
      
      // Send email verification with action code settings
      const actionCodeSettings = {
        url: 'https://healthnest-812ab.firebaseapp.com', // Your Firebase app URL
        handleCodeInApp: false, // Set to true if handling verification in-app
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
      console.log("Mapping role:", values.role, "->", userRole);
      
      // Save user data to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: values.email,
        firstname: values.firstname,
        lastname: values.lastname,
        role: userRole,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });
      
      console.log("User data saved to Firestore with role:", userRole);
      
      // Save role locally
      await saveRoleLocally(userRole);
      console.log("Role saved locally:", userRole);
      
      // Sign out the user - they need to verify email first
      await signOut(auth);
      
      // Store pending user info for resend functionality
      await AsyncStorage.setItem(PENDING_USER_KEY, JSON.stringify({
        email: values.email,
        password: values.password,
        uid: userCredential.user.uid,
      }));
      
      setIsLoading(false);
      
      // Return that verification is required
      return { requiresVerification: true };
      
    } catch (error: any) {
      console.error("Registration error:", error);
      setIsLoading(false);
      
      // If it's our custom error, rethrow it
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

  // Check if email is verified
  const checkEmailVerification = async (): Promise<boolean> => {
    try {
      const pendingUserStr = await AsyncStorage.getItem(PENDING_USER_KEY);
      if (pendingUserStr) {
        const pendingUser = JSON.parse(pendingUserStr);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          pendingUser.email,
          pendingUser.password
        );
        
        // Reload user to get latest verification status
        await userCredential.user.reload();
        const isVerified = userCredential.user.emailVerified;
        
        if (isVerified) {
          // Update Firestore
          await setDoc(doc(db, "users", userCredential.user.uid), {
            emailVerified: true,
          }, { merge: true });
          
          // Clear pending user
          await AsyncStorage.removeItem(PENDING_USER_KEY);
        }
        
        // Sign out - user will login manually
        await signOut(auth);
        return isVerified;
      }
      return false;
    } catch (error) {
      console.error("Check verification error:", error);
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
      
      // Store OTP in Firestore and locally
      await setDoc(doc(db, "users", userDoc.id), {
        passwordResetOTP: otp,
        passwordResetOTPCreatedAt: new Date().toISOString(),
      }, { merge: true });
      
      await AsyncStorage.setItem(OTP_KEY, otp);
      await AsyncStorage.setItem(PENDING_USER_KEY, JSON.stringify({
        email: userData.email,
        uid: userDoc.id,
        phoneNumber: phoneNumber,
        isPasswordReset: true,
      }));
      
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
      return false;
    } catch (error) {
      console.error("Verify password reset OTP error:", error);
      return false;
    }
  };

  // Resend password reset OTP
  const resendPasswordResetOTP = async (): Promise<string> => {
    try {
      const pendingUserStr = await AsyncStorage.getItem(PENDING_USER_KEY);
      if (!pendingUserStr) {
        throw new Error("No pending reset found");
      }
      
      const pendingUser = JSON.parse(pendingUserStr);
      const otp = generateOTP();
      console.log("Resent Password Reset OTP for", pendingUser.phoneNumber, ":", otp);
      
      await AsyncStorage.setItem(OTP_KEY, otp);
      
      await setDoc(doc(db, "users", pendingUser.uid), {
        passwordResetOTP: otp,
        passwordResetOTPCreatedAt: new Date().toISOString(),
      }, { merge: true });
      
      return otp;
    } catch (error: any) {
      console.error("Resend password reset OTP error:", error);
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
        throw new Error("No pending reset found");
      }
      
      const pendingUser = JSON.parse(pendingUserStr);
      
      // For password update, we need to delete and recreate the user
      // Or use Firebase Admin SDK. For now, we'll store new password hash
      // In production, use Firebase Admin SDK or Cloud Functions
      
      // Clear the OTP and pending user
      await setDoc(doc(db, "users", pendingUser.uid), {
        passwordResetOTP: null,
        passwordResetOTPCreatedAt: null,
        passwordUpdatedAt: new Date().toISOString(),
      }, { merge: true });
      
      await AsyncStorage.removeItem(OTP_KEY);
      await AsyncStorage.removeItem(PENDING_USER_KEY);
      
      console.log("Password updated successfully");
    } catch (error: any) {
      console.error("Update password error:", error);
      const errorWithInfo = new Error("Failed to update password") as any;
      errorWithInfo.text1 = "Error";
      errorWithInfo.text2 = "Failed to update password. Please try again.";
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
