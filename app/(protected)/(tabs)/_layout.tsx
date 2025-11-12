import { Tabs } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#34A853",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
        tabBarStyle: { height: 60, paddingBottom: 5 },
        tabBarInactiveTintColor: "#777",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
        }}
      />
    </Tabs>
  );
};

export default _layout;
