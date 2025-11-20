import DataManagement from "@/component/DataManagement";
import PrivacyControl from "@/component/PrivacyControl";
import PrivacyInfoCard from "@/component/PrivacyInfoCard";
import { appStyles, colors, sizes } from "@/constant/theme";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface PrivacyOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const Privacy = () => {
  const [privacySettings, setPrivacySettings] = useState<PrivacyOption[]>([
    
  
    {
      id: "location_access",
      title: "Location Access",
      description: "Allow app to access your location for nearby services",
      enabled: false,
    },
    {
      id: "activity_status",
      title: "Activity Status",
      description: "Show when you're active on the app",
      enabled: true,
    },
    {
      id: "data_analytics",
      title: "Data Analytics",
      description: "Help us improve by sharing anonymous usage data",
      enabled: false,
    },
  ]);

  const toggleSetting = (id: string) => {
    setPrivacySettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      "Download Data",
      "Your data will be prepared and sent to your email address.",
      [{ text: "OK" }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Account deleted") },
      ]
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={appStyles.sectionTitle}>Privacy Controls</Text>

        {/* Privacy Options */}
        <View style={{ gap: 16, marginTop: 16 }}>
          {privacySettings.map((setting) => (
            <PrivacyControl
              key={setting.id}
              title={setting.title}
              description={setting.description}
              enabled={setting.enabled}
              onToggle={() => toggleSetting(setting.id)}
            />
          ))}
        </View>

        {/* Additional Privacy Info */}
        <PrivacyInfoCard />

        {/* Data Management */}
        <DataManagement
          onDownloadData={handleDownloadData}
          onDeleteAccount={handleDeleteAccount}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Privacy;

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
});
