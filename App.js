import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
// ↑ ถ้าใช้ชุดไหนเพิ่ม (AntDesign/FontAwesome) ให้ import แล้วใส่ใน useFonts ด้านล่าง

import LoginScreen from "./screens/Login/LoginScreen";
import RegisterScreen from "./screens/Login/RegisterScreen";
import OTPScreen from "./screens/Login/OTPScreen";
import ForgotPasswordScreen from "./screens/ForgotPassword/ForgotPasswordScreen";
import ForgotPasswordResetScreen from "./screens/ForgotPassword/ForgotPasswordResetScreen";
import ForgotPasswordVerifyScreen from "./screens/ForgotPassword/ForgotPasswordOtpScreen";
import BottomTabs from "./navigation/MainTabs";
import FastMath from "./screens/Gamescreen/FastMath";
import SoundRecognize from "./screens/Gamescreen/SoundRecognize";
import MatchingWord from "./screens/Gamescreen/MatchingWord";
import StoryGame from "./screens/Gamescreen/StoryGame";
import RelationMatch from "./screens/Gamescreen/RelationMatch";
import MemoryGame from "./screens/Gamescreen/MemoryGame";
import NumberScreen from "./screens/Gamescreen/NumberScreen";
import GamepictureScreen from "./screens/Gamescreen/GamepictureScreen";
import MainScreen from "./screens/Login/MainScreen";

SplashScreen.preventAutoHideAsync(); // ค้างที่ splash จนกว่าจะโหลดฟอนต์เสร็จ

const Stack = createNativeStackNavigator();

export default function App() {
  // ✅ โหลดฟอนต์ของชุดไอคอนที่ใช้จริง
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...MaterialCommunityIcons.font,
  });

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [age, setAge] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [initialRoute, setInitialRoute] = React.useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const savedEmail = await AsyncStorage.getItem("userEmail");
        if (token && savedEmail) {
          setEmail(savedEmail);
          setInitialRoute("MainTabs");
        } else {
          setInitialRoute("main");
        }
      } catch {
        setInitialRoute("main");
      }
    };
    checkLoginStatus();
  }, []);

  // ซ่อน splash เมื่อฟอนต์ + initialRoute พร้อมแล้ว
  useEffect(() => {
    if (fontsLoaded && initialRoute) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initialRoute]);

  // รอทั้งฟอนต์และ initialRoute ให้พร้อมก่อน
  if (!fontsLoaded || !initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="main">
          {(props) => <MainScreen {...props} />}
        </Stack.Screen>

        <Stack.Screen name="login">
          {(props) => (
            <LoginScreen
              {...props}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="register">
          {(props) => (
            <RegisterScreen
              {...props}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              fullName={fullName}
              setFullName={setFullName}
              height={height}
              setHeight={setHeight}
              weight={weight}
              setWeight={setWeight}
              age={age}
              setAge={setAge}
              gender={gender}
              setGender={setGender}
              address={address}
              setAddress={setAddress}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="otp">
          {(props) => (
            <OTPScreen
              {...props}
              email={email}
              password={password}
              fullName={fullName}
              height={height}
              weight={weight}
              age={age}
              gender={gender}
              address={address}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="forgotpassword">
          {(props) => (
            <ForgotPasswordScreen
              {...props}
              email={email}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="forgotpasswordreset">
          {(props) => (
            <ForgotPasswordResetScreen
              {...props}
              email={email}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="forgotpasswordverify">
          {(props) => (
            <ForgotPasswordVerifyScreen
              {...props}
              email={email}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="FastMath" options={{ headerShown: true }}>
          {(props) => <FastMath {...props} email={email} setEmail={setEmail} setPassword={setPassword} />}
        </Stack.Screen>

        <Stack.Screen name="SoundRecognize" options={{ headerShown: true }}>
          {(props) => <SoundRecognize {...props} email={email} setEmail={setEmail} setPassword={setPassword} />}
        </Stack.Screen>

        <Stack.Screen name="StoryGame" options={{ headerShown: true }}>
          {(props) => <StoryGame {...props} email={email} setEmail={setEmail} setPassword={setPassword} />}
        </Stack.Screen>

        <Stack.Screen name="MatchingWord" options={{ headerShown: true }}>
          {(props) => <MatchingWord {...props} email={email} setEmail={setEmail} setPassword={setPassword} />}
        </Stack.Screen>

        <Stack.Screen name="RelationMatch" options={{ headerShown: true }}>
          {(props) => <RelationMatch {...props} email={email} setEmail={setEmail} setPassword={setPassword} />}
        </Stack.Screen>

        <Stack.Screen name="MemoryGame" options={{ headerShown: true }}>
          {(props) => <MemoryGame {...props} email={email} setEmail={setEmail} setPassword={setPassword} />}
        </Stack.Screen>

        <Stack.Screen name="MainTabs">
          {(props) => <BottomTabs {...props} email={email} setEmail={setEmail} />}
        </Stack.Screen>

        <Stack.Screen name="NumberScreen" options={{ headerShown: true }}>
          {(props) => <NumberScreen {...props} email={email} />}
        </Stack.Screen>

        <Stack.Screen name="GamepictureScreen" options={{ headerShown: true }}>
          {(props) => <GamepictureScreen {...props} email={email} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
