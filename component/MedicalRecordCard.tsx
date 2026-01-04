import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RecordActionButton from "./RecordActionButton";

// Accepts both display labels and backend types
type RecordType = "Lab Report" | "Prescription" | "Diagnosis" | "Imaging" | "Other" | string;
type RecordStatus = "New" | "Viewed";

interface MedicalRecordCardProps {
  id: string;
  type: RecordType;
  title: string;
  provider: string;
  providerImage: string;
  date: string;
  status: RecordStatus;
  doctor?: string;
  reportId: string;
  testCount?: number;
  onPress?: () => void;
  onView?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
  type,
  title,
  provider,
  providerImage,
  date,
  status,
  doctor,
  reportId,
  testCount,
  onPress,
  onView,
  onDownload,
  onShare,
}) => {
  const getTypeIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "Lab Report":
        return "flask";
      case "Prescription":
        return "document-text";
      case "Diagnosis":
        return "medical";
      case "Imaging":
        return "scan";
      case "Other":
      default:
        return "document";
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "Lab Report":
        return colors.primary;
      case "Prescription":
        return "#FF9800";
      case "Diagnosis":
        return "#4CAF50";
      case "Imaging":
        return "#9C27B0";
      case "Other":
      default:
        return colors.gray;
    }
  };

  return (
    <TouchableOpacity
      style={styles.recordCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <LinearGradient
        colors={["#FFFFFF", "#F8F9FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: providerImage }}
              style={styles.providerImage}
            />
            <View
              style={[
                styles.typeIconBadge,
                { backgroundColor: getTypeColor() + "20" },
              ]}
            >
              <Ionicons
                name={getTypeIcon()}
                size={12}
                color={getTypeColor()}
              />
            </View>
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.recordTitle} numberOfLines={1}>
                {title}
              </Text>
              {status === "New" && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>
            <Text style={styles.provider}>{provider}</Text>
            <View style={styles.metaRow}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={colors.gray}
              />
              <Text style={styles.metaText}>{date}</Text>
              {testCount && (
                <>
                  <View style={styles.metaDivider} />
                  <Ionicons
                    name="list-outline"
                    size={12}
                    color={colors.gray}
                  />
                  <Text style={styles.metaText}>
                    {testCount} tests
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Doctor Info */}
        {doctor && (
          <View style={styles.doctorRow}>
            <Ionicons
              name="medical"
              size={14}
              color={colors.primary}
            />
            <Text style={styles.doctorText}>
              Referred by {doctor}
            </Text>
          </View>
        )}

        {/* Report ID */}
        <View style={styles.reportIdRow}>
          <Text style={styles.reportIdLabel}>Report ID:</Text>
          <Text style={styles.reportIdValue}>{reportId}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <RecordActionButton
            icon="eye-outline"
            label="View"
            onPress={onView}
          />
          <RecordActionButton
            icon="download-outline"
            label="Download"
            onPress={onDownload}
          />
          <RecordActionButton
            icon="share-social-outline"
            label="Share"
            onPress={onShare}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default MedicalRecordCard;

const styles = StyleSheet.create({
  recordCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  providerImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
  },
  typeIconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.black,
    flex: 1,
  },
  newBadge: {
    backgroundColor: colors.danger + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: colors.danger,
  },
  provider: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray,
    marginHorizontal: 6,
  },
  doctorRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "10",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  doctorText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  reportIdRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  reportIdLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  reportIdValue: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    paddingTop: 12,
    marginTop: 4,
  },
});
