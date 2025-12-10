import AdminTable, { TableColumn } from "@/component/admin/AdminTable";
import FormInput from "@/component/FormInput";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext, User } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "User" | "Lab" | "Nurse" | "Medicine Delivery";
  location?: string;
  registeredDate: string;
}

const UsersManagement = () => {
  const { getAllUsers } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"All" | "User" | "Lab" | "Nurse" | "Medicine Delivery">("All");
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Map role to display type
  const mapRoleToType = (role: string): "User" | "Lab" | "Nurse" | "Medicine Delivery" => {
    switch (role) {
      case "lab": return "Lab";
      case "nurse": return "Nurse";
      case "delivery": return "Medicine Delivery";
      default: return "User";
    }
  };

  // Fetch users from Firestore
  const fetchUsers = useCallback(async () => {
    try {
      const firestoreUsers = await getAllUsers();
      const displayUsers: DisplayUser[] = firestoreUsers.map((u: User) => {
        // Get location from additionalInfo
        let location = "";
        if (u.additionalInfo) {
          const info = u.additionalInfo as any;
          if (info.city) location = info.city;
          if (info.address) location = info.address;
        }

        return {
          id: u.uid,
          name: `${u.firstname || ""} ${u.lastname || ""}`.trim() || "Unknown",
          email: u.email || "",
          phone: u.phoneNumber || "",
          type: mapRoleToType(u.role),
          location: location || "-",
          registeredDate: "-", // We can add createdAt field to users if needed
        };
      });
      setUsers(displayUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getAllUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

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
  ];

  const filteredUsers = users.filter((user) => {
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
      value: users.length,
      color: colors.primary,
    },
    {
      label: "Regular Users",
      value: users.filter((u) => u.type === "User").length,
      color: colors.primary,
    },
    {
      label: "Labs",
      value: users.filter((u) => u.type === "Lab").length,
      color: "#2196F3",
    },
    {
      label: "Nurses",
      value: users.filter((u) => u.type === "Nurse").length,
      color: "#9C27B0",
    },
    {
      label: "Delivery Persons",
      value: users.filter((u) => u.type === "Medicine Delivery").length,
      color: "#FF5722",
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
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
          <Text style={styles.tableTitle}>All Registered Users ({filteredUsers.length})</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.gray,
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
