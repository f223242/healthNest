import { Fonts } from "@/constant/theme";
import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack screenOptions={{headerTitleAlign:'center',headerShown:true,headerShadowVisible:false,headerTitleStyle:{
        fontSize: 18,
                fontFamily: Fonts.bold,
    }}}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="select-labs" options={{headerTitle:"Select Labs"}}  />
      <Stack.Screen name="lab-services" options={{headerShown: true,headerTitle:"Lab Services"}}  />
      <Stack.Screen name="lab-booking-form" options={{headerShown: true,headerTitle:"Booking Details"}}  />
      <Stack.Screen name="edit-profile" options={{headerTitle: "Edit Profile" }} />
      <Stack.Screen name="change-password" options={{headerTitle:"Change Password"}}  />
      <Stack.Screen name="privacy" options={{headerTitle:"Privacy"}} />
      <Stack.Screen name="notifications" options={{headerTitle:"Notifications"}}  />
      <Stack.Screen name="request-medicine" options={{headerTitle:"Request Medicine"}}  />
      <Stack.Screen name="medicine-chat" options={{headerShown: true, headerTitle: "Chat"}}  />
    </Stack>
  );
};

export default _layout;
