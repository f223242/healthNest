import { SearchIcon } from "@/assets/svg";
import FormInput from "@/component/FormInput";
import PremiumActionCard from "@/component/PremiumActionCard";
import SectionHeader from "@/component/SectionHeader";
import ServiceCard from "@/component/ServiceCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { PatientInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from 'react-native-animatable';
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
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, '#00D68F'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animatable.View animation="fadeInDown" duration={600} style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{userInfo.firstName || userInfo.fullName}</Text>
          </View>
          {userInfo.profileImage ? (
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: userInfo.profileImage }}
                style={styles.welcomeAvatar}
              />
            </View>
          ) : (
            <View style={styles.avatarContainer}>
              <View style={styles.welcomeAvatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {(userInfo.firstName || userInfo.fullName).substring(0, 2).toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        </Animatable.View>

        {/* Stats in Header */}
        <Animatable.View animation="fadeInUp" delay={100} style={styles.headerStats}>
          <TouchableOpacity style={styles.headerStatItem} onPress={handleNursingServices}>
            <View style={styles.headerStatIcon}>
              <Ionicons name="people-outline" size={18} color={colors.white} />
            </View>
            <Text style={styles.headerStatValue}>{serviceStats.nurses}</Text>
            <Text style={styles.headerStatLabel}>Nurses</Text>
          </TouchableOpacity>
          
          <View style={styles.headerStatDivider} />
          
          <TouchableOpacity style={styles.headerStatItem} onPress={handleLabPress}>
            <View style={styles.headerStatIcon}>
              <Ionicons name="flask-outline" size={18} color={colors.white} />
            </View>
            <Text style={styles.headerStatValue}>{serviceStats.labs}</Text>
            <Text style={styles.headerStatLabel}>Labs</Text>
          </TouchableOpacity>
          
          <View style={styles.headerStatDivider} />
          
          <TouchableOpacity style={styles.headerStatItem} onPress={handleRequestMedicine}>
            <View style={styles.headerStatIcon}>
              <Ionicons name="bicycle-outline" size={18} color={colors.white} />
            </View>
            <Text style={styles.headerStatValue}>{serviceStats.delivery}</Text>
            <Text style={styles.headerStatLabel}>Delivery</Text>
          </TouchableOpacity>
        </Animatable.View>
      </LinearGradient>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Search Bar */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <FormInput
            LeftIcon={SearchIcon}
            placeholder="Search for services, labs, medicines..."
            containerStyle={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animatable.View>

        {/* Quick Services Grid */}
        <Animatable.View animation="fadeInUp" delay={300}>
          <SectionHeader 
            title="Quick Services" 
            icon="grid"
            action="See All"
            style={{ paddingHorizontal: sizes.paddingHorizontal }}
          />
        </Animatable.View>

        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <Animatable.View 
              key={service.id} 
              animation="fadeInUp" 
              delay={350 + index * 50}
              style={styles.serviceCardWrapper}
            >
              <ServiceCard
                title={service.title}
                description={service.description}
                icon={service.icon}
                backgroundColor={service.color}
                onPress={service.onPress}
              />
            </Animatable.View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <SectionHeader 
            title="Quick Actions" 
            icon="flash"
            animation="fadeInUp"
            delay={500}
          />

          <PremiumActionCard
            title="Edit Profile"
            subtitle="Update your personal information"
            icon="person"
            gradient
            onPress={() => router.push("/(protected)/edit-profile")}
            animation="fadeInUp"
            delay={550}
          />

          <PremiumActionCard
            title="Medical Records"
            subtitle="View your complete health history"
            icon="document-text"
            color="#4CAF50"
            onPress={() => router.push("/(protected)/(tabs)/madical-record")}
            animation="fadeInUp"
            delay={600}
          />

          <PremiumActionCard
            title="Appointments"
            subtitle="Manage your upcoming bookings"
            icon="calendar"
            color="#FF9800"
            onPress={() => router.push("/(protected)/(tabs)/appointment")}
            animation="fadeInUp"
            delay={650}
          />
        </View>

        {/* Health Tips Banner */}
        <Animatable.View animation="fadeInUp" delay={700} style={styles.tipsContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tipsBanner}
          >
            <View style={styles.tipsIconContainer}>
              <Ionicons name="bulb" size={28} color="#FFD700" />
            </View>
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Health Tip of the Day</Text>
              <Text style={styles.tipsText}>
                Stay hydrated! Drink at least 8 glasses of water daily for better health.
              </Text>
            </View>
          </LinearGradient>
        </Animatable.View>

        <View style={{ height: 20 }} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  scrollView: {
    flex: 1,
    marginTop: -15,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 120,
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.85)',
  },
  nameText: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginTop: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  welcomeAvatar: {
    width: '100%',
    height: '100%',
  },
  welcomeAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  headerStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  headerStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerStatValue: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  headerStatLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchInput: {
    marginHorizontal: sizes.paddingHorizontal,
    marginBottom: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: sizes.paddingHorizontal,
    gap: 12,
    marginBottom: 24,
  },
  serviceCardWrapper: {
    width: '47%',
  },
  actionsSection: {
    paddingHorizontal: sizes.paddingHorizontal,
    marginBottom: 24,
  },
  tipsContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
  },
  tipsBanner: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  tipsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  tipsContent: {
    flex: 1,
    justifyContent: 'center',
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.white,
    marginBottom: 6,
  },
  tipsText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
});
