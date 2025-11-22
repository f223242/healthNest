import { appStyles, colors } from "@/constant/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DataManagementProps {
  onDownloadData?: () => void;
  onDeleteAccount?: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({
  onDownloadData,
  onDeleteAccount,
}) => {
  return (
    <View style={styles.dataManagementSection}>
      <Text style={appStyles.sectionTitle}>Data Management</Text>

      <TouchableOpacity style={styles.actionButton} onPress={onDownloadData}>
        <Text style={styles.actionButtonText}>Download My Data</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.dangerButton]}
        onPress={onDeleteAccount}
      >
        <Text style={[styles.actionButtonText, styles.dangerText]}>
          Delete My Account
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DataManagement;

const styles = StyleSheet.create({
  dataManagementSection: {
    marginTop: 32,
  },
  actionButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: colors.primary,
  },
  dangerButton: {
    borderColor: colors.danger,
  },
  dangerText: {
    color: colors.danger,
  },
});
