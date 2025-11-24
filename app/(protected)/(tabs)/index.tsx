import { NurseIcon, SearchIcon } from "@/assets/svg";
import FormInput from "@/component/FormInput";
import LabCard from "@/component/LabCard";
import ServiceCard from "@/component/ServiceCard";
import StatCard from "@/component/StatCard";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const data = [
  {
    id: 1,
    name: "LabCorp",
    description: "Comprehensive lab testing services",
    image: require("@/assets/png/labcorp.png"),
    rating: 4.5,
    review: "120 + reviews",
  },
  {
    id: 2,
    name: "Quest Diagnostics",
    description: "Advanced diagnostic testing services",
    image: require("@/assets/png/quest.png"),
    rating: 4.2,
    review: "98 reviews",
  },
  {
    id: 3,
    name: "BioReference Laboratories",
    description: "Comprehensive diagnostic testing services",
    image: require("@/assets/png/labcorp.png"),
    rating: 4.0,
    review: "75 reviews",
  },
  {
    id: 4,
    name: "Mayo Clinic Laboratories",
    description: "Leading provider of clinical laboratory services",
    image: require("@/assets/png/labcorp.png"),
    rating: 4.7,
    review: "150 reviews",
  },
];

const index = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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
      icon: "🔬",
      color: "#E8F5F0",
      onPress: handleLabPress,
    },
    {
      id: 2,
      title: "Medicine",
      description: "Order medications",
      icon: "💊",
      color: "#FFF4E6",
      onPress: handleRequestMedicine,
    },
    {
     id: 3,
     title:"Nursing Services",
     description:"Book nursing care",
     icon:<NurseIcon width={28} height={28} />,
     color:"#F3E8FF",
     onPress:handleNursingServices
    },
    {
      id: 4,
      title: "AI Assistant",
      description: "Chat with Tora",
      icon: "🤖",
      color: "#E6F3FF",
      onPress: handleAIAssistant,
    },
  ];

  const stats = [
    { label: "Active Tests", value: "3", color: colors.primary, icon: "flask-outline" as const },
    { label: "Appointments", value: "2", color: "#FF9800", icon: "calendar-outline" as const },
    { label: "Reports Ready", value: "5", color: "#4CAF50", icon: "document-text-outline" as const },
  ];

  return (
    <SafeAreaView edges={[]} style={styles.container}>
      
        {/* Search Bar */}
        <FormInput
          LeftIcon={SearchIcon}
          placeholder="Search for services, labs, medicines..."
          containerStyle={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
      >
        


        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              icon={stat.icon}
            />
          ))}
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

        {/* Associated Labs */}
        <View style={styles.sectionHeader}>
          <Text style={appStyles.h3}>Top Rated Labs</Text>
          <TouchableOpacity onPress={handleLabPress}>
            <Text style={appStyles.linkText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <LabCard {...item} onPress={handleLabPress} />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          style={styles.flatList}
          snapToInterval={sizes.width - sizes.paddingHorizontal * 2}
          decelerationRate="fast"
          pagingEnabled={false}
        />

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
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  greetingText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  userName: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginTop: 4,
  },
  searchInput: {
    marginHorizontal: sizes.paddingHorizontal,
    marginTop: 16,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: sizes.paddingHorizontal,
    marginBottom: 24,
    marginTop: 8,
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
  flatList: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 24,
  },
  flatListContent: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 4,
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
