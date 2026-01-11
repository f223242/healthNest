import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { useState } from "react";
import {
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

interface BookDeliveryModalProps {
    visible: boolean;
    onClose: () => void;
    onBook: (appointmentData: {
        date: string;
        time: string;
        serviceType: string;
        notes: string;
        address: string;
    }) => void;
    deliveryName: string;
}

const BookDeliveryModal: React.FC<BookDeliveryModalProps> = (props) => {
    const { visible, onClose, onBook, deliveryName } = props;
    const toast = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [serviceType, setServiceType] = useState("Medicine Delivery");
    const [notes, setNotes] = useState("");
    const [address, setAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === "ios");
        if (date) setSelectedDate(date);
    };

    const handleTimeChange = (event: any, time?: Date) => {
        setShowTimePicker(Platform.OS === "ios");
        if (time) setSelectedTime(time);
    };

    const formatDate = (date: Date): string => date.toISOString().split("T")[0];
    const formatTime = (time: Date): string => time.toTimeString().split(" ")[0].substring(0, 5);

    const handleBook = async () => {
        if (!address.trim()) {
            toast.show({ type: "error", text1: "Required Field", text2: "Please enter delivery address" });
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
            });
            setNotes("");
            setAddress("");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient colors={[colors.primary, "#00D68F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalHeader}>
                        <View style={styles.headerContent}>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.modalTitle}>Request Delivery</Text>
                                <Text style={styles.modalSubtitle}>with {deliveryName}</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                <Text style={styles.sectionTitle}>Schedule</Text>
                            </View>

                            <View style={styles.dateTimeRow}>
                                <TouchableOpacity style={styles.dateTimeCard} onPress={() => setShowDatePicker(true)}>
                                    <View style={styles.dateTimeIconContainer}><Ionicons name="calendar" size={24} color={colors.primary} /></View>
                                    <View style={styles.dateTimeInfo}><Text style={styles.dateTimeLabel}>Date</Text><Text style={styles.dateTimeValue}>{selectedDate.toLocaleDateString()}</Text></View>
                                    <Ionicons name="chevron-forward" size={16} color={colors.gray} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.dateTimeCard} onPress={() => setShowTimePicker(true)}>
                                    <View style={styles.dateTimeIconContainer}><Ionicons name="time" size={24} color={colors.primary} /></View>
                                    <View style={styles.dateTimeInfo}><Text style={styles.dateTimeLabel}>Time</Text><Text style={styles.dateTimeValue}>{selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></View>
                                    <Ionicons name="chevron-forward" size={16} color={colors.gray} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="location-outline" size={20} color={colors.primary} />
                                <Text style={styles.sectionTitle}>Delivery Address *</Text>
                            </View>

                            <TextInput style={styles.addressInput} placeholder="Enter full delivery address..." placeholderTextColor={colors.gray} value={address} onChangeText={setAddress} multiline numberOfLines={3} textAlignVertical="top" />
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                                <Text style={styles.sectionTitle}>Notes</Text>
                            </View>

                            <TextInput style={styles.notesInput} placeholder="Any special instructions..." placeholderTextColor={colors.gray} value={notes} onChangeText={setNotes} multiline numberOfLines={4} textAlignVertical="top" />
                        </View>

                        <TouchableOpacity style={[styles.bookButton, isSubmitting && styles.bookButtonDisabled]} onPress={handleBook} disabled={isSubmitting}>
                            <LinearGradient colors={isSubmitting ? ["#999","#777"] : [colors.primary, "#00D68F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bookButtonGradient}>
                                {isSubmitting ? <Text style={styles.bookButtonText}>Requesting...</Text> : <><Ionicons name="send" size={20} color={colors.white} /><Text style={styles.bookButtonText}>Send Request</Text></>}
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.disclaimer}>By requesting, you agree to our terms of service. The delivery person will confirm your request.</Text>
                        <View style={{ height: 30 }} />
                    </ScrollView>

                    {showDatePicker && (<DateTimePicker value={selectedDate} mode="date" display="default" onChange={handleDateChange} minimumDate={new Date()} />)}
                    {showTimePicker && (<DateTimePicker value={selectedTime} mode="time" display="default" onChange={handleTimeChange} />)}
                </View>
            </View>
        </Modal>
    );
};

export default BookDeliveryModal;

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
    modalContainer: { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "92%", minHeight: "50%" },
    modalHeader: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
    headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    headerTextContainer: { flex: 1 },
    modalTitle: { fontSize: 20, fontFamily: Fonts.bold, color: colors.white, marginBottom: 4 },
    modalSubtitle: { fontSize: 14, fontFamily: Fonts.medium, color: "rgba(255,255,255,0.95)", marginBottom: 8 },
    closeButton: { padding: 6 },
    modalContent: { paddingHorizontal: 20, paddingTop: 16 },
    section: { marginBottom: 16 },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    sectionTitle: { fontFamily: Fonts.semiBold, marginLeft: 8, color: colors.black },
    dateTimeRow: { flexDirection: "row", justifyContent: "space-between" },
    dateTimeCard: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#F5F6F8", padding: 12, borderRadius: 10, marginRight: 8 },
    dateTimeIconContainer: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.primary + "20", justifyContent: "center", alignItems: "center", marginRight: 10 },
    dateTimeInfo: { flex: 1 },
    dateTimeLabel: { fontFamily: Fonts.medium, color: colors.gray, fontSize: 12 },
    dateTimeValue: { fontFamily: Fonts.semiBold, color: colors.black },
    addressInput: { backgroundColor: "#F5F6F8", padding: 12, borderRadius: 10, minHeight: 80, color: colors.black },
    notesInput: { backgroundColor: "#F5F6F8", padding: 12, borderRadius: 10, minHeight: 80, color: colors.black },
    bookButton: { marginTop: 12, marginHorizontal: 0, borderRadius: 12, overflow: "hidden" },
    bookButtonDisabled: { opacity: 0.7 },
    bookButtonGradient: { paddingVertical: 14, paddingHorizontal: 20, flexDirection: "row", justifyContent: "center", alignItems: "center" },
    bookButtonText: { color: colors.white, fontFamily: Fonts.semiBold, marginLeft: 8 },
    disclaimer: { fontSize: 12, color: colors.gray, marginTop: 12, textAlign: "center" },
});