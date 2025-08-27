import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // ✅ ต้องติดตั้ง: expo install @expo/vector-icons
import HomeScreen from "../screens/HomeScreen";
import CognitiveTestScreen from "../screens/CognitiveTestScreen";
import GameScreen from "../screens/GameScreen";
import MenuScreen from "../screens/MenuScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 14,   // ✅ ขนาดกำลังดี
          fontWeight: "600",
          marginBottom: 5,
        },
        tabBarStyle: {
          height: 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
          backgroundColor: "#ffffff",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -3 },
          shadowRadius: 5,
          elevation: 5,
        },
        tabBarActiveTintColor: "#008080", // ✅ สีหลักเมื่อ active
        tabBarInactiveTintColor: "#aaa",  // ✅ สีตอน inactive
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "6CIT") {
            iconName = focused ? "brain" : "ellipse-outline"; // brain ไม่มีใน Ionicons
          } else if (route.name === "Game") {
            iconName = focused ? "game-controller" : "game-controller-outline";
          } else if (route.name === "Menu") {
            iconName = focused ? "menu" : "menu-outline";
          }

          return <Ionicons name={iconName} size={26} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "หน้าแรก" }} />
      <Tab.Screen name="6CIT" component={CognitiveTestScreen} options={{ title: "6CIT" }} />
      <Tab.Screen name="Game" component={GameScreen} options={{ title: "เกม" }} />
      <Tab.Screen name="Menu" component={MenuScreen} options={{ title: "เมนู" }} />
    </Tab.Navigator>
  );
}
