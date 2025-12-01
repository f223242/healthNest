import { SearchIcon } from "@/assets/svg";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import NurseCard from "@/component/NurseCard";
import StatCard from "@/component/StatCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AppointmentStatus = "All" | "Upcoming" | "Completed" | "Cancelled";

interface Appointment {
  id: string;
  type: "Lab Test" | "Nursing" | "Medicine Delivery" | "Consultation";
  title: string;
  provider: string;
  date: string;
  time: string;
  status: "Approved" | "Pending" | "Completed" | "Cancelled";
  image: string;
  location?: string;
  price?: string;
}

const appointmentsData: Appointment[] = [
  {
    id: "1",
    type: "Lab Test",
    title: "Complete Blood Count",
    provider: "LabCorp",
    date: "Nov 28, 2025",
    time: "10:00 AM",
    status: "Approved",
    image: "https://img.freepik.com/free-photo/scientist-laboratory-analyzing-blood-sample_23-2148810467.jpg",
    location: "123 Medical Center",
    price: "$45",
  },
  {
    id: "2",
    type: "Nursing",
    title: "Home Nursing Care",
    provider: "Sarah Johnson",
    date: "Nov 25, 2025",
    time: "2:00 PM",
    status: "Pending",
    image: "https://img.freepik.com/free-photo/portrait-smiling-female-doctor_23-2148316706.jpg",
    location: "Home Visit",
    price: "$80",
  },
  {
    id: "3",
    type: "Lab Test",
    title: "Lipid Profile",
    provider: "Quest Diagnostics",
    date: "Nov 20, 2025",
    time: "9:30 AM",
    status: "Completed",
    image: "https://img.freepik.com/free-photo/medical-technology-lab-science_23-2148896574.jpg",
    location: "456 Health Plaza",
    price: "$60",
  },
  {
    id: "4",
    type: "Medicine Delivery",
    title: "Prescription Medicines",
    provider: "MedExpress",
    date: "Nov 26, 2025",
    time: "4:00 PM",
    status: "Approved",
    image: "https://img.freepik.com/free-photo/pharmacist-checking-medication_23-2149355201.jpg",
    location: "Home Delivery",
    price: "$120",
  },
  {
    id: "5",
    type: "Consultation",
    title: "General Checkup",
    provider: "Dr. Michael Chen",
    date: "Nov 18, 2025",
    time: "11:00 AM",
    status: "Completed",
    image: "https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg",
    location: "Clinic Room 3",
    price: "$100",
  },
  {
    id: "6",
    type: "Lab Test",
    title: "Thyroid Function Test",
    provider: "Mayo Clinic Labs",
    date: "Nov 15, 2025",
    time: "8:00 AM",
    status: "Cancelled",
    image: "https://img.freepik.com/free-photo/scientist-laboratory-analyzing-blood-sample_23-2148810467.jpg",
    location: "789 Wellness Center",
    price: "$55",
  },
];

const Appointment = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<AppointmentStatus>("All");

  const filterOptions: Array<{ label: AppointmentStatus; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Upcoming", icon: "time" },
    { label: "Completed", icon: "checkmark-circle" },
    { label: "Cancelled", icon: "close-circle" },
  ];

  const filteredAppointments = appointmentsData
    .filter((appointment) => {
      const matchesSearch =
        appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.provider.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === "All" ||
        (selectedFilter === "Upcoming" && (appointment.status === "Approved" || appointment.status === "Pending")) ||
        (selectedFilter === "Completed" && appointment.status === "Completed") ||
        (selectedFilter === "Cancelled" && appointment.status === "Cancelled");

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "Approved":
        return colors.success;
      case "Pending":
        return colors.warning;
      case "Completed":
        return colors.primary;
      case "Cancelled":
        return colors.danger;
    }
  };

  const getTypeIcon = (type: Appointment["type"]) => {
    switch (type) {
      case "Lab Test":
        return "flask";
      case "Nursing":
        return "medical";
      case "Medicine Delivery":
        return "medkit";
      case "Consultation":
        return "person";
    }
  };

  const upcomingCount = appointmentsData.filter(a => a.status === "Approved" || a.status === "Pending").length;
  const completedCount = appointmentsData.filter(a => a.status === "Completed").length;
  const pendingCount = appointmentsData.filter(a => a.status === "Pending").length;

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* Search Bar */}
      <FormInput
        LeftIcon={SearchIcon}
        placeholder="Search appointments..."
        containerStyle={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="calendar"
          value={upcomingCount}
          label="Upcoming"
          color={colors.primary}
        />
        <StatCard
          icon="hourglass"
          value={pendingCount}
          label="Pending"
          color={colors.warning}
        />
        <StatCard
          icon="checkmark-done"
          value={completedCount}
          label="Completed"
          color={colors.success}
        />
      </View>

      {/* Filter Chips */}
      <View >      
        <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
       
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
      </View>


      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredAppointments.length} {filteredAppointments.length === 1 ? "Appointment" : "Appointments"}
        </Text>
      </View>

      {/* Appointments List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <NurseCard
              key={appointment.id}
              name={appointment.title}
              specialization={appointment.provider}
              image={appointment.image}
              statusBadge={{
                label: appointment.status,
                color: getStatusColor(appointment.status),
              }}
              details={[
                {
                  icon: "calendar-outline",
                  text: appointment.date,
                  color: colors.primary,
                },
                {
                  icon: "time-outline",
                  text: appointment.time,
                  color: colors.primary,
                },
              ]}
              location={appointment.location}
              price={appointment.price}
              actions={[
                ...(appointment.status === "Approved"
                  ? [
                      {
                        label: "Contact",
                        icon: "call" as const,
                        onPress: () => console.log("Contact", appointment.id),
                      },
                    ]
                  : []),
                {
                  label: "View Details",
                  icon: "chevron-forward" as const,
                  onPress: () => console.log("View Details", appointment.id),
                  isPrimary: true,
                },
              ]}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>No Appointments Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Appointment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  searchInput: {
    marginTop: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  resultsHeader: {
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  scrollContent: {
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
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
});
