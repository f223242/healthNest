import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const _layout = () => {
  return (
    <Stack screenOptions={{
      headerTitleAlign:'center',
      headerShown:true,
      headerShadowVisible:false,
      headerTitleStyle:{
        fontSize: 18,
        fontFamily: Fonts.bold,
      },
      headerStyle: {
        backgroundColor: colors.white,
      },
      // headerTintColor: colors.primary,
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="select-labs" options={{headerTitle:"Select Labs"}}  />
      <Stack.Screen name="lab-services" options={{headerShown: true,headerTitle:"Lab Services"}}  />
      <Stack.Screen name="lab-booking-form" options={{headerShown: true,headerTitle:"Booking Details"}}  />
      <Stack.Screen name="edit-profile" options={{headerTitle: "Edit Profile" }} />
      <Stack.Screen name="change-password" options={{headerTitle:"Change Password"}}  />
      <Stack.Screen name="privacy" options={{headerTitle:"Privacy"}} />
      <Stack.Screen name="notifications" options={{headerTitle:"Notifications"}}  />
      <Stack.Screen name="request-medicine" options={{headerTitle:"Request Medicine"}}  />
      <Stack.Screen name="medicine-chat" options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerShadowVisible: true,
        headerTitle: () => (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontFamily: Fonts.bold, color: colors.black }}>Medicine Delivery</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={{ 
                width: 8, 
                height: 8, 
                borderRadius: 4, 
                backgroundColor: colors.success, 
                marginRight: 6 
              }} />
              <Text style={{ fontSize: 11, fontFamily: Fonts.medium, color: colors.success }}>Online</Text>
            </View>
          </View>
        )
      }}  />
      <Stack.Screen name="general-chat" options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerShadowVisible: true,
        headerTitle: () => (
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
            <LinearGradient
              colors={[colors.primary, '#00D68F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 18,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="chatbubbles" size={20} color={colors.white} />
            </LinearGradient>
            <View>
              <Text style={{ fontSize: 18, fontFamily: Fonts.bold, color: colors.black }}>Tora AI Assistant</Text>
              <Text style={{ fontSize: 11, fontFamily: Fonts.medium, color: colors.primary }}>Always available</Text>
            </View>
          </View>
        )
      }}  />
    </Stack>
  );
};

export default _layout;
