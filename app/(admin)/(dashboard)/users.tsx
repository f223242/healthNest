import AdminTable, { TableColumn } from "@/component/admin/AdminTable";
import FormInput from "@/component/FormInput";
import { db } from "@/config/firebase";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext, User } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs } from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    RefreshControl,
    ScrollView,
    StatusBar,
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
      console.log('[Admin] getAllUsers ->', firestoreUsers && firestoreUsers.length ? `${firestoreUsers.length} users` : 'no users', firestoreUsers);
      // also include pendingUsers (not yet verified) so admin can manage them
      let pendingUsers: any[] = [];
      try {
        const pendingSnap = await getDocs(collection(db, "pendingUsers"));
        pendingUsers = pendingSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
        console.log('[Admin] pendingUsers ->', pendingUsers && pendingUsers.length ? `${pendingUsers.length} pending` : 'no pending', pendingUsers);
      } catch (e) {
        console.warn("Failed to fetch pendingUsers:", e);
      }
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

      // append pending users (mark as pending in registeredDate)
      if (pendingUsers.length) {
        const pendingDisplay = pendingUsers.map((p) => {
          const name = `${p.firstname || ""} ${p.lastname || ""}`.trim() || "Unknown";
          const location = (p.city || p.address) || "-";
          const role = mapRoleToType(p.role || "user");
          const created = p.createdAt ? (typeof p.createdAt === 'number' ? new Date(p.createdAt).toISOString() : p.createdAt) : "Pending";
          return {
            id: p.uid,
            name: `${name} (Pending)`,
            email: p.email || "",
            phone: p.phoneNumber || "",
            type: role,
            location,
            registeredDate: created,
          } as DisplayUser;
        });

        displayUsers.unshift(...pendingDisplay);
      }
      console.log('[Admin] displayUsers count ->', displayUsers.length);
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
        return '#1E293B';
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
      color: '#1E293B',
    },
    {
      label: "Regular Users",
      value: users.filter((u) => u.type === "User").length,
      color: '#1E293B',
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
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
        <LinearGradient
          colors={['#1E293B', '#334155', '#475569']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Users Management</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E293B" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* Premium Gradient Header */}
      <LinearGradient
        colors={['#1E293B', '#334155', '#475569']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Users Management</Text>
          <Text style={styles.headerSubtitle}>Manage all registered users</Text>

          {/* Stats in Header */}
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{users.length}</Text>
              <Text style={styles.headerStatLabel}>Total</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{users.filter(u => u.type === "User").length}</Text>
              <Text style={styles.headerStatLabel}>Users</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{users.filter(u => u.type === "Nurse").length}</Text>
              <Text style={styles.headerStatLabel}>Nurses</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{users.filter(u => u.type === "Lab").length}</Text>
              <Text style={styles.headerStatLabel}>Labs</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content Area */}
      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#1E293B']}
            />
          }
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

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

          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default UsersManagement;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1E293B',
  },

  headerGradient: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: sizes.paddingHorizontal,
  },

  headerContent: {
    width: '100%',
  },

  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },

  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  headerStatItem: {
    flex: 1,
    alignItems: 'center',
  },

  headerStatValue: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 2,
  },

  headerStatLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.3,
  },

  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -10,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 24,
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
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
