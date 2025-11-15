import { appStyles, colors, sizes } from "@/constant/theme";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface LabCardProps {
  name: string;
  description: string;
  image: any;
  rating: number;
  review: string;
}

const LabCard: React.FC<LabCardProps> = ({
  name,
  description,
  image,
  rating,
  review,
}) => {
  return (
    <View style={styles.labItem}>
      <Image source={image} style={styles.labImage} resizeMode="cover" />
      <View style={styles.labInfo}>
        <Text style={[appStyles.h4, styles.labName]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[appStyles.body2, styles.description]} numberOfLines={2}>
          {description}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {rating}</Text>
          <Text style={styles.review}>({review})</Text>
        </View>
      </View>
    </View>
  );
};

export default LabCard;

const styles = StyleSheet.create({
  labItem: {
    width: (sizes.width - sizes.paddingHorizontal * 2 - 12) / 2,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignSelf: "flex-start",
  },
  labImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  labInfo: {
    // content ke according height
  },
  labName: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
    marginRight: 6,
  },
  review: {
    fontSize: 11,
    color: "#666",
  },
});
