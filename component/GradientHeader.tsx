import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface GradientHeaderProps {
    userInfo: {
        firstName?: string;
        fullName: string;
        profileImage?: string | null;
    };
    stats: {
        nurses: number;
        labs: number;
        delivery: number;
    };
    onPressNurses: () => void;
    onPressLabs: () => void;
    onPressDelivery: () => void;
    onLayout?: (event: any) => void;
}

const GradientHeader: React.FC<GradientHeaderProps> = ({
    userInfo,
    stats,
    onPressNurses,
    onPressLabs,
    onPressDelivery,
    onLayout,
}) => {
    const insets = useSafeAreaInsets();

    return (
        <LinearGradient
            colors={[colors.primary, '#00D68F'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
            onLayout={onLayout}
        >
            <Animatable.View animation="fadeInDown" duration={600} style={styles.welcomeSection}>
                <View style={styles.welcomeContent}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.nameText}>{userInfo.firstName || userInfo.fullName}</Text>
                </View>
                {userInfo.profileImage ? (
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: userInfo.profileImage }}
                            style={styles.welcomeAvatar}
                        />
                    </View>
                ) : (
                    <View style={styles.avatarContainer}>
                        <View style={styles.welcomeAvatarPlaceholder}>
                            <Text style={styles.avatarInitials}>
                                {(userInfo.firstName || userInfo.fullName).substring(0, 2).toUpperCase()}
                            </Text>
                        </View>
                    </View>
                )}
            </Animatable.View>

            {/* Stats in Header */}
            <Animatable.View animation="fadeInUp" delay={100} style={styles.headerStats}>
                <TouchableOpacity style={styles.headerStatItem} onPress={onPressNurses}>
                    <View style={styles.headerStatIcon}>
                        <Ionicons name="people-outline" size={18} color={colors.white} />
                    </View>
                    <Text style={styles.headerStatValue}>{stats.nurses}</Text>
                    <Text style={styles.headerStatLabel}>Nurses</Text>
                </TouchableOpacity>

                <View style={styles.headerStatDivider} />

                <TouchableOpacity style={styles.headerStatItem} onPress={onPressLabs}>
                    <View style={styles.headerStatIcon}>
                        <Ionicons name="flask-outline" size={18} color={colors.white} />
                    </View>
                    <Text style={styles.headerStatValue}>{stats.labs}</Text>
                    <Text style={styles.headerStatLabel}>Labs</Text>
                </TouchableOpacity>

                <View style={styles.headerStatDivider} />

                <TouchableOpacity style={styles.headerStatItem} onPress={onPressDelivery}>
                    <View style={styles.headerStatIcon}>
                        <Ionicons name="bicycle-outline" size={18} color={colors.white} />
                    </View>
                    <Text style={styles.headerStatValue}>{stats.delivery}</Text>
                    <Text style={styles.headerStatLabel}>Delivery</Text>
                </TouchableOpacity>
            </Animatable.View>
        </LinearGradient>
    );
};

export default GradientHeader;

const styles = StyleSheet.create({
    headerGradient: {
        paddingBottom: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        width: '100%',
    },
    welcomeSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    welcomeContent: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: 'rgba(255,255,255,0.85)',
    },
    nameText: {
        fontSize: 26,
        fontFamily: Fonts.bold,
        color: colors.white,
        marginTop: 4,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
        overflow: 'hidden',
    },
    welcomeAvatar: {
        width: '100%',
        height: '100%',
    },
    welcomeAvatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitials: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: colors.white,
    },
    headerStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 16,
    },
    headerStatItem: {
        alignItems: 'center',
        flex: 1,
    },
    headerStatIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerStatValue: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: colors.white,
    },
    headerStatLabel: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    headerStatDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
});
