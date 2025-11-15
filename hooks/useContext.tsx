import React, { createContext, useContext, useState } from "react";
import { Alert } from "react-native";

// Define what your context provides
interface User {
  email: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (values: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  // isLoading: boolean;
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
  // const [isLoading, setIsLoading] = useState(false);

  const login = async (values: { email: string; password: string }) => {
    try {
      // setIsLoading(true);

      // TODO: Replace with actual API call

      // Temporary hardcoded check (remove in production)
      if (values.email === "qas@gmail.com" && values.password === "123456") {
        setUser({
          email: values.email,
          password: values.password,
        });
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
    } finally {
      // setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // No need for navigation - RootLayout will handle it automatically
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
