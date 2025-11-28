import { appStyles, colors, sizes } from "@/constant/theme";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NotificationSetting {
  id: string;
  category: string;
  options: {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
  }[];
}

const Notifications = () => {
  const [notificationSettings, setNotificationSettings] = useState<
    NotificationSetting[]
  >([
    {
      id: "appointments",
      category: "Appointments",
      options: [
        {
          id: "appointment_reminders",
          title: "Appointment Reminders",
          description: "Get notified about upcoming appointments",
          enabled: true,
        },
        {
          id: "appointment_confirmations",
          title: "Appointment Confirmations",
          description: "Receive confirmation when appointment is booked",
          enabled: true,
        },
        {
          id: "appointment_cancellations",
          title: "Cancellation Alerts",
          description: "Get notified if appointment is cancelled",
          enabled: true,
        },
      ],
    },
    {
      id: "medical",
      category: "Medical Records",
      options: [
        {
          id: "test_results",
          title: "Test Results",
          description: "Notifications when test results are available",
          enabled: true,
        },
        {
          id: "prescription_updates",
          title: "Prescription Updates",
          description: "Updates about your prescriptions",
          enabled: true,
        },
      ],
    },
    {
      id: "general",
      category: "General",
      options: [
        {
          id: "health_tips",
          title: "Health Tips",
          description: "Receive daily health tips and advice",
          enabled: false,
        },
        {
          id: "promotional",
          title: "Promotional Offers",
          description: "Special offers and discounts",
          enabled: false,
        },
        {
          id: "app_updates",
          title: "App Updates",
          description: "Notifications about new features and updates",
          enabled: true,
        },
      ],
    },
  ]);

  const toggleNotification = (categoryId: string, optionId: string) => {
    setNotificationSettings((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              options: category.options.map((option) =>
                option.id === optionId
                  ? { ...option, enabled: !option.enabled }
                  : option
              ),
            }
          : category
      )
    );
  };

  const toggleAllInCategory = (categoryId: string, enabled: boolean) => {
    setNotificationSettings((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              options: category.options.map((option) => ({
                ...option,
                enabled,
              })),
            }
          : category
      )
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Categories */}
        {notificationSettings.map((category) => {
          const allEnabled = category.options.every((opt) => opt.enabled);
          const someEnabled = category.options.some((opt) => opt.enabled);

          return (
            <View key={category.id} style={styles.categoryContainer}>
              {/* Category Header */}
              <View style={styles.categoryHeader}>
                <Text style={appStyles.sectionTitle}>{category.category}</Text>
                <TouchableOpacity
                  onPress={() =>
                    toggleAllInCategory(category.id, !allEnabled)
                  }
                >
                  <Text style={appStyles.linkText}>
                    {allEnabled ? "Disable All" : "Enable All"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Category Options */}
              <View style={{ gap: 12, marginTop: 12 }}>
                {category.options.map((option) => (
                  <View key={option.id} style={styles.optionCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={appStyles.cardTitle}>{option.title}</Text>
                      <Text style={appStyles.body2}>
                        {option.description}
                      </Text>
                    </View>
                    <Switch
                      value={option.enabled}
                      onValueChange={() =>
                        toggleNotification(category.id, option.id)
                      }
                      trackColor={{ false: "#D1D5DB", true: colors.primary + "80" }}
                      thumbColor={option.enabled ? colors.primary : "#F3F4F6"}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Notification Sound & Vibration */}
        <View style={styles.additionalSettings}>
          <Text style={appStyles.sectionTitle}>Additional Settings</Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={appStyles.cardTitle}>Notification Sound</Text>
              <Text style={appStyles.body2}>
                Play sound for notifications
              </Text>
            </View>
            <Switch
              value={true}
              trackColor={{ false: "#D1D5DB", true: colors.primary + "80" }}
              thumbColor={colors.primary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={appStyles.cardTitle}>Vibration</Text>
              <Text style={appStyles.body2}>
                Vibrate for notifications
              </Text>
            </View>
            <Switch
              value={true}
              trackColor={{ false: "#D1D5DB", true: colors.primary + "80" }}
              thumbColor={colors.primary}
            />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={appStyles.bodyText}>
            💡 You can manage system notification permissions from your device
            settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },

  additionalSettings: {
    marginTop: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  infoBox: {
    marginTop: 24,
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 16,
  },
});
