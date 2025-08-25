import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import GameScreen from "../screens/GameScreen";
import MenuScreen from "../screens/MenuScreen";
import CognitiveTestScreen from "../screens/CognitiveTestScreen";
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
      headerShown: false,
      tabBarShowLabel: true, // ถ้าอยากให้ชื่อ Tab ยังอยู่
      tabBarIcon: () => null, // ลบ icon
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "🏠 หน้าแรก" }} />
      <Tab.Screen name="6CIT" component={CognitiveTestScreen} options={{ title: "🧠 6CIT" }} />
      <Tab.Screen name="Game" component={GameScreen} options={{ title: "🎮 เกม" }} />
      <Tab.Screen name="Menu" component={MenuScreen} options={{ title: "☰ เมนู" }} />
    </Tab.Navigator>
  );
}
