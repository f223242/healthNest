import { colors, Fonts } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import NotificationService from "@/services/NotificationService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NotificationIconWithBadgeProps {
    color?: string;
    onPress?: () => void;
}

const NotificationIconWithBadge: React.FC<NotificationIconWithBadgeProps> = ({
    color = colors.white,
    onPress
}) => {
    const router = useRouter();
    const { user } = useAuthContext();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) {
            console.log("NotificationIconWithBadge: No user found");
            return;
        }

        console.log("NotificationIconWithBadge: Setting up listener for user:", user.uid);
        
        const unsubscribe = NotificationService.listenToNotifications(
            user.uid,
            (notifications) => {
                console.log("NotificationIconWithBadge: Received notifications:", notifications.length);
                const count = notifications.filter((n) => !n.read).length;
                console.log("NotificationIconWithBadge: Unread count:", count);
                setUnreadCount(count);
            }
        );

        return () => {
            console.log("NotificationIconWithBadge: Cleaning up listener");
            unsubscribe();
        };
    }, [user]);

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push("/(protected)/notifications");
        }
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container}>
            <Ionicons name="notifications-outline" size={24} color={color} />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        padding: 4,
    },
    badge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: "#FF3B30",
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 2,
        borderWidth: 1.5,
        borderColor: colors.white, // Or transparent if background varies? White looks good on colored headers if border.
    },
    badgeText: {
        color: colors.white,
        fontSize: 9,
        fontFamily: Fonts.bold,
    },
});

export default NotificationIconWithBadge;
