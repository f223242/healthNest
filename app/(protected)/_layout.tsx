import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: "slide_from_right",
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="additional-info" options={{ headerShown: false }} />
      <Stack.Screen name="select-labs" options={{ headerShown: false }}  />
      <Stack.Screen name="lab-services" options={{ headerShown: false }}  />
      <Stack.Screen name="lab-booking-form" options={{ headerShown: false }}  />
      <Stack.Screen name="lab-profile" options={{ headerShown: false }}  />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="change-password" options={{ headerShown: false }}  />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }}  />
      <Stack.Screen name="request-medicine" options={{ headerShown: false }}  />
      <Stack.Screen name="delivery-profile" options={{ headerShown: false }}  />
      <Stack.Screen name="nursing-services" options={{ headerShown: false }}  />
      <Stack.Screen name="nurse-profile" options={{ headerShown: false }}  />
      <Stack.Screen name="complain" options={{ headerShown: false }}  />
      <Stack.Screen name="my-complaints" options={{ headerShown: false }}  />
      <Stack.Screen name="medicine-chat" options={{ headerShown: false }}  />
      <Stack.Screen name="general-chat" options={{ headerShown: false }}  />
      <Stack.Screen name="nurse-chats" options={{ headerShown: false }}  />
      <Stack.Screen name="nurse-chat-detail" options={{ headerShown: false }}  />
      <Stack.Screen name="medicine-delivery-chats" options={{ headerShown: false }}  />
      <Stack.Screen name="delivery-chat-detail" options={{ headerShown: false }}  />
    </Stack>
  );
};

export default _layout;
