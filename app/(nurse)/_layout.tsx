import { Stack } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: "slide_from_right",
    }}>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }}/>
      <Stack.Screen name='nurse-chat-detail' options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="delete-account" options={{ headerShown: false }}  />
      <Stack.Screen name="help-support" options={{ headerShown: false }}  />
      <Stack.Screen name="about" options={{ headerShown: false }}  />
    </Stack>
  )
}

export default _layout
