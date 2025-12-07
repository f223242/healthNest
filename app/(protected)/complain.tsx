import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ComplainToAdmin = () => {
  const router = useRouter();
  const toast = useToast();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const categories = [
    { id: 1, label: "Service Quality", icon: "star-outline" },
    { id: 2, label: "Technical Issue", icon: "bug-outline" },
    { id: 3, label: "Billing Problem", icon: "card-outline" },
    { id: 4, label: "Provider Behavior", icon: "people-outline" },
    { id: 5, label: "Other", icon: "ellipsis-horizontal-outline" },
  ];

  const handleSubmit = () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!message.trim()) {
      toast.error("Please describe your complaint");
      return;
    }

    // Handle complaint submission
    toast.success("Your complaint has been submitted. Our admin team will review it shortly.");
    setTimeout(() => router.back(), 2000);
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            We take your feedback seriously. Please provide detailed information
            about your complaint so we can address it properly.
          </Text>
        </View>

        {/* Subject */}
        <View style={styles.section}>
          <Text style={appStyles.sectionTitle}>Subject</Text>
          <FormInput
            placeholder="Brief description of your complaint"
            value={subject}
            onChangeText={setSubject}
            containerStyle={styles.input}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={appStyles.sectionTitle}>Category</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  category === cat.label && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat.label)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={18}
                  color={
                    category === cat.label ? colors.white : colors.primary
                  }
                />
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.label && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Detailed Message */}
        <View style={styles.section}>
          <Text style={appStyles.sectionTitle}>Describe Your Complaint</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Provide detailed information about your complaint..."
              placeholderTextColor={colors.gray}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.charCount}>{message.length} / 500</Text>
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Guidelines</Text>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>
              Be specific and provide relevant details
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>
              Include date and time if applicable
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>
              Mention names or service IDs involved
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>
              Maintain a respectful tone
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <AppButton
          title="Submit Complaint"
          onPress={handleSubmit}
          containerStyle={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ComplainToAdmin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.black,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  input: {
    marginTop: 8,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  categoryTextActive: {
    color: colors.white,
  },
  textAreaContainer: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: colors.borderGray,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
    minHeight: 120,
    maxHeight: 200,
  },
  charCount: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "right",
    marginTop: 4,
  },
  guidelinesCard: {
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 12,
  },
  guidelineItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
    marginRight: 8,
  },
  guidelineText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.black,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: 8,
  },
});
