// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
//@ts-ignore
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7BreYpRvIjPA3cfyJ6bjRp0L8A5MwJ4Y",
  authDomain: "healthnest-812ab.firebaseapp.com",
  projectId: "healthnest-812ab",
  storageBucket: "healthnest-812ab.firebasestorage.app",
  messagingSenderId: "716753087878",
  appId: "1:716753087878:web:17436386b86070dcf29007"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore (for storing user roles)
export const db = getFirestore(app);

export default app;