import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

const USER_STORAGE_KEY = "@healthnest_user";

// Define what your context provides
interface User {
  email: string;
  password?: string;
  role?: "user" | "admin" | "nurse" | "delivery" | "lab";
}

interface AuthContextType {
  user: User | null;
  login: (values: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// AuthProvider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      console.log("Stored user from AsyncStorage:", storedUser);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed user:", parsedUser);
        setUser(parsedUser);
      } else {
        console.log("No stored user found");
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
    } finally {
      setIsLoading(false);
      console.log("Loading complete, isLoading set to false");
    }
  };

  const saveUserToStorage = async (userData: User) => {
    try {
      const userString = JSON.stringify(userData);
      await AsyncStorage.setItem(USER_STORAGE_KEY, userString);
      console.log("User saved to AsyncStorage:", userString);
    } catch (error) {
      console.error("Error saving user to storage:", error);
    }
  };

  const removeUserFromStorage = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing user from storage:", error);
    }
  };

  const login = async (values: { email: string; password: string }) => {
    try {
      // TODO: Replace with actual API call

      // Check for admin credentials first
      if (values.email === "admin@gmail.com" && values.password === "123456") {
        const userData: User = {
          email: values.email,
          role: "admin" as const,
        };
        setUser(userData);
        await saveUserToStorage(userData);
        return; // Admin login handled by RootLayout
      }
      
      // Nurse login check
      if (values.email === "nurse@gmail.com" && values.password === "123456") {
        const userData: User = {
          email: values.email,
          role: "nurse" as const,
        };
        setUser(userData);
        await saveUserToStorage(userData);
        return;
      }
      
      // Medicine Delivery login check
      if (values.email === "delivery@gmail.com" && values.password === "123456") {
        const userData: User = {
          email: values.email,
          role: "delivery" as const,
        };
        setUser(userData);
        await saveUserToStorage(userData);
        return;
      }

      // Lab Technician login check
      if (values.email === "lab@gmail.com" && values.password === "123456") {
        const userData: User = {
          email: values.email,
          role: "lab" as const,
        };
        setUser(userData);
        await saveUserToStorage(userData);
        return;
      }

      // Regular user login check
      if (values.email === "qas@gmail.com" && values.password === "123456") {
        const userData: User = {
          email: values.email,
          role: "user" as const,
        };
        setUser(userData);
        await saveUserToStorage(userData);
        // No need for navigation - RootLayout will handle it automatically
      } else {
        Alert.alert(
          "Login Failed",
          "Invalid email or password. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Error",
        "An error occurred during login. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const logout = async () => {
    console.log("Logging out user");
    setUser(null);
    await removeUserFromStorage();
    console.log("User removed from AsyncStorage");
    // No need for navigation - RootLayout will handle it automatically
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
