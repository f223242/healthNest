import { colors, Fonts } from '@/constant/theme'
import { Stack } from 'expo-router'
import React from 'react'

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
        animation: "slide_from_right",
        // headerTintColor: colors.primary,
      }}>
    <Stack.Screen name='(tabs)' options={{headerShown:false}}/>
    <Stack.Screen name='nurse-chat-detail' options={{headerTitle:"Nurse Profile",headerShadowVisible:true}
    } />
    <Stack.Screen name="edit-profile" options={{headerTitle: "Edit Profile" }} />
     <Stack.Screen name="delete-account" options={{headerTitle:"Delete Account"}}  />
     <Stack.Screen name="help-support" options={{headerTitle:"Help & Support"}}  />
     <Stack.Screen name="about" options={{headerTitle:"About App"}}  />
   </Stack>
  )
}

export default _layout
