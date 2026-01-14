import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from 'expo-location';
import React, { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get("window");

interface BookAppointmentModalProps {
    visible: boolean;
    onClose: () => void;
    onBook: (appointmentData: {
        date: string;
        time: string;
        serviceType: string;
        notes: string;
        address: string;
        duration: string;
    }) => void;
    providerName?: string;
    providerType?: "nurse" | "delivery";
    providerSpecialization?: string;
    hourlyRate?: string;
    // Legacy props for backward compatibility
    nurseName?: string;
    nurseSpecialization?: string;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
    visible,
    onClose,
    onBook,
    providerName,
    providerType = "nurse",
    providerSpecialization,
    hourlyRate,
    // Legacy props
    nurseName,
    nurseSpecialization,
}) => {
    // Support both new and legacy props
    const displayName = providerName || nurseName || "";
    const displaySpecialization = providerSpecialization || nurseSpecialization || "";
    const isDelivery = providerType === "delivery";
    
    const toast = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [serviceType, setServiceType] = useState("");
    const [notes, setNotes] = useState("");
    const [address, setAddress] = useState("");
    const [duration, setDuration] = useState("2 hours");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const serviceTypes = isDelivery ? [
        { label: "Medicine Delivery", icon: "medkit" as const, color: colors.primary },
        { label: "Pharmacy Pickup", icon: "business" as const, color: "#2196F3" },
        { label: "Medical Supplies", icon: "bandage" as const, color: "#9C27B0" },
        { label: "Lab Sample Pickup", icon: "flask" as const, color: "#FF9800" },
        { label: "Prescription Delivery", icon: "document-text" as const, color: "#F44336" },
    ] : [
        { label: "Elderly Care", icon: "accessibility" as const, color: "#9C27B0" },
        { label: "Child Care", icon: "happy" as const, color: "#FF9800" },
        { label: "Patient Care", icon: "medical" as const, color: "#2196F3" },
        { label: "Post-Surgery", icon: "bandage" as const, color: "#F44336" },
        { label: "General Nursing", icon: "heart" as const, color: colors.primary },
    ];

    const durations = [
        { label: "2 hours", value: "2 hours" },
        { label: "4 hours", value: "4 hours" },
        { label: "8 hours", value: "8 hours" },
        { label: "12 hours", value: "12 hours" },
        { label: "Full day", value: "Full day" },
    ];

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === "ios");
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleTimeChange = (event: any, time?: Date) => {
        setShowTimePicker(Platform.OS === "ios");
        if (time) {
            setSelectedTime(time);
        }
    };

    const formatDate = (date: Date): string => {
        return date.toISOString().split("T")[0];
    };

    const formatTime = (time: Date): string => {
        return time.toTimeString().split(" ")[0].substring(0, 5);
    };

    const handleGetCurrentLocation = async () => {
        setIsGettingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                toast.show({ type: "error", text1: "Permission Denied", text2: "Location permission is required" });
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const place = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (place && place.length > 0) {
                const p = place[0];
                const formattedAddress = `${p.street || ''} ${p.name || ''}, ${p.city || ''}, ${p.region || ''}, ${p.country || ''}`.replace(/\s+/g, ' ').trim();
                setAddress(formattedAddress);
            }
        } catch (error) {
            console.error("Location error:", error);
            toast.show({ type: "error", text1: "Error", text2: "Failed to get current location" });
        } finally {
            setIsGettingLocation(false);
        }
    };

    const handleBookAppointment = async () => {
        if (!serviceType) {
            toast.show({ type: "error", text1: "Required Field", text2: "Please select a service type" });
            return;
        }

        if (!address.trim()) {
            toast.show({ type: "error", text1: "Required Field", text2: "Please enter your service address" });
            return;
        }

        if (address.trim().length < 10) {
            toast.show({ type: "error", text1: "Invalid Address", text2: "Please enter a complete address (min 10 chars)" });
            return;
        }

        setIsSubmitting(true);

        try {
            await onBook({
                date: formatDate(selectedDate),
                time: formatTime(selectedTime),
                serviceType,
                notes: notes.trim(),
                address: address.trim(),
                duration,
            });

            // Reset form
            setServiceType("");
            setNotes("");
            setAddress("");
            setDuration("2 hours");
        } catch (error) {
            console.error("Booking error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateEstimatedPrice = () => {
        if (!hourlyRate) return null;
        const rate = parseFloat(hourlyRate.replace(/[^0-9.]/g, ""));
        if (isNaN(rate)) return null;

        let hours = 2;
        if (duration === "4 hours") hours = 4;
        else if (duration === "8 hours") hours = 8;
        else if (duration === "12 hours") hours = 12;
        else if (duration === "Full day") hours = 24;

        return `Rs. ${(rate * hours).toFixed(0)}`;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <LinearGradient
                        colors={[colors.primary, "#00D68F"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.modalHeader}
                    >
                        <View style={styles.headerContent}>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.modalTitle}>
                                    {isDelivery ? "Request Delivery" : "Book Appointment"}
                                </Text>
                                <Text style={styles.modalSubtitle}>with {displayName}</Text>
                                {displaySpecialization ? (
                                    <View style={styles.specializationBadge}>
                                        <Ionicons name={isDelivery ? "bicycle" : "medical"} size={12} color={colors.white} />
                                        <Text style={styles.specializationText}>
                                            {displaySpecialization}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    <ScrollView
                        style={styles.modalContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Schedule Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                <Text style={styles.sectionTitle}>Schedule</Text>
                            </View>

                            <View style={styles.dateTimeRow}>
                                {/* Date Selection */}
                                <TouchableOpacity
                                    style={styles.dateTimeCard}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <View style={styles.dateTimeIconContainer}>
                                        <Ionicons name="calendar" size={24} color={colors.primary} />
                                    </View>
                                    <View style={styles.dateTimeInfo}>
                                        <Text style={styles.dateTimeLabel}>Date</Text>
                                        <Text style={styles.dateTimeValue}>
                                            {selectedDate.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={colors.gray} />
                                </TouchableOpacity>

                                {/* Time Selection */}
                                <TouchableOpacity
                                    style={styles.dateTimeCard}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <View style={styles.dateTimeIconContainer}>
                                        <Ionicons name="time" size={24} color={colors.primary} />
                                    </View>
                                    <View style={styles.dateTimeInfo}>
                                        <Text style={styles.dateTimeLabel}>Time</Text>
                                        <Text style={styles.dateTimeValue}>
                                            {selectedTime.toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={colors.gray} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Service Type Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="medical-outline" size={20} color={colors.primary} />
                                <Text style={styles.sectionTitle}>Service Type *</Text>
                            </View>

                            <View style={styles.serviceTypesGrid}>
                                {serviceTypes.map((service) => (
                                    <TouchableOpacity
                                        key={service.label}
                                        style={[
                                            styles.serviceTypeCard,
                                            serviceType === service.label && {
                                                borderColor: service.color,
                                                backgroundColor: service.color + "15",
                                            },
                                        ]}
                                        onPress={() => setServiceType(service.label)}
                                    >
                                        <View
                                            style={[
                                                styles.serviceTypeIcon,
                                                { backgroundColor: service.color + "20" },
                                            ]}
                                        >
                                            <Ionicons
                                                name={service.icon}
                                                size={24}
                                                color={service.color}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.serviceTypeLabel,
                                                serviceType === service.label && { color: service.color },
                                            ]}
                                        >
                                            {service.label}
                                        </Text>
                                        {serviceType === service.label && (
                                            <View style={[styles.checkMark, { backgroundColor: service.color }]}>
                                                <Ionicons name="checkmark" size={12} color={colors.white} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Duration Section - Only for Nurse */}
                        {!isDelivery && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="hourglass-outline" size={20} color={colors.primary} />
                                <Text style={styles.sectionTitle}>Duration</Text>
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.durationsContainer}
                            >
                                {durations.map((dur) => (
                                    <TouchableOpacity
                                        key={dur.value}
                                        style={[
                                            styles.durationChip,
                                            duration === dur.value && styles.durationChipActive,
                                        ]}
                                        onPress={() => setDuration(dur.value)}
                                    >
                                        <Text
                                            style={[
                                                styles.durationChipText,
                                                duration === dur.value && styles.durationChipTextActive,
                                            ]}
                                        >
                                            {dur.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        )}

                        {/* Address Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="location-outline" size={20} color={colors.primary} />
                                <Text style={styles.sectionTitle}>{isDelivery ? "Delivery Address" : "Service Location"} *</Text>
                                <TouchableOpacity onPress={handleGetCurrentLocation} disabled={isGettingLocation}>
                                    {isGettingLocation ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <Text style={{ color: colors.primary, fontSize: 12, fontFamily: Fonts.semiBold }}>
                                            <Ionicons name="locate" size={14} /> Use Current
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.addressInput}
                                placeholder="Enter your complete address..."
                                placeholderTextColor={colors.gray}
                                value={address}
                                onChangeText={setAddress}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Notes Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                                <Text style={styles.sectionTitle}>Additional Notes</Text>
                                <Text style={styles.optionalBadge}>Optional</Text>
                            </View>

                            <TextInput
                                style={styles.notesInput}
                                placeholder="Any special requirements, medical conditions, or preferences..."
                                placeholderTextColor={colors.gray}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Price Summary */}
                        <View style={styles.priceSummary}>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Hourly Rate</Text>
                                <Text style={styles.priceValue}>Rs. {hourlyRate || "N/A"}/hr</Text>
                            </View>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Duration</Text>
                                <Text style={styles.priceValue}>{duration}</Text>
                            </View>
                            <View style={styles.priceDivider} />
                            <View style={styles.priceRow}>
                                <Text style={styles.totalLabel}>Estimated Total</Text>
                                <Text style={styles.totalValue}>
                                    {calculateEstimatedPrice() || "Contact for pricing"}
                                </Text>
                            </View>
                        </View>

                        {/* Book Button */}
                        <TouchableOpacity
                            style={[styles.bookButton, isSubmitting && styles.bookButtonDisabled]}
                            onPress={handleBookAppointment}
                            disabled={isSubmitting}
                        >
                            <LinearGradient
                                colors={isSubmitting ? ["#999", "#777"] : [colors.primary, "#00D68F"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.bookButtonGradient}
                            >
                                {isSubmitting ? (
                                    <Text style={styles.bookButtonText}>
                                        {isDelivery ? "Requesting..." : "Booking..."}
                                    </Text>
                                ) : (
                                    <>
                                        <Ionicons name={isDelivery ? "send" : "checkmark-circle"} size={22} color={colors.white} />
                                        <Text style={styles.bookButtonText}>
                                            {isDelivery ? "Send Request" : "Confirm Booking"}
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.disclaimer}>
                            By {isDelivery ? "requesting" : "booking"}, you agree to our terms of service. The {isDelivery ? "delivery person" : "nurse"} will confirm your {isDelivery ? "request" : "appointment"}.
                        </Text>

                        <View style={{ height: 30 }} />
                    </ScrollView>

                    {/* Date Picker */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    {/* Time Picker */}
                    {showTimePicker && (
                        <DateTimePicker
                            value={selectedTime}
                            mode="time"
                            display="default"
                            onChange={handleTimeChange}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default BookAppointmentModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: "92%",
        minHeight: "70%",
    },
    modalHeader: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    headerTextContainer: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: Fonts.bold,
        color: colors.white,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 16,
        fontFamily: Fonts.medium,
        color: "rgba(255, 255, 255, 0.95)",
        marginBottom: 8,
    },
    specializationBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
        gap: 4,
    },
    specializationText: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        color: colors.white,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        color: colors.text,
        flex: 1,
    },
    optionalBadge: {
        fontSize: 11,
        fontFamily: Fonts.medium,
        color: colors.gray,
        backgroundColor: colors.background,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    dateTimeRow: {
        flexDirection: "row",
        gap: 12,
    },
    dateTimeCard: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.borderGray,
    },
    dateTimeIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.primary + "15",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    dateTimeInfo: {
        flex: 1,
    },
    dateTimeLabel: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: colors.gray,
        marginBottom: 2,
    },
    dateTimeValue: {
        fontSize: 14,
        fontFamily: Fonts.semiBold,
        color: colors.text,
    },
    serviceTypesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    serviceTypeCard: {
        width: (width - 60) / 2,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1.5,
        borderColor: colors.borderGray,
        position: "relative",
    },
    serviceTypeIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    serviceTypeLabel: {
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        color: colors.text,
        flex: 1,
    },
    checkMark: {
        position: "absolute",
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: colors.white,
    },
    durationsContainer: {
        gap: 10,
        paddingVertical: 4,
    },
    durationChip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: colors.background,
        borderWidth: 1.5,
        borderColor: colors.borderGray,
    },
    durationChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    durationChipText: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: colors.text,
    },
    durationChipTextActive: {
        color: colors.white,
    },
    addressInput: {
        backgroundColor: colors.background,
        borderRadius: 14,
        padding: 16,
        fontSize: 15,
        fontFamily: Fonts.regular,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.borderGray,
        minHeight: 80,
    },
    notesInput: {
        backgroundColor: colors.background,
        borderRadius: 14,
        padding: 16,
        fontSize: 15,
        fontFamily: Fonts.regular,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.borderGray,
        minHeight: 100,
    },
    priceSummary: {
        backgroundColor: "#E8F5E9",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#C8E6C9",
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    priceLabel: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: colors.text,
    },
    priceValue: {
        fontSize: 14,
        fontFamily: Fonts.semiBold,
        color: colors.text,
    },
    priceDivider: {
        height: 1,
        backgroundColor: "#A5D6A7",
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        color: colors.success,
    },
    totalValue: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: colors.success,
    },
    bookButton: {
        borderRadius: 16,
        overflow: "hidden",
        elevation: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    bookButtonDisabled: {
        opacity: 0.7,
    },
    bookButtonGradient: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 18,
        gap: 10,
    },
    bookButtonText: {
        fontSize: 17,
        fontFamily: Fonts.bold,
        color: colors.white,
    },
    disclaimer: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: colors.gray,
        textAlign: "center",
        marginTop: 16,
        lineHeight: 18,
    },
});
