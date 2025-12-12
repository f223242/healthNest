import { db } from "@/config/firebase";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AvailabilityToggle = () => {
  const { user } = useAuthContext();
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch current availability status on mount
  useEffect(() => {
    fetchAvailabilityStatus();
  }, []);

  const fetchAvailabilityStatus = async () => {
    try {
      if (!user?.uid) return;

      const docRef = doc(db, "deliveryPersons", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsAvailable(data.isAvailableToday || false);
        if (data.lastAvailabilityUpdate) {
          setLastUpdated(data.lastAvailabilityUpdate.toDate());
        }
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      Alert.alert("Error", "Failed to fetch availability status");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      if (!user?.uid) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      setLoading(true);
      const newStatus = !isAvailable;

      const docRef = doc(db, "deliveryPersons", user.uid);
      await setDoc(
        docRef,
        {
          isAvailableToday: newStatus,
          lastAvailabilityUpdate: Timestamp.now(),
          uid: user.uid,
          name: user.firstname,
        },
        { merge: true }
      );

      setIsAvailable(newStatus);
      setLastUpdated(new Date());

      Alert.alert(
        "Success",
        `You are now ${newStatus ? "Available" : "Unavailable"} today`,
        [{ text: "OK", onPress: () => {} }]
      );
    } catch (error) {
      console.error("Error updating availability:", error);
      Alert.alert("Error", "Failed to update availability status");
    } finally {
      setLoading(false);
    }
  };

  const getTimeString = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <LinearGradient
        colors={[colors.primary, "#00B976"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Daily Availability</Text>
        <Text style={styles.headerSubtitle}>Manage your availability for today</Text>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.content}>
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: isAvailable ? colors.success : colors.gray,
              },
            ]}
          >
            <Ionicons
              name={isAvailable ? "checkmark" : "close"}
              size={32}
              color={colors.white}
            />
          </View>

          <Text style={styles.statusText}>
            {isAvailable ? "You are Available" : "You are Unavailable"}
          </Text>

          <Text style={styles.statusDescription}>
            {isAvailable
              ? "Patients can request medicines from you"
              : "You won't receive any medicine requests"}
          </Text>

          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              Last updated: {getTimeString(lastUpdated)}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.toggleButton,
              {
                backgroundColor: isAvailable
                  ? colors.danger || "#FF6B6B"
                  : colors.success,
              },
            ]}
            onPress={toggleAvailability}
            disabled={loading}
          >
            <Text style={styles.toggleButtonText}>
              {loading
                ? "Updating..."
                : isAvailable
                ? "Mark as Unavailable"
                : "Mark as Available"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Daily Reset</Text>
              <Text style={styles.infoDescription}>
                Your availability status resets every day at midnight
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="notifications" size={24} color={colors.primary} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Get Notifications</Text>
              <Text style={styles.infoDescription}>
                You'll be notified when patients request your service
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default AvailabilityToggle;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "rgba(255,255,255,0.9)",
  },
  content: {
    flex: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 24,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statusText: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginBottom: 16,
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  toggleButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  infoSection: {
    gap: 12,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 16,
  },
});