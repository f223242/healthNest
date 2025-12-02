import { colors, Fonts } from '@/constant/theme';
import { Stack } from 'expo-router';
import React from 'react';

const LabLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerShown: true,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontSize: 18,
          fontFamily: Fonts.bold,
        },
        headerStyle: {
          backgroundColor: colors.white,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="test-detail" options={{ headerTitle: 'Test Details' }} />
      <Stack.Screen name="edit-profile" options={{ headerTitle: 'Edit Profile' }} />
      <Stack.Screen name="delete-account" options={{ headerTitle: 'Delete Account' }} />
      <Stack.Screen name="help" options={{ headerTitle: 'Help & Support' }} />
      <Stack.Screen name="about" options={{ headerTitle: 'About App' }} />
    </Stack>
  );
};

export default LabLayout;
