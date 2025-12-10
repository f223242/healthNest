import DataManagement from "@/component/DataManagement";
import PrivacyControl from "@/component/PrivacyControl";
import PrivacyInfoCard from "@/component/PrivacyInfoCard";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
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
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={[colors.primary, '#00C853']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Settings</Text>
          <View style={{ width: 44 }} />
        </View>
      </LinearGradient>

      {/* Content Area */}
      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
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
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Privacy;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: sizes.paddingHorizontal,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
  },

  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 24,
    paddingBottom: 40,
  },
});
