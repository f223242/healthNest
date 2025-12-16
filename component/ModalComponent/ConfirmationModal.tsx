import AppButton from "@/component/AppButton";
import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

interface ConfirmationModalProps {
    visible: boolean;
    onClose?: () => void; // Optional close without action
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "success" | "danger" | "warning" | "info";
    showCancelButton?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    onClose,
    onConfirm,
    onCancel,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "info",
    showCancelButton = true,
    icon,
}) => {
    const getThemeColor = () => {
        switch (type) {
            case "success": return colors.success;
            case "danger": return colors.danger;
            case "warning": return "#FFB800";
            default: return colors.primary;
        }
    };

    const getIconName = () => {
        if (icon) return icon;
        switch (type) {
            case "success": return "checkmark-circle";
            case "danger": return "alert-circle";
            case "warning": return "warning";
            default: return "information-circle";
        }
    };

    const themeColor = getThemeColor();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose || onCancel}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Ionicons
                        name={getIconName()}
                        size={48}
                        color={themeColor}
                        style={{ marginBottom: 16 }}
                    />
                    <Text style={[styles.modalTitle, { color: themeColor }]}>{title}</Text>
                    <Text style={styles.modalText}>{message}</Text>

                    <View style={styles.modalButtonRow}>
                        {showCancelButton && (
                            <AppButton
                                title={cancelText}
                                onPress={onCancel}
                                containerStyle={[styles.cancelBtn, { borderColor: themeColor }]}
                                textStyle={[styles.cancelText, { color: themeColor }]}
                            />
                        )}
                        <AppButton
                            title={confirmText}
                            onPress={onConfirm}
                            containerStyle={[styles.confirmBtn, { backgroundColor: themeColor }]}
                            textStyle={styles.confirmText}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        width: "100%",
        maxWidth: 340,
        elevation: 8,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        marginBottom: 12,
        textAlign: "center",
    },
    modalText: {
        fontSize: 15,
        fontFamily: Fonts.regular,
        color: colors.gray,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },
    modalButtonRow: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    cancelBtn: {
        flex: 1,
        borderWidth: 1,
        backgroundColor: "transparent",
    },
    confirmBtn: {
        flex: 1,
        borderWidth: 0,
    },
    cancelText: {
        fontSize: 14,
        fontFamily: Fonts.semiBold,
    },
    confirmText: {
        fontSize: 14,
        fontFamily: Fonts.semiBold,
        color: colors.white,
    },
});
