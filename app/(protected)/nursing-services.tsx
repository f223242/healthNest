import { SearchIcon } from "@/assets/svg";
import BookAppointmentModal from "@/component/BookAppointmentModal";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import NurseCard from "@/component/NurseCard";
import StatCard from "@/component/StatCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { NurseInfo, useAuthContext, User } from "@/hooks/useFirebaseAuth";
import AppointmentService from "@/services/AppointmentService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Animated,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type ServiceType = "All" | "Elderly Care" | "Child Care" | "Patient Care" | "Post-Surgery";

// Transform Firebase nurse data to card format
interface NurseCardData {
  id: string;
  name: string;
  specialization: string;
  image: string | null;
  experience: string;
  availability: "Available" | "Busy" | "Offline";
  hourlyRate: string;
  city: string;
  certifications: string;
}

const NursingServices = () => {
  const router = useRouter();
  const { getAllUsers, user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<ServiceType>("All");
  const [nurses, setNurses] = useState<NurseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Appointment booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<NurseCardData | null>(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const filterOptions: Array<{ label: ServiceType; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Elderly Care", icon: "accessibility" },
    { label: "Child Care", icon: "happy" },
    { label: "Patient Care", icon: "medical" },
    { label: "Post-Surgery", icon: "bandage" },
  ];

  // Fetch nurses from Firebase
  const fetchNurses = useCallback(async () => {
    try {
      const users = await getAllUsers("Nurse");
      const nursesData: NurseCardData[] = users
        .filter((user: User) => user.profileCompleted && user.additionalInfo)
        .map((user: User) => {
          const info = user.additionalInfo as NurseInfo;
          const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Nurse";

          // Map availability string to proper type
          let availability: "Available" | "Busy" | "Offline" = "Offline";
          if (info.availability) {
            const avail = info.availability.toLowerCase();
            if (avail === "available" || avail === "full-time" || avail === "part-time") {
              availability = "Available";
            } else if (avail === "busy" || avail === "on-call") {
              availability = "Busy";
            }
          }

          return {
            id: user.uid,
            name: fullName,
            specialization: info.specialization || "General Nursing",
            image: info.profileImage || null,
            experience: info.experience || "N/A",
            availability,
            hourlyRate: info.hourlyRate ? `$${info.hourlyRate}` : "N/A",
            city: info.city || "",
            certifications: info.certifications || "",
          };
        });

      setNurses(nursesData);
    } catch (error) {
      console.error("Error fetching nurses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAllUsers]);

  useEffect(() => {
    fetchNurses();
  }, [fetchNurses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNurses();
  }, [fetchNurses]);

  // Filter nurses based on search and filter
  const filteredNurses = useMemo(() => {
    return nurses.filter((nurse) => {
      const matchesSearch =
        nurse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nurse.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nurse.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === "All" ||
        nurse.specialization.toLowerCase().includes(selectedFilter.toLowerCase());

      return matchesSearch && matchesFilter;
    });
  }, [nurses, searchQuery, selectedFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = nurses.length;
    const available = nurses.filter((n) => n.availability === "Available").length;
    return { total, available };
  }, [nurses]);

  const handleChatPress = (nurse: NurseCardData) => {
    router.push({
      pathname: "/(protected)/nurse-chat-detail",
      params: {
        nurseId: nurse.id,
        nurseName: nurse.name,
        nurseImage: nurse.image || "",
      },
    });
  };

  const handleViewProfile = (nurse: NurseCardData) => {
    router.push({
      pathname: "/(protected)/nurse-profile",
      params: {
        id: nurse.id,
        name: nurse.name,
        specialization: nurse.specialization,
        image: nurse.image || "",
        experience: nurse.experience,
        availability: nurse.availability,
        hourlyRate: nurse.hourlyRate,
        city: nurse.city,
        certifications: nurse.certifications,
      },
    });
  };

  const handleBookAppointment = (nurse: NurseCardData) => {
    console.log("Book button pressed for nurse:", nurse.name);

    if (!user) {
      Alert.alert("Login Required", "Please login to book an appointment");
      return;
    }

    if (nurse.availability !== "Available") {
      Alert.alert(
        "Nurse Unavailable",
        `${nurse.name} is currently marked as ${nurse.availability}. Would you still like to request an appointment?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Request Anyway",
            onPress: () => {
              setSelectedNurse(nurse);
              setShowBookingModal(true);
            },
          },
        ]
      );
      return;
    }

    console.log("Opening booking modal for:", nurse.name);
    setSelectedNurse(nurse);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (appointmentData: {
    date: string;
    time: string;
    serviceType: string;
    notes: string;
    address: string;
    duration: string;
  }) => {
    if (!selectedNurse || !user) return;

    try {
      // Check nurse availability for the selected date/time
      const isAvailable = await AppointmentService.checkNurseAvailability(
        selectedNurse.id,
        appointmentData.date,
        appointmentData.time
      );

      if (!isAvailable) {
        Alert.alert(
          "Time Slot Unavailable",
          "This nurse is already booked for the selected date and time. Please choose a different time."
        );
        return;
      }

      const userName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "User";

      await AppointmentService.createAppointment({
        userId: user.uid,
        nurseId: selectedNurse.id,
        userName,
        nurseName: selectedNurse.name,
        userImage: (user.additionalInfo as any)?.profileImage || "",
        nurseImage: selectedNurse.image || "",
        nurseSpecialization: selectedNurse.specialization,
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        status: "pending",
        serviceType: appointmentData.serviceType,
        notes: appointmentData.notes || "",
        address: appointmentData.address,
        duration: appointmentData.duration,
        hourlyRate: selectedNurse.hourlyRate,
      });

      setShowBookingModal(false);
      setSelectedNurse(null);

      Alert.alert(
        "Appointment Requested",
        `Your appointment request has been sent to ${selectedNurse.name}. You will be notified once they respond.`,
        [
          {
            text: "View Appointments",
            onPress: () => router.push("/(protected)/(tabs)/appointment"),
          },
          { text: "OK" },
        ]
      );
    } catch (error) {
      console.error("Error booking appointment:", error);
      Alert.alert("Error", "Failed to book appointment. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <LinearGradient
          colors={[colors.primary, "#00D68F"]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Loading nurses...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, "#00D68F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
            <View style={styles.headerTitleRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Nursing Services</Text>
              <View style={{ width: 40 }} />
            </View>
            <Text style={styles.headerSubtitle}>Find professional nurses for your care needs</Text>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.container}>
        {/* Search Bar */}
        <Animated.View style={[styles.searchWrapper, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <FormInput
            LeftIcon={SearchIcon}
            placeholder="Search nurses by name or specialization..."
            containerStyle={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        {/* Header Stats */}
        <Animated.View style={[styles.headerStats, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <StatCard
            icon="people"
            value={stats.total}
            label="Total Nurses"
            color={colors.primary}
          />
          <StatCard
            icon="checkmark-circle"
            value={stats.available}
            label="Available Now"
            color={colors.success}
          />
          <StatCard
            icon="star"
            value={stats.total > 0 ? "4.8" : "0"}
            label="Avg Rating"
            color="#FF9800"
          />
        </Animated.View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filterOptions.map((filter) => (
            <FilterChip
              key={filter.label}
              label={filter.label}
              icon={filter.icon}
              isActive={selectedFilter === filter.label}
              onPress={() => setSelectedFilter(filter.label)}

            />
          ))}
        </ScrollView>

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredNurses.length} {filteredNurses.length === 1 ? "Nurse" : "Nurses"} Found
          </Text>
          <TouchableOpacity style={styles.sortButton}>
            <Ionicons name="funnel" size={16} color={colors.primary} />
            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Nurses List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {filteredNurses.length > 0 ? (
            filteredNurses.map((nurse) => (
              <NurseCard
                key={nurse.id}
                id={nurse.id}
                name={nurse.name}
                specialization={nurse.specialization}
                image={nurse.image || ""}
                experience={nurse.experience}
                availability={nurse.availability}
                hourlyRate={nurse.hourlyRate}
                onPress={() => handleViewProfile(nurse)}
                onChatPress={() => handleChatPress(nurse)}
                onBookAppointment={() => handleBookAppointment(nurse)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people" size={64} color={colors.gray} />
              <Text style={styles.emptyTitle}>No Nurses Found</Text>
              <Text style={styles.emptyText}>
                {nurses.length === 0
                  ? "No nurses are registered yet"
                  : "Try adjusting your search or filters"}
              </Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Booking Modal */}
      {selectedNurse && (
        <BookAppointmentModal
          visible={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedNurse(null);
          }}
          onBook={handleConfirmBooking}
          nurseName={selectedNurse.name}
          nurseSpecialization={selectedNurse.specialization}
          hourlyRate={selectedNurse.hourlyRate}
        />
      )}
    </View>
  );
};

export default NursingServices;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerSafeArea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContent: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 10,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    marginTop: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  searchWrapper: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.white,
  },
  searchInput: {
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headerStats: {
    flexDirection: "row",
    paddingBottom: 16,
    gap: 12,
  },
  filtersContainer: {
    paddingBottom: 35,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.text,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
});
