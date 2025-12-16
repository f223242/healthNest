import DeliveryFilterButtons from "@/component/DeliveryFilterButtons";
import DeliveryPersonCard, { DeliveryPerson } from "@/component/DeliveryPersonCard";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { DeliveryInfo, useAuthContext, User } from "@/hooks/useFirebaseAuth";
import {
  getRecommendedDeliveryPersons,
  isDeliveryPersonRecommended,
} from "@/utils/deliveryRecommendation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const RequestMedicine = () => {
  const router = useRouter();
  const { getAllUsers } = useAuthContext();
  const [filter, setFilter] = useState<"all" | "available" | "recommended">("all");
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Fetch delivery persons from Firebase
  const fetchDeliveryPersons = useCallback(async () => {
    try {
      const users = await getAllUsers("Medicine Delivery");
      const deliveryData: DeliveryPerson[] = users
        .filter((user: User) => user.profileCompleted && user.additionalInfo)
        .map((user: User, index: number) => {
          const info = user.additionalInfo as DeliveryInfo;
          const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Delivery Person";

          // Default available UNLESS explicitly marked as unavailable
          const isAvailable =
            !info.availability ||
            (info.availability.toLowerCase() !== "unavailable" &&
              info.availability.toLowerCase() !== "part-time");

          return {
            id: index + 1,
            name: fullName,
            avatar: info.profileImage || "https://via.placeholder.com/100",
            rating: 4.5 + Math.random() * 0.5,
            totalDeliveries: Math.floor(Math.random() * 200) + 50,
            isAvailable,
            deliveryTime: "20-30 min",
            distance: info.city || "N/A",
            vehicleType: info.vehicleType || "N/A",
            vehicleNumber: info.vehicleNumber || "",
            uid: user.uid,
          };
        });

      setDeliveryPersons(deliveryData);
    } catch (error) {
      console.error("Error fetching delivery persons:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAllUsers]);

  useEffect(() => {
    fetchDeliveryPersons();
  }, [fetchDeliveryPersons]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDeliveryPersons();
  }, [fetchDeliveryPersons]);

  // Get recommended list (Top 3 by totalDeliveries)
  const recommendedList = useMemo(
    () => getRecommendedDeliveryPersons(deliveryPersons),
    [deliveryPersons]
  );

  // Filter based on active filter
  const filteredPersons = useMemo(() => {
    console.log("Filter:", filter, "Count:", deliveryPersons.length);
    switch (filter) {
      case "available":
        const available = deliveryPersons.filter((p) => p.isAvailable);
        console.log("Available count:", available.length);
        return available;
      case "recommended":
        console.log("Recommended count:", recommendedList.length);
        return recommendedList;
      case "all":
      default:
        return deliveryPersons;
    }
  }, [filter, deliveryPersons, recommendedList]);

  const handlePersonPress = (person: DeliveryPerson & { uid?: string }) => {
    router.push({
      pathname: "/(protected)/delivery-chat-detail",
      params: {
        deliveryId: person.uid || person.id.toString(),
        deliveryName: person.name,
        deliveryAvatar: person.avatar,
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading delivery persons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <LinearGradient
        colors={[colors.primary, "#00B976", "#00D68F"]}
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
          <Text style={styles.headerTitle}>Request Medicine</Text>
          <View style={styles.headerIcon}>
            <Ionicons
              name="medical"
              size={22}
              color="rgba(255,255,255,0.9)"
            />
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Select a delivery person to chat and request medicine
        </Text>
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
          <DeliveryFilterButtons
            activeFilter={filter}
            onFilterChange={(newFilter) => setFilter(newFilter)}
          />

          {/* Results Counter */}
          <Text style={[appStyles.bodyText, styles.subtitle]}>
            Showing {filteredPersons.length} delivery person
            {filteredPersons.length !== 1 ? "s" : ""}
          </Text>

          {/* Delivery List */}
          <FlatList
            data={filteredPersons}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <DeliveryPersonCard
                {...item}
                isRecommended={isDeliveryPersonRecommended(
                  item,
                  recommendedList
                )}
                onPress={() => handlePersonPress(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={appStyles.h2}>
                  {deliveryPersons.length === 0
                    ? "No delivery persons registered"
                    : filter === "available"
                    ? "No available delivery persons"
                    : filter === "recommended"
                    ? "No recommended delivery persons"
                    : "No delivery persons found"}
                </Text>
              </View>
            }
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default RequestMedicine;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
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
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
    textAlign: "center",
    marginRight: 40,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  subtitle: {
    paddingHorizontal: sizes.paddingHorizontal,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
});