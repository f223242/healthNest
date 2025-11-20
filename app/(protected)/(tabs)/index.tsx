import { SearchIcon } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import LabCard from "@/component/LabCard";
import { appStyles, colors, sizes } from "@/constant/theme";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const data = [
  {
    id: 1,
    name: "LabCorp",
    description: "Comprehensive lab testing services",
    image: require("@/assets/png/labcorp.png"),
    rating: 4.5,
    review: "120 + reviews",
  },
  {
    id: 2,
    name: "Quest Diagnostics",
    description: "Advanced diagnostic testing services",
    image: require("@/assets/png/quest.png"),
    rating: 4.2,
    review: "98 reviews",
  },
  {
    id: 3,
    name: "BioReference Laboratories",
    description: "Comprehensive diagnostic testing services",
    image: require("@/assets/png/labcorp.png"),
    rating: 4.0,
    review: "75 reviews",
  },
  {
    id: 4,
    name: "Mayo Clinic Laboratories",
    description: "Leading provider of clinical laboratory services",
    image: require("@/assets/png/labcorp.png"),
    rating: 4.7,
    review: "150 reviews",
  },
];

const index = () => {
  const router = useRouter();

  const handleLabPress = () => {
    router.push("/(protected)/select-labs");
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <FormInput
          LeftIcon={SearchIcon}
          placeholder="Search for services"
          containerStyle={styles.searchInput}
        />
        <Text style={[appStyles.h3, styles.heading]}>Associated Labs</Text>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <LabCard {...item} onPress={handleLabPress} />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          style={styles.flatList}
          snapToInterval={sizes.width - sizes.paddingHorizontal * 2}
          decelerationRate="fast"
          pagingEnabled={false}
        />

        <Text style={[appStyles.h3]}>Quick Actions</Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
          <AppButton title="Book Lab Test" containerStyle={{ flex: 1 }} />
          <AppButton title="Request Medicine" containerStyle={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
          <AppButton title="Request nurse" containerStyle={{ flex: 1 }} />
          <AppButton title="Chat with Ai Bot" containerStyle={{ flex: 1 }} />
        </View>
        {/* <Text style={[appStyles.h3, { marginTop: 20 }]}>
          Recent Activity / Status
        </Text> */}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,

    backgroundColor: colors.white,
  },
  headerContainer: {
    backgroundColor: colors.white,
  },
  searchInput: {
    marginTop: 10,
  },
  heading: {
    marginTop: 20,
  },
  flatList: {
    flexGrow: 0,
    flexShrink: 0,
  },
  flatListContent: {
    paddingVertical: 10,
  },

  quickActionsContainer: {
    flex: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 20,
  },
  quickActionsHeading: {
    marginBottom: 12,
  },
});
