import AppButton from "@/component/AppButton";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LabService {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
  popular?: boolean;
}

const servicesData: LabService[] = [
  {
    id: 1,
    name: "Complete Blood Count (CBC)",
    description: "Measures different components of blood",
    price: "$35",
    duration: "24 hours",
    category: "Blood Test",
    popular: true,
  },
  {
    id: 2,
    name: "Lipid Panel",
    description: "Cholesterol and triglycerides test",
    price: "$45",
    duration: "24 hours",
    category: "Blood Test",
    popular: true,
  },
  {
    id: 3,
    name: "Thyroid Function Test",
    description: "TSH, T3, T4 levels test",
    price: "$55",
    duration: "48 hours",
    category: "Hormone Test",
  },
  {
    id: 4,
    name: "Diabetes Screening",
    description: "Fasting glucose and HbA1c test",
    price: "$40",
    duration: "24 hours",
    category: "Blood Test",
    popular: true,
  },
  {
    id: 5,
    name: "Liver Function Test",
    description: "AST, ALT, ALP, bilirubin levels",
    price: "$50",
    duration: "48 hours",
    category: "Blood Test",
  },
  {
    id: 6,
    name: "Kidney Function Test",
    description: "Creatinine, BUN, eGFR test",
    price: "$48",
    duration: "48 hours",
    category: "Blood Test",
  },
  {
    id: 7,
    name: "Vitamin D Test",
    description: "25-hydroxyvitamin D levels",
    price: "$60",
    duration: "3-5 days",
    category: "Vitamin Test",
  },
  {
    id: 8,
    name: "Iron Studies",
    description: "Serum iron, ferritin, TIBC test",
    price: "$52",
    duration: "48 hours",
    category: "Blood Test",
  },
  {
    id: 9,
    name: "Urine Analysis",
    description: "Complete urinalysis test",
    price: "$25",
    duration: "12 hours",
    category: "Urine Test",
  },
  {
    id: 10,
    name: "COVID-19 PCR Test",
    description: "RT-PCR test for COVID-19",
    price: "$75",
    duration: "6-12 hours",
    category: "Infectious Disease",
    popular: true,
  },
];

const LabServices = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { labId, labName } = params;

  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [serviceMode, setServiceMode] = useState<"center" | "home" | null>(
    null,
  );

  // Animation refs
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

  const categories = [
    "All",
    ...Array.from(new Set(servicesData.map((s) => s.category))),
  ];

  const filteredServices =
    selectedCategory === "All"
      ? servicesData
      : servicesData.filter((s) => s.category === selectedCategory);

  const toggleService = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const handleContinue = () => {
    const services = servicesData.filter((s) =>
      selectedServices.includes(s.id),
    );
    router.push({
      pathname: "/(protected)/lab-booking-form",
      params: {
        labId,
        labName,
        selectedServices: JSON.stringify(services),
      },
    });
  };

  const calculateTotal = () => {
    return servicesData
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + parseInt(s.price.replace("$", "")), 0);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Premium Gradient Header */}
      <LinearGradient
        colors={[colors.primary, "#00C853"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Lab Services</Text>
            {labName && <Text style={styles.headerSubtitle}>{labName}</Text>}
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="flask" size={22} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Service Mode Selection */}
          {!serviceMode ? (
            <View style={styles.serviceModeContainer}>
              <Text style={styles.serviceModeTitle}>Select Service Type</Text>
              <View style={styles.serviceModeButtonsRow}>
                <TouchableOpacity
                  style={styles.serviceModeButton}
                  onPress={() => setServiceMode("center")}
                >
                  <Ionicons name="business" size={32} color={colors.primary} />
                  <Text style={styles.serviceModeButtonText}>
                    Lab at Center
                  </Text>
                  <Text style={styles.serviceModeButtonSubtext}>
                    Visit our lab
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceModeButton}
                  onPress={() => {
                    // Navigate to lab delivery person selection
                    router.push({
                      pathname: "/(protected)/request-lab-home-service",
                      params: {
                        labId,
                        labName,
                      },
                    });
                  }}
                >
                  <Ionicons name="home" size={32} color="#4CAF50" />
                  <Text
                    style={[styles.serviceModeButtonText, { color: "#4CAF50" }]}
                  >
                    Home Service
                  </Text>
                  <Text style={styles.serviceModeButtonSubtext}>
                    Sample at home
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Category Filter */}
              <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      onPress={() => setSelectedCategory(category)}
                      style={[
                        styles.categoryChip,
                        selectedCategory === category &&
                          styles.categoryChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          selectedCategory === category &&
                            styles.categoryTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Services List */}
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {filteredServices.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    activeOpacity={0.8}
                    onPress={() => toggleService(service.id)}
                    style={[
                      styles.serviceCard,
                      selectedServices.includes(service.id) &&
                        styles.serviceCardSelected,
                    ]}
                  >
                    <View style={styles.serviceHeader}>
                      <View style={styles.serviceInfo}>
                        <View style={styles.serviceTitleRow}>
                          <Text style={appStyles.cardTitle}>
                            {service.name}
                          </Text>
                          {service.popular && (
                            <View style={styles.popularBadge}>
                              <Text style={styles.popularText}>Popular</Text>
                            </View>
                          )}
                        </View>
                        <Text style={appStyles.bodyText}>
                          {service.description}
                        </Text>

                        <View style={styles.serviceMeta}>
                          <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Duration:</Text>
                            <Text style={styles.metaValue}>
                              {service.duration}
                            </Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Category:</Text>
                            <Text style={styles.metaValue}>
                              {service.category}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.servicePricing}>
                        <Text style={styles.servicePrice}>{service.price}</Text>
                        <View
                          style={[
                            styles.checkbox,
                            selectedServices.includes(service.id) &&
                              styles.checkboxSelected,
                          ]}
                        >
                          {selectedServices.includes(service.id) && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Bottom Summary */}
              {selectedServices.length > 0 && (
                <View style={styles.bottomContainer}>
                  <View style={styles.summaryRow}>
                    <Text style={appStyles.bodyText}>
                      {selectedServices.length} test
                      {selectedServices.length > 1 ? "s" : ""} selected
                    </Text>
                    <Text style={styles.totalPrice}>
                      Total: ${calculateTotal()}
                    </Text>
                  </View>
                  <AppButton
                    title="Continue to Booking"
                    onPress={handleContinue}
                  />
                </View>
              )}
            </>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default LabServices;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  serviceModeContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 24,
  },
  serviceModeTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.textDark,
    marginBottom: 16,
  },
  serviceModeButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  serviceModeButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceModeButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
    marginTop: 8,
    textAlign: "center",
  },
  serviceModeButtonSubtext: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.grayText,
    marginTop: 4,
    textAlign: "center",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  categoryContainer: {
    paddingVertical: 12,
    paddingLeft: sizes.paddingHorizontal,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  categoryTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: sizes.paddingHorizontal,
  },
  serviceCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.borderGray,
  },
  serviceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.lightGreen,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  popularBadge: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  popularText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  serviceMeta: {
    marginTop: 10,
    gap: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.gray,
    marginRight: 6,
  },
  metaValue: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  servicePricing: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  servicePrice: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.primary,
    marginBottom: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.borderGray,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  bottomContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalPrice: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
});
