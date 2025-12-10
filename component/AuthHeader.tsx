import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Animated, Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AuthHeaderProps {
    // For login screen - shows logo
    showLogo?: boolean;
    logoSource?: any;
    brandName?: string;
    brandTagline?: string;

    // For other auth screens - shows icon
    icon?: keyof typeof Ionicons.glyphMap;
    iconSize?: number;
    title?: string;
    subtitle?: string;

    // Animation values (optional)
    fadeAnim?: Animated.Value;
    scaleAnim?: Animated.Value;

    // Custom styling
    containerStyle?: ViewStyle;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
    showLogo = false,
    logoSource,
    brandName = "HealthNest",
    brandTagline = "Your Health, Our Priority",
    icon,
    iconSize = 36,
    title,
    subtitle,
    fadeAnim,
    scaleAnim,
    containerStyle,
}) => {
    const insets = useSafeAreaInsets();

    const animatedStyle = fadeAnim ? { opacity: fadeAnim } : {};
    const scaleStyle = scaleAnim ? { transform: [{ scale: scaleAnim }] } : {};

    return (
        <LinearGradient
            colors={[colors.primary, "#00B976", "#00D68F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
                styles.headerGradient,
                { paddingTop: insets.top + 20 },
                containerStyle
            ]}
        >
            {showLogo ? (
                // Logo variant for login screen
                <Animated.View style={[styles.logoContainer, animatedStyle, scaleStyle]}>
                    <View style={styles.logoCircle}>
                        {logoSource ? (
                            <Image
                                source={logoSource}
                                style={styles.logoImage}
                            />
                        ) : (
                            <Ionicons name="heart" size={40} color={colors.primary} />
                        )}
                    </View>
                    <Text style={styles.brandName}>{brandName}</Text>
                    <Text style={styles.brandTagline}>{brandTagline}</Text>
                </Animated.View>
            ) : (
                // Icon variant for other auth screens
                <Animated.View style={[styles.headerContent, animatedStyle]}>
                    <View style={styles.headerIconCircle}>
                        <Ionicons name={icon || "person"} size={iconSize} color={colors.white} />
                    </View>
                    <Text style={styles.headerTitle}>{title}</Text>
                    {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
                </Animated.View>
            )}
        </LinearGradient>
    );
};

export default AuthHeader;

const styles = StyleSheet.create({
    headerGradient: {
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 10,
        elevation: 8,
    },

    // Logo variant styles
    logoContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    logoImage: {
        width: 60,
        height: 60,
        resizeMode: "contain",
    },
    brandName: {
        fontSize: 28,
        fontFamily: Fonts.bold,
        color: colors.white,
        marginBottom: 4,
    },
    brandTagline: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: "rgba(255,255,255,0.9)",
    },

    // Icon variant styles
    headerContent: {
        alignItems: "center",
        paddingVertical: 20,
    },
    headerIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 26,
        fontFamily: Fonts.bold,
        color: colors.white,
        marginBottom: 6,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: "rgba(255,255,255,0.85)",
        textAlign: "center",
        paddingHorizontal: 40,
    },
});
