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
  status: "Active" | "Inactive" | "Blocked";
  registeredDate: string;
  appointments: number;
}

const UsersManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive" | "Blocked">("All");

  // Sample data
  const users: User[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+92 300 1234567",
      status: "Active",
      registeredDate: "Nov 15, 2025",
      appointments: 12,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+92 301 2345678",
      status: "Active",
      registeredDate: "Nov 10, 2025",
      appointments: 8,
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael.c@example.com",
      phone: "+92 302 3456789",
      status: "Inactive",
      registeredDate: "Nov 5, 2025",
      appointments: 3,
    },
    {
      id: 4,
      name: "Emma Wilson",
      email: "emma.w@example.com",
      phone: "+92 303 4567890",
      status: "Active",
      registeredDate: "Oct 28, 2025",
      appointments: 15,
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.b@example.com",
      phone: "+92 304 5678901",
      status: "Blocked",
      registeredDate: "Oct 20, 2025",
      appointments: 5,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return colors.success;
      case "Inactive":
        return colors.warning;
      case "Blocked":
        return colors.danger;
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
      width: 150,
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
      key: "status",
      title: "Status",
      width: 100,
      render: (value) => (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(value) + "20" },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(value) }]}>
            {value}
          </Text>
        </View>
      ),
    },
    {
      key: "registeredDate",
      title: "Registered",
      width: 120,
    },
    {
      key: "appointments",
      title: "Appointments",
      width: 120,
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    const matchesFilter =
      filterStatus === "All" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: "Total Users", value: users.length, color: colors.primary },
    {
      label: "Active",
      value: users.filter((u) => u.status === "Active").length,
      color: colors.success,
    },
    {
      label: "Inactive",
      value: users.filter((u) => u.status === "Inactive").length,
      color: colors.warning,
    },
    {
      label: "Blocked",
      value: users.filter((u) => u.status === "Blocked").length,
      color: colors.danger,
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
            placeholder="Search users..."
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
            {(["All", "Active", "Inactive", "Blocked"] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  filterStatus === status && styles.filterChipActive,
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filterStatus === status && styles.filterTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Users Table */}
        <View style={styles.tableSection}>
          <View style={styles.tableTitleContainer}>
            <Text style={styles.tableTitle}>All Users</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.addButtonText}>Add User</Text>
            </TouchableOpacity>
          </View>
          <AdminTable
            columns={columns}
            data={filteredUsers}
            onRowPress={(user) => console.log("User pressed:", user)}
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
  tableTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tableTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
});
