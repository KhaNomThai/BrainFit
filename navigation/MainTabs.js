import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; 
import HomeScreen from "../screens/Menu/HomeScreen";
import CognitiveTestScreen from "../screens/Menu/CognitiveTestScreen";
import GameScreen from "../screens/Menu/GameScreen";
import MenuScreen from "../screens/Menu/MenuScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs({ email, setEmail }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 14,
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
        tabBarActiveTintColor: "#e4710dff",
        tabBarInactiveTintColor: "#aaa",
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "6CIT") {
            iconName = focused ? "body" : "body-outline";
          } else if (route.name === "Game") {
            iconName = focused ? "game-controller" : "game-controller-outline";
          } else if (route.name === "Menu") {
            iconName = focused ? "menu" : "menu-outline";
          }
          return <Ionicons name={iconName} size={26} color={color} />;
        },
      })}
    >
      {/* <Tab.Screen name="Home" component={HomeScreen} options={{ title: "หน้าแรก" }} /> */}
      <Tab.Screen 
        name="Home" 
        options={{ title: "หน้าแรก" }}
      >
        {(props) => <HomeScreen {...props} email={email} setEmail={setEmail} />} 
      </Tab.Screen>
      <Tab.Screen 
        name="6CIT" 
        options={{ title: "6CIT" }}
      >
        {(props) => <CognitiveTestScreen {...props} email={email} setEmail={setEmail} />} 
      </Tab.Screen>
      <Tab.Screen name="Game" component={GameScreen} options={{ title: "เกม" }} />
      {/* <Tab.Screen name="Menu" component={MenuScreen} options={{ title: "เมนู" }} /> */}
      <Tab.Screen 
        name="Menu" 
        options={{ title: "เมนู" }}
      >
        {(props) => <MenuScreen {...props} email={email} setEmail={setEmail} />} 
      </Tab.Screen>
    </Tab.Navigator>
  );
}
