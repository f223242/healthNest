import DeliveryPersonCard, {
    DeliveryPerson,
} from "@/component/DeliveryPersonCard";
import { appStyles, colors, sizes } from "@/constant/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const deliveryPersons: DeliveryPerson[] = [
  {
    id: 1,
    name: "Ahmed Ali",
    avatar:
      "https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg",
    rating: 4.8,
    totalDeliveries: 250,
    isAvailable: true,
    deliveryTime: "20-30 min",
    distance: "2.5 km",
  },
  {
    id: 2,
    name: "Sarah Khan",
    avatar:
      "https://img.freepik.com/premium-photo/portrait-smiling-woman-with-brown-hair_1048944-30273179.jpg",
    rating: 4.9,
    totalDeliveries: 320,
    isAvailable: true,
    deliveryTime: "15-25 min",
    distance: "1.8 km",
  },
  {
    id: 3,
    name: "Muhammad Hassan",
    avatar:
      "https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg",
    rating: 4.7,
    totalDeliveries: 180,
    isAvailable: false,
    deliveryTime: "25-35 min",
    distance: "3.2 km",
  },
  {
    id: 4,
    name: "Fatima Noor",
    avatar:
      "https://img.freepik.com/premium-photo/portrait-smiling-woman-with-brown-hair_1048944-30273179.jpg",
    rating: 4.6,
    totalDeliveries: 150,
    isAvailable: true,
    deliveryTime: "30-40 min",
    distance: "4.0 km",
  },
  {
    id: 5,
    name: "Ali Raza",
    avatar:
      "https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg",
    rating: 4.8,
    totalDeliveries: 290,
    isAvailable: true,
    deliveryTime: "20-30 min",
    distance: "2.0 km",
  },
  {
    id: 6,
    name: "Zainab Ahmed",
    avatar:
      "https://img.freepik.com/premium-photo/portrait-smiling-woman-with-brown-hair_1048944-30273179.jpg",
    rating: 4.5,
    totalDeliveries: 120,
    isAvailable: false,
    deliveryTime: "35-45 min",
    distance: "5.5 km",
  },
];

const RequestMedicine = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "available">("all");

  const filteredPersons = deliveryPersons.filter((person) =>
    filter === "available" ? person.isAvailable : true
  );

  const handlePersonPress = (person: DeliveryPerson) => {
    router.push({
      pathname: "/(protected)/medicine-chat",
      params: {
        personId: person.id,
        personName: person.name,
        personAvatar: person.avatar,
      },
    });
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
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
            Available (
            {deliveryPersons.filter((p) => p.isAvailable).length})
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={appStyles.h2}>No delivery persons available</Text>
            <Text style={[appStyles.bodyText, { marginTop: 8 }]}>
              Please try again later
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default RequestMedicine;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    fontFamily: "Poppins-Medium",
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
