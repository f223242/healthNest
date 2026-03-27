import DeliveryFilterButtons from "@/component/DeliveryFilterButtons";
import DeliveryPersonCard, {
    DeliveryPerson,
} from "@/component/DeliveryPersonCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { DeliveryInfo, useAuthContext, User } from "@/hooks/useFirebaseAuth";
import AppointmentService from "@/services/AppointmentService";
import FeedbackComplaintService from "@/services/FeedbackComplaintService";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RequestLabHomeService = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { labId, labName } = params;
  const { getAllUsers, user } = useAuthContext();
  const [filter, setFilter] = useState<"all" | "available">("all");
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeAppointments, setActiveAppointments] = useState<Set<string>>(
    new Set(),
  );

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

  // Listen to user's active lab delivery appointments
  useEffect(() => {
    if (!user) return;

    const unsubscribe = AppointmentService.listenToUserAppointments(
      user.uid,
      (appointments) => {
        // Get delivery persons with accepted appointments
        const activeDeliveryIds = new Set<string>();
        appointments.forEach((apt) => {
          if (
            apt.providerType === "delivery" &&
            apt.status === "accepted" &&
            apt.deliveryId
          ) {
            activeDeliveryIds.add(apt.deliveryId);
          }
        });
        setActiveAppointments(activeDeliveryIds);
      },
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch lab delivery boys from Firebase with dynamic ratings
  const fetchLabDeliveryPersons = useCallback(async () => {
    try {
      // Get all users with delivery role and lab delivery type
      const users = await getAllUsers("Lab Delivery");
      const deliveryData: DeliveryPerson[] = await Promise.all(
        users
          .filter((user: User) => user.profileCompleted && user.additionalInfo)
          .map(async (user: User, index: number) => {
            const info = user.additionalInfo as DeliveryInfo;
            const fullName =
              `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
              "Lab Delivery Person";

            // Default available UNLESS explicitly marked as unavailable
            const isAvailable =
              !info.availability ||
              (info.availability.toLowerCase() !== "unavailable" &&
                info.availability.toLowerCase() !== "part-time");

            // Fetch real ratings from Firebase
            let rating = 0;
            let totalDeliveries = 0;
            try {
              const ratingStats =
                await FeedbackComplaintService.getProviderRatingStats(user.uid);
              rating = ratingStats.averageRating || 0;
              // Use reviews count as proxy for deliveries
              totalDeliveries = ratingStats.totalReviews || 0;
            } catch (err) {
              console.log("No ratings for lab delivery person:", user.uid);
            }

            return {
              id: index + 1,
              name: fullName,
              avatar: info.profileImage || "https://via.placeholder.com/100",
              rating,
              totalDeliveries,
              isAvailable,
              deliveryTime: "15-25 min",
              distance: info.city || "N/A",
              vehicleType: info.vehicleType || "Bike",
              vehicleNumber: info.vehicleNumber || "",
              deliveryType: (user as any).deliveryType || "lab",
              qualification: (user as any).qualification || "",
              uid: user.uid,
            };
          }),
      );

      setDeliveryPersons(deliveryData);
    } catch (error) {
      console.error("Error fetching lab delivery persons:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAllUsers]);

  useEffect(() => {
    fetchLabDeliveryPersons();
  }, [fetchLabDeliveryPersons]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLabDeliveryPersons();
  }, [fetchLabDeliveryPersons]);

  // Filter delivery persons
  const filteredDeliveryPersons = useMemo(() => {
    if (filter === "available") {
      return deliveryPersons.filter(
        (p) => p.isAvailable && !activeAppointments.has(p.uid),
      );
    }
    return deliveryPersons;
  }, [deliveryPersons, filter, activeAppointments]);

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (filteredDeliveryPersons.length === 0) return 0;
    const sum = filteredDeliveryPersons.reduce((acc, p) => acc + p.rating, 0);
    return (sum / filteredDeliveryPersons.length).toFixed(1);
  }, [filteredDeliveryPersons]);

  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading lab delivery persons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Gradient Header */}
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
          <View>
            <Text style={styles.headerTitle}>Lab Home Service</Text>
            {labName && <Text style={styles.headerSubtitle}>{labName}</Text>}
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="home" size={22} color="rgba(255,255,255,0.9)" />
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
          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <DeliveryFilterButtons
              activeFilter={filter}
              onFilterChange={setFilter}
            />
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {filteredDeliveryPersons.length}
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{averageRating}★</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>

          {filteredDeliveryPersons.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="sad-outline" size={60} color={colors.lightGray} />
              <Text style={styles.emptyStateTitle}>
                No Lab Delivery Available
              </Text>
              <Text style={styles.emptyStateText}>
                No lab delivery persons are currently available in your area.
                Please try again later.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredDeliveryPersons}
              keyExtractor={(item) => item.uid}
              renderItem={({ item }) => (
                <DeliveryPersonCard
                  {...item}
                  onPress={() => {
                    // Navigate to booking with selected lab delivery person
                    router.push({
                      pathname: "/(protected)/lab-booking-form",
                      params: {
                        labId,
                        labName,
                        deliveryPersonId: item.uid,
                        deliveryPersonName: item.name,
                        serviceMode: "home",
                        serviceType: "lab",
                      },
                    });
                  }}
                  isActive={activeAppointments.has(item.uid)}
                />
              )}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => (
                <View style={styles.itemSeparator} />
              )}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                />
              }
            />
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  headerGradient: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    paddingTop: 20,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 12,
    marginTop: 2,
  },
  headerIcon: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 0,
  },
  filterContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: sizes.paddingHorizontal,
    paddingBottom: 12,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.grayText,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 8,
    paddingBottom: 24,
  },
  itemSeparator: {
    height: 12,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: sizes.paddingHorizontal,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.textDark,
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.grayText,
    textAlign: "center",
    marginTop: 8,
  },
});

export default RequestLabHomeService;
