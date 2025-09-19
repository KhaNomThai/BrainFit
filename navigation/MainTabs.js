import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions } from "react-native";
import HomeScreen from "../screens/Menu/HomeScreen";
import CognitiveTestScreen from "../screens/Menu/CognitiveTestScreen";
import GameScreen from "../screens/Menu/GameScreen";
import MenuScreen from "../screens/Menu/MenuScreen";

const Tab = createBottomTabNavigator();

const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;
export default function MainTabs({ email, setEmail }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: vh(1.6),
          fontWeight: "700",
          marginBottom: 0,
          marginLeft: vw(1),
        },
        // ทำให้ "ลอย" + ใหญ่ขึ้น
        tabBarStyle: {
          height: vh(10),
          position: "absolute",
          left: vw(4.5),
          right: vw(4.5),
          // bottom: vh(2.2),                  // เว้นจากขอบล่างให้ลอย
          borderRadius: vw(8),              // โค้งมนแบบแคปซูล
          backgroundColor: "#FFFFFF",
          paddingBottom: vh(1.2),           // กันจอมี home indicator (iOS) ดูไม่อึดอัด
          paddingTop: vh(0.8),

          // iOS shadow
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: vh(1) },
          shadowRadius: vh(2),
          // Android shadow
          elevation: 20,
          // เส้นขอบจาง ๆ ให้ตัดกับพื้น
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.05)",
        },
        tabBarItemStyle: {
          paddingVertical: vh(0.8),    // เพิ่มพื้นที่กด
        },
        tabBarIconStyle: {
          marginTop: vh(0.5),
        },
        tabBarActiveTintColor: "#e4710dff",
        tabBarInactiveTintColor: "#9AA0A6",
        tabBarHideOnKeyboard: true, // เปิดคีย์บอร์ดแล้วซ่อนแถบ
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
          return <Ionicons name={iconName} size={vh(3)} color={color} />; // ไอคอนใหญ่สะใจ
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
