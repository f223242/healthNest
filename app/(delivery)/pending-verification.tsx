import AppButton from "@/component/AppButton";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PendingVerificationScreen = () => {
  const { refreshUser, logout, user } = useAuthContext();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Animation refs
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  // Real-time listener for approval status
  React.useEffect(() => {
    if (!user?.uid) return;

    // Use onSnapshot for real-time updates from Firebase
    const { db } = require("@/config/firebase");
    const { doc, onSnapshot } = require("firebase/firestore");

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc: any) => {
      const data = doc.data();
      if (data?.isApproved === true) {
        console.log("🎊 User approved in real-time! Refreshing state...");
        refreshUser();
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 20,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Re-fetches the user from firestore to check if Admin has approved them
      await refreshUser();
    } catch (error) {
      console.error("Refresh failed", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    // After logout, _layout.tsx will redirect to /(auth) automatically
  };

  const getStatusDisplay = () => {
    const status = user?.status;
    if (status === "approved") {
      return {
        icon: "checkmark-circle" as const,
        color: "#4CAF50",
        title: "Account Approved!",
        description:
          "Your account has been approved. You can now access the dashboard and accept delivery requests.",
        showRefresh: false,
      };
    } else if (status === "rejected") {
      return {
        icon: "close-circle" as const,
        color: "#F44336",
        title: "Account Rejected",
        description:
          user?.rejectionReason ||
          "Your application has been rejected. Please contact support for more information.",
        showRefresh: false,
      };
    } else {
      return {
        icon: "time" as const,
        color: "#FFA500",
        title: "Account Under Review",
        description:
          "Thank you for submitting your certification details. Our admin team is currently reviewing your documents.",
        showRefresh: true,
      };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={styles.content}>
        <Animated.View
          style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name={statusDisplay.icon}
              size={64}
              color={statusDisplay.color}
            />
          </View>
        </Animated.View>

        <Text style={styles.title}>{statusDisplay.title}</Text>
        <Text style={styles.description}>{statusDisplay.description}</Text>
        <Text style={styles.descriptionSub}>
          {statusDisplay.showRefresh
            ? "You will be able to access the dashboard and accept delivery requests once your account is approved."
            : ""}
        </Text>

        <View style={styles.actionContainer}>
          {statusDisplay.showRefresh && (
            <AppButton
              title={isRefreshing ? "Checking status..." : "Refresh Status"}
              onPress={handleRefresh}
              disabled={isRefreshing}
              containerStyle={styles.refreshButton}
              textStyle={styles.refreshText}
            >
              {isRefreshing && (
                <ActivityIndicator
                  size="small"
                  color={colors.white}
                  style={{ marginRight: 8 }}
                />
              )}
            </AppButton>
          )}

          <AppButton
            title="Log Out"
            onPress={handleLogout}
            containerStyle={styles.logoutButton}
            textStyle={styles.logoutText}
            gradientColors={["transparent", "transparent"]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PendingVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: colors.black,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
  },
  descriptionSub: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.text,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  actionContainer: {
    width: "100%",
    gap: 16,
  },
  refreshButton: {
    backgroundColor: colors.primary,
  },
  refreshText: {
    color: colors.white,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: "transparent",
  },
  logoutText: {
    color: colors.danger,
  },
});
