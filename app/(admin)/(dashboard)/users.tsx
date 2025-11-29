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
  type: "User" | "Lab" | "Nurse" | "Medicine Delivery";
  location?: string;
  registeredDate: string;
}

const UsersManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"All" | "User" | "Lab" | "Nurse" | "Medicine Delivery">("All");

  // Sample data with different user types
  const allUsers: User[] = [
    // Regular Users
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+92 300 1234567",
      type: "User",
      location: "Karachi, Pakistan",
      registeredDate: "Nov 15, 2025",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+92 301 2345678",
      type: "User",
      location: "Lahore, Pakistan",
      registeredDate: "Nov 18, 2025",
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael.c@example.com",
      phone: "+92 302 3456789",
      type: "User",
      location: "Islamabad, Pakistan",
      registeredDate: "Nov 20, 2025",
    },
    {
      id: 4,
      name: "Emma Wilson",
      email: "emma.w@example.com",
      phone: "+92 303 4567890",
      type: "User",
      location: "Multan, Pakistan",
      registeredDate: "Nov 22, 2025",
    },
    // Labs
    {
      id: 5,
      name: "Chughtai Lab",
      email: "contact@chughtai.com",
      phone: "+92 304 5678901",
      type: "Lab",
      location: "Gulberg, Lahore",
      registeredDate: "Oct 25, 2025",
    },
    {
      id: 6,
      name: "IDC Diagnostic Center",
      email: "info@idc.com",
      phone: "+92 305 6789012",
      type: "Lab",
      location: "Clifton, Karachi",
      registeredDate: "Nov 5, 2025",
    },
    {
      id: 7,
      name: "Excel Labs",
      email: "excel@labs.com",
      phone: "+92 306 7890123",
      type: "Lab",
      location: "F-8, Islamabad",
      registeredDate: "Nov 10, 2025",
    },
    // Nurses
    {
      id: 8,
      name: "Emily Williams",
      email: "emily.w@nurse.com",
      phone: "+92 307 8901234",
      type: "Nurse",
      location: "DHA, Karachi",
      registeredDate: "Oct 30, 2025",
    },
    {
      id: 9,
      name: "Fatima Khan",
      email: "fatima.k@nurse.com",
      phone: "+92 308 9012345",
      type: "Nurse",
      location: "Model Town, Lahore",
      registeredDate: "Nov 8, 2025",
    },
    {
      id: 10,
      name: "Ayesha Ahmed",
      email: "ayesha.a@nurse.com",
      phone: "+92 309 0123456",
      type: "Nurse",
      location: "G-11, Islamabad",
      registeredDate: "Nov 12, 2025",
    },
    // Medicine Delivery Persons
    {
      id: 11,
      name: "Ali Hassan",
      email: "ali.h@delivery.com",
      phone: "+92 310 1234567",
      type: "Medicine Delivery",
      location: "Saddar, Karachi",
      registeredDate: "Nov 1, 2025",
    },
    {
      id: 12,
      name: "Usman Malik",
      email: "usman.m@delivery.com",
      phone: "+92 311 2345678",
      type: "Medicine Delivery",
      location: "Johar Town, Lahore",
      registeredDate: "Oct 28, 2025",
    },
    {
      id: 13,
      name: "Bilal Ahmed",
      email: "bilal.a@delivery.com",
      phone: "+92 312 3456789",
      type: "Medicine Delivery",
      location: "Blue Area, Islamabad",
      registeredDate: "Nov 14, 2025",
    },
    {
      id: 14,
      name: "Zain Abbas",
      email: "zain.a@delivery.com",
      phone: "+92 313 4567890",
      type: "Medicine Delivery",
      location: "Bahadurabad, Karachi",
      registeredDate: "Nov 17, 2025",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "User":
        return colors.primary;
      case "Lab":
        return "#2196F3";
      case "Nurse":
        return "#9C27B0";
      case "Medicine Delivery":
        return "#FF5722";
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
      width: 220,
    },
    {
      key: "phone",
      title: "Phone",
      width: 150,
    },
    {
      key: "type",
      title: "Registered As",
      width: 150,
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
      width: 180,
      render: (value) => (
        <Text style={styles.cellText}>{value || "-"}</Text>
      ),
    },
    {
      key: "registeredDate",
      title: "Registered Date",
      width: 180,
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
      color: "#9C27B0",
    },
    {
      label: "Delivery Persons",
      value: allUsers.filter((u) => u.type === "Medicine Delivery").length,
      color: "#FF5722",
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
            {(["All", "User", "Lab", "Nurse", "Medicine Delivery"] as const).map((type) => (
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
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
});
