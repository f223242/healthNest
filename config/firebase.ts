// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7BreYpRvIjPA3cfyJ6bjRp0L8A5MwJ4Y",
  authDomain: "healthnest-812ab.firebaseapp.com",
  projectId: "healthnest-812ab",
  storageBucket: "healthnest-812ab.appspot.com", // Fixed from firebasestorage.app
  messagingSenderId: "716753087878",
  appId: "1:716753087878:web:17436386b86070dcf29007"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with platform-specific persistence
let auth: Auth;
if (Platform.OS === 'web') {
  // For web, use default persistence
  auth = getAuth(app);
} else {
  // For React Native, use AsyncStorage persistence
  //@ts-ignore - getReactNativePersistence is available in React Native
  const { getReactNativePersistence } = require("firebase/auth");
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };

// Initialize Firestore (for storing user roles)
export const db = getFirestore(app);

// Initialize Storage (for file uploads)
export const storage = getStorage(app);

export default app;