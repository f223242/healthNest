import DeliveryPersonCard, {
    DeliveryPerson,
} from "@/component/DeliveryPersonCard";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { DeliveryInfo, useAuthContext, User } from "@/hooks/useFirebaseAuth";
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
  const [filter, setFilter] = useState<"all" | "available">("all");
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Fetch delivery persons from Firebase
  const fetchDeliveryPersons = useCallback(async () => {
    try {
      const users = await getAllUsers("Medicine Delivery");
      const deliveryData: DeliveryPerson[] = users
        .filter((user: User) => user.profileCompleted && user.additionalInfo)
        .map((user: User, index: number) => {
          const info = user.additionalInfo as DeliveryInfo;
          const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Delivery Person";
          
          // Map availability string to boolean
          const isAvailable = info.availability 
            ? info.availability.toLowerCase() === "available" || 
              info.availability.toLowerCase() === "full-time"
            : false;
          
          return {
            id: index + 1, // DeliveryPersonCard expects number id
            name: fullName,
            avatar: info.profileImage || "https://via.placeholder.com/100",
            rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
            totalDeliveries: Math.floor(Math.random() * 200) + 50, // Random deliveries
            isAvailable,
            deliveryTime: "20-30 min",
            distance: info.city || "N/A",
            vehicleType: info.vehicleType || "N/A",
            vehicleNumber: info.vehicleNumber || "",
            uid: user.uid, // Store actual uid for chat
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

  const filteredPersons = useMemo(() => {
    return deliveryPersons.filter((person) =>
      filter === "available" ? person.isAvailable : true
    );
  }, [deliveryPersons, filter]);

  const availableCount = useMemo(() => {
    return deliveryPersons.filter((p) => p.isAvailable).length;
  }, [deliveryPersons]);

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

  const handleToraChat = () => {
    router.push({
      pathname: "/(protected)/medicine-chat",
      params: { useTora: 'true' }
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
          <Text style={styles.headerTitle}>Request Medicine</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="medical" size={22} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Select a delivery person to chat and request medicine</Text>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <Animated.View 
          style={{ 
            flex: 1, 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }}
        >

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All ({deliveryPersons.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "available" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("available")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "available" && styles.filterTextActive,
            ]}
          >
            Available ({availableCount})
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[appStyles.bodyText, styles.subtitle]}>
        Select a delivery person to chat and request medicine
      </Text>

      <FlatList
        data={filteredPersons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DeliveryPersonCard {...item} onPress={() => handlePersonPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={appStyles.h2}>
              {deliveryPersons.length === 0 
                ? "No delivery persons registered" 
                : "No delivery persons available"}
            </Text>
            <Text style={[appStyles.bodyText, { marginTop: 8 }]}>
              {deliveryPersons.length === 0 
                ? "Check back later for available delivery persons"
                : "Please try again later"}
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 12,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderGray,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  filterTextActive: {
    color: colors.white,
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
