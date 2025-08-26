import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import CognitiveTestScreen from "../screens/CognitiveTestScreen";
import GameScreen from "../screens/GameScreen";
import MenuScreen from "../screens/MenuScreen";

const Tab = createBottomTabNavigator(); // ✅ ต้องมีบรรทัดนี้

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarIcon: () => null, // ลบ icon
        tabBarLabelStyle: {
          fontSize: 50,      // ✅ ปรับขนาดตัวอักษร
          fontWeight: "bold",// ✅ ทำให้หนาขึ้น
          paddingBottom: 5,  // ✅ ขยับลงมาเล็กน้อย
        },
        tabBarStyle: {
          height: 100,        // ✅ ทำให้แถบด้านล่างสูงขึ้น
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "🏠 หน้าแรก" }} />
      <Tab.Screen name="6CIT" component={CognitiveTestScreen} options={{ title: "🧠 6CIT" }} />
      <Tab.Screen name="Game" component={GameScreen} options={{ title: "🎮 เกม" }} />
      <Tab.Screen name="Menu" component={MenuScreen} options={{ title: "☰ เมนู" }} />
    </Tab.Navigator>
  );
}
