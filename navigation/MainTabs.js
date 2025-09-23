import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; 
import HomeScreen from "../screens/Menu/HomeScreen";
import CognitiveTestScreen from "../screens/Menu/CognitiveTestScreen";
import GameScreen from "../screens/Menu/GameScreen";
import MenuScreen from "../screens/Menu/MenuScreen";

const Tab = createBottomTabNavigator();

const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;

export default function MainTabs({ email, setEmail }) {
  const insets = useSafeAreaInsets(); 

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: vh(1.5),
          fontWeight: "600",
          marginBottom: vh(0.5),
        },
        tabBarStyle: {
          height: vh(9) + insets.bottom,
          backgroundColor: "#FFFFFF",
          paddingBottom: insets.bottom > 0 ? insets.bottom : vh(1.2),
          paddingTop: vh(0.8),

          // iOS shadow
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: vh(0.5) },
          shadowRadius: vh(1.5),

          // Android shadow
          elevation: 8,

          borderTopWidth: 0.5,
          borderTopColor: "rgba(0,0,0,0.1)",
        },
        tabBarItemStyle: {
          paddingVertical: vh(0.5),
        },
        tabBarIconStyle: {
          marginTop: vh(0.2),
        },
        tabBarActiveTintColor: "#ff7f32",
        tabBarInactiveTintColor: "#9AA0A6",
        tabBarHideOnKeyboard: true,
        // ✅ ลดเอฟเฟกต์กด
        tabBarButton: (props) => (
          <TouchableOpacity {...props} activeOpacity={0.7} />
        ),
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
          return <Ionicons name={iconName} size={vh(2.8)} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" options={{ title: "หน้าแรก" }}>
        {(props) => <HomeScreen {...props} email={email} setEmail={setEmail} />}
      </Tab.Screen>
      <Tab.Screen name="6CIT" options={{ title: "6CIT" }}>
        {(props) => <CognitiveTestScreen {...props} email={email} setEmail={setEmail} />}
      </Tab.Screen>
      <Tab.Screen name="Game" component={GameScreen} options={{ title: "เกม" }} />
      <Tab.Screen name="Menu" options={{ title: "เมนู" }}>
        {(props) => <MenuScreen {...props} email={email} setEmail={setEmail} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
