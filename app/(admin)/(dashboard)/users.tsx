import AdminTable, { TableColumn } from "@/component/admin/AdminTable";
import FormInput from "@/component/FormInput";
import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: "User" | "Lab" | "Nurse";
  location?: string;
  specialty?: string;
  registeredDate: string;
}

const UsersManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"All" | "User" | "Lab" | "Nurse">("All");

  // Sample data with different user types
  const allUsers: User[] = [
    // Regular Users
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 234-567-8901",
      type: "User",
      registeredDate: "Nov 15, 2025",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+1 234-567-8902",
      type: "User",
      registeredDate: "Nov 18, 2025",
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael.c@example.com",
      phone: "+1 234-567-8903",
      type: "User",
      registeredDate: "Nov 20, 2025",
    },
    // Labs
    {
      id: 4,
      name: "City Lab Center",
      email: "contact@citylab.com",
      phone: "+1 234-567-8904",
      type: "Lab",
      location: "Downtown, NY",
      specialty: "Blood Tests, X-Ray",
      registeredDate: "Oct 25, 2025",
    },
    {
      id: 5,
      name: "Metro Diagnostics",
      email: "info@metrodiag.com",
      phone: "+1 234-567-8905",
      type: "Lab",
      location: "Brooklyn, NY",
      specialty: "MRI, CT Scan, Ultrasound",
      registeredDate: "Nov 5, 2025",
    },
    {
      id: 6,
      name: "Heart Care Lab",
      email: "heartcare@lab.com",
      phone: "+1 234-567-8906",
      type: "Lab",
      location: "Manhattan, NY",
      specialty: "ECG, Cardiac Tests",
      registeredDate: "Nov 10, 2025",
    },
    // Nurses
    {
      id: 7,
      name: "Emily Williams",
      email: "emily.w@nurse.com",
      phone: "+1 234-567-8907",
      type: "Nurse",
      location: "Queens, NY",
      specialty: "Home Care, Wound Dressing",
      registeredDate: "Oct 30, 2025",
    },
    {
      id: 8,
      name: "David Martinez",
      email: "david.m@nurse.com",
      phone: "+1 234-567-8908",
      type: "Nurse",
      location: "Bronx, NY",
      specialty: "Physiotherapy, Elderly Care",
      registeredDate: "Nov 8, 2025",
    },
    {
      id: 9,
      name: "Jessica Taylor",
      email: "jessica.t@nurse.com",
      phone: "+1 234-567-8909",
      type: "Nurse",
      location: "Staten Island, NY",
      specialty: "Pediatric Care, IV Therapy",
      registeredDate: "Nov 12, 2025",
    },
    // More Users
    {
      id: 10,
      name: "Emma Wilson",
      email: "emma.w@example.com",
      phone: "+1 234-567-8910",
      type: "User",
      registeredDate: "Nov 22, 2025",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "User":
        return colors.primary;
      case "Lab":
        return "#2196F3";
      case "Nurse":
        return "#FF9800";
      default:
        return colors.gray;
    }
  };

  const columns: TableColumn[] = [
    {
      key: "id",
      title: "ID",
      width: 60,
    },
    {
      key: "name",
      title: "Name",
      width: 180,
    },
    {
      key: "email",
      title: "Email",
      width: 200,
    },
    {
      key: "phone",
      title: "Phone",
      width: 150,
    },
    {
      key: "type",
      title: "Type",
      width: 100,
      render: (value) => (
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: getTypeColor(value) + "20" },
          ]}
        >
          <Text style={[styles.typeText, { color: getTypeColor(value) }]}>
            {value}
          </Text>
        </View>
      ),
    },
    {
      key: "location",
      title: "Location",
      width: 150,
      render: (value) => (
        <Text style={styles.cellText}>{value || "-"}</Text>
      ),
    },
    {
      key: "specialty",
      title: "Specialty",
      width: 180,
      render: (value) => (
        <Text style={styles.cellText}>{value || "-"}</Text>
      ),
    },
    {
      key: "registeredDate",
      title: "Registered",
      width: 140,
    },
  ];

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery) ||
      (user.location && user.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === "All" || user.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      label: "Total Users",
      value: allUsers.length,
      color: colors.primary,
    },
    {
      label: "Regular Users",
      value: allUsers.filter((u) => u.type === "User").length,
      color: colors.primary,
    },
    {
      label: "Labs",
      value: allUsers.filter((u) => u.type === "Lab").length,
      color: "#2196F3",
    },
    {
      label: "Nurses",
      value: allUsers.filter((u) => u.type === "Nurse").length,
      color: "#FF9800",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statCard,
                { borderLeftColor: stat.color, borderLeftWidth: 4 },
              ]}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <FormInput
            placeholder="Search by name, email, phone, location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            LeftIcon={() => <Ionicons name="search" size={20} color={colors.gray} />}
            containerStyle={styles.searchInput}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {(["All", "User", "Lab", "Nurse"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  filterType === type && styles.filterChipActive,
                ]}
                onPress={() => setFilterType(type)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filterType === type && styles.filterTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Users Table */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>All Registered Users</Text>
          <AdminTable
            columns={columns}
            data={filteredUsers}
            emptyMessage="No users found"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UsersManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    marginBottom: 12,
  },
  filtersContainer: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  filterTextActive: {
    color: colors.white,
  },
  tableSection: {
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  typeText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  cellText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
});
