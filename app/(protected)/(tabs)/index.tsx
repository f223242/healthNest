import { SearchIcon } from "@/assets/svg";
import FormInput from "@/component/FormInput";
import ServiceCard from "@/component/ServiceCard";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { PatientInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  const router = useRouter();
  const { user, getAllUsers } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceStats, setServiceStats] = useState({
    nurses: 0,
    labs: 0,
    delivery: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Extract user info
  const userInfo = useMemo(() => {
    const additionalInfo = user?.additionalInfo as PatientInfo | undefined;
    const firstName = user?.firstname || "";
    const lastName = user?.lastname || "";
    const fullName = `${firstName} ${lastName}`.trim() || "User";
    const profileImage = additionalInfo?.profileImage || null;
    
    return {
      fullName,
      firstName,
      profileImage,
    };
  }, [user]);

  // Fetch service provider counts
  const fetchServiceStats = useCallback(async () => {
    try {
      const [nurses, labs, delivery] = await Promise.all([
        getAllUsers("Nurse"),
        getAllUsers("Lab"),
        getAllUsers("Medicine Delivery"),
      ]);
      
      setServiceStats({
        nurses: nurses.filter(u => u.profileCompleted).length,
        labs: labs.filter(u => u.profileCompleted).length,
        delivery: delivery.filter(u => u.profileCompleted).length,
      });
    } catch (error) {
      console.error("Error fetching service stats:", error);
    } finally {
      setRefreshing(false);
    }
  }, [getAllUsers]);

  useEffect(() => {
    fetchServiceStats();
  }, [fetchServiceStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchServiceStats();
  }, [fetchServiceStats]);

  const handleLabPress = () => {
    router.push("/(protected)/select-labs");
  };

  const handleRequestMedicine = () => {
    router.push("/(protected)/request-medicine");
  };

  const handleAIAssistant = () => {
    router.push("/(protected)/general-chat");
  };

  const handleNursingServices = () => {
    router.push("/(protected)/nursing-services");
  };

  const services = [
    {
      id: 1,
      title: "Lab Tests",
      description: "Book diagnostic tests",
      icon: <Ionicons name="flask" size={28} color={colors.primary} />,
      color: "#E8F5F0",
      onPress: handleLabPress,
    },
    {
      id: 2,
      title: "Medicine",
      description: "Order medications",
      icon: <Ionicons name="medkit" size={28} color={colors.primary} />,
      color: "#FFF4E6",
      onPress: handleRequestMedicine,
    },
    {
     id: 3,
     title:"Nursing Services",
     description:"Book nursing care",
     icon:<Ionicons name="people" size={28} color={colors.primary} />,
     color:"#F3E8FF",
     onPress:handleNursingServices
    },
    {
      id: 4,
      title: "AI Assistant",
      description: "Chat with Tora",
      icon: <Ionicons name="chatbubbles" size={28} color={colors.primary} />,
      color: "#E6F3FF",
      onPress: handleAIAssistant,
    },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{userInfo.firstName || userInfo.fullName}</Text>
          </View>
          {userInfo.profileImage ? (
            <Image
              source={{ uri: userInfo.profileImage }}
              style={styles.welcomeAvatar}
            />
          ) : (
            <LinearGradient
              colors={[colors.primary, "#00D68F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.welcomeAvatarPlaceholder}
            >
              <Ionicons name="person" size={24} color={colors.white} />
            </LinearGradient>
          )}
        </View>

        {/* Search Bar */}
        <FormInput
          LeftIcon={SearchIcon}
          placeholder="Search for services, labs, medicines..."
          containerStyle={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Service Stats Cards */}
        <View style={styles.quickInfoContainer}>
          <TouchableOpacity 
            style={[styles.quickInfoCard, { backgroundColor: "#F3E8FF" }]}
            onPress={handleNursingServices}
          >
            <Ionicons name="people" size={20} color="#9C27B0" />
            <Text style={[styles.quickInfoValue, { color: "#9C27B0" }]}>{serviceStats.nurses}</Text>
            <Text style={styles.quickInfoLabel}>Nurses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickInfoCard, { backgroundColor: "#E8F5F0" }]}
            onPress={handleLabPress}
          >
            <Ionicons name="flask" size={20} color={colors.primary} />
            <Text style={[styles.quickInfoValue, { color: colors.primary }]}>{serviceStats.labs}</Text>
            <Text style={styles.quickInfoLabel}>Labs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickInfoCard, { backgroundColor: "#FFF4E6" }]}
            onPress={handleRequestMedicine}
          >
            <Ionicons name="bicycle" size={20} color="#FF9800" />
            <Text style={[styles.quickInfoValue, { color: "#FF9800" }]}>{serviceStats.delivery}</Text>
            <Text style={styles.quickInfoLabel}>Delivery</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Services Grid */}
        <View style={styles.sectionHeader}>
          <Text style={appStyles.h3}>Quick Services</Text>
          <TouchableOpacity>
            <Text style={appStyles.linkText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              icon={service.icon}
              backgroundColor={service.color}
              onPress={service.onPress}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={appStyles.h3}>Quick Actions</Text>
        </View>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push("/(protected)/edit-profile")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + "15" }]}>
              <Ionicons name="person" size={22} color={colors.primary} />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Edit Profile</Text>
              <Text style={styles.quickActionSubtitle}>Update your information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push("/(protected)/(tabs)/madical-record")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "#4CAF50" + "15" }]}>
              <Ionicons name="document-text" size={22} color="#4CAF50" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Medical Records</Text>
              <Text style={styles.quickActionSubtitle}>View your health history</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push("/(protected)/(tabs)/appointment")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "#FF9800" + "15" }]}>
              <Ionicons name="calendar" size={22} color="#FF9800" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Appointments</Text>
              <Text style={styles.quickActionSubtitle}>Manage your bookings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Health Tips Banner */}
        <View style={styles.tipsBanner}>
          <View style={styles.tipsIconContainer}>
            <Text style={styles.tipsIcon}>💡</Text>
          </View>
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Health Tip of the Day</Text>
            <Text style={styles.tipsText}>
              Stay hydrated! Drink at least 8 glasses of water daily for better health.
            </Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: sizes.paddingHorizontal,
    marginTop: 16,
    marginBottom: 16,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  nameText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginTop: 4,
  },
  welcomeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  welcomeAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    marginHorizontal: sizes.paddingHorizontal,
    marginBottom: 20,
  },
  quickInfoContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: sizes.paddingHorizontal,
    marginBottom: 24,
  },
  quickInfoCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 16,
    gap: 6,
  },
  quickInfoValue: {
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  quickInfoLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: sizes.paddingHorizontal,
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: sizes.paddingHorizontal,
    gap: 12,
    marginBottom: 24,
  },
  quickActionsContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    marginBottom: 24,
    gap: 12,
  },
  quickActionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.text,
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
  },
  tipsBanner: {
    flexDirection: "row",
    backgroundColor: colors.lightGreen,
    marginHorizontal: sizes.paddingHorizontal,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tipsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tipsIcon: {
    fontSize: 24,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 18,
  },
});
