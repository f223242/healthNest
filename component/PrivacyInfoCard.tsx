import { appStyles, colors } from "@/constant/theme";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Collapsible from "react-native-collapsible";

interface PrivacyInfoCardProps {
  title?: string;
  summary?: string;
  fullContent?: string;
}

const PrivacyInfoCard: React.FC<PrivacyInfoCardProps> = ({
  title = "Privacy Policy",
  summary = "We take your privacy seriously. Your data is encrypted and securely stored. We never share your personal information with third parties without your explicit consent.",
  fullContent = `Privacy Policy - Full Details

1. Information Collection
We collect information that you provide directly to us, including:
• Personal information (name, email, phone number)
• Health records and medical history
• Appointment and consultation data
• Payment and billing information

2. How We Use Your Information
Your information is used to:
• Provide and improve our healthcare services
• Schedule and manage appointments
• Communicate with healthcare providers
• Process payments and billing
• Send important notifications and updates

3. Data Security
We implement industry-standard security measures:
• End-to-end encryption for all data
• Secure servers with regular backups
• Two-factor authentication options
• Regular security audits and updates

4. Data Sharing
We do not sell your personal information. We only share data:
• With your healthcare providers (with consent)
• When required by law
• To process payments through secure gateways
• With your explicit permission

5. Your Rights
You have the right to:
• Access your personal data
• Request data corrections
• Delete your account and data
• Export your data
• Opt-out of marketing communications

6. Cookies and Tracking
We use cookies and similar technologies to:
• Improve user experience
• Analyze app performance
• Remember your preferences
• Provide personalized content

7. Changes to Privacy Policy
We may update this policy periodically. You will be notified of significant changes via email or in-app notifications.

8. Contact Us
If you have questions about this privacy policy, please contact us at:
Email: privacy@healthnest.com
Phone: +92 300 1234567

Last Updated: November 20, 2025`,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.infoContainer}>
      <Text style={appStyles.cardTitle}>{title}</Text>
      <Text style={[appStyles.bodyText, { marginTop: 8 }]}>{summary}</Text>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={appStyles.linkText}>
          {isExpanded ? "Hide Full Privacy Policy ↑" : "Read Full Privacy Policy →"}
        </Text>
      </TouchableOpacity>

      <Collapsible collapsed={!isExpanded}>
        <View style={styles.expandedContent}>
          <Text style={appStyles.bodyText}>{fullContent}</Text>
        </View>
      </Collapsible>
    </View>
  );
};

export default PrivacyInfoCard;

const styles = StyleSheet.create({
  infoContainer: {
    marginTop: 32,
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 16,
  },
  linkButton: {
    marginTop: 12,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.primary,
  },
});
