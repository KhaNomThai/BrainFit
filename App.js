import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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

const Stack = createNativeStackNavigator();

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="login"
      >
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
        <Stack.Screen name="forgotpasswordReset">
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
          {(props) => (
            <FastMath
              {...props}
              email={email}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SoundRecognize" options={{ headerShown: true }}>
          {(props) => (
            <SoundRecognize
              {...props}
              email={email}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="StoryGame" options={{ headerShown: true }}>
          {(props) => (
            <StoryGame
              {...props}
              email={email}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="MatchingWord" options={{ headerShown: true }}>
          {(props) => (
            <MatchingWord
              {...props}
              email={email}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="RelationMatch" options={{ headerShown: true }}>
          {(props) => (
            <RelationMatch
              {...props}
              email={email}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="MemoryGame" options={{ headerShown: true }}>
          {(props) => (
            <MemoryGame
              {...props}
              email={email}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="MainTabs">
          {(props) => (
            <BottomTabs
              {...props}
              email={email}
              setEmail={setEmail}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="NumberScreen" options={{ headerShown: true }}>
          {(props) => (
            <NumberScreen
              {...props}
              // email={email}
              // setEmail={setEmail}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="GamepictureScreen" options={{ headerShown: true }}>
          {(props) => (
            <GamepictureScreen
              {...props}
              // email={email}
              // setEmail={setEmail}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// import React, { useState } from "react";
// import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
// import LoginScreen from "./screens/LoginScreen";
// import RegisterScreen from "./screens/RegisterScreen";
// import OTPScreen from "./screens/OTPScreen";
// import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
// import ForgotPasswordResetScreen from "./screens/ForgotPasswordResetScreen";
// import ForgotPasswordVerifyScreen from "./screens/ForgotPasswordVerifyScreen";

// import HomeScreen from "./screens/HomeScreen";

// export default function App() {
//   const [screen, setScreen] = useState("login");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [fullName, setFullName] = useState("");
//   const [height, setHeight] = useState("");
//   const [weight, setWeight] = useState("");
//   const [age, setAge] = useState("");
//   const [gender, setGender] = useState("");
//   const [address, setAddress] = useState("");

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.select({ ios: "padding", android: undefined })}
//       style={styles.container}
//     >
//       {screen === "login" && (
//         <LoginScreen
//           setScreen={setScreen}
//           email={email}
//           setEmail={setEmail}
//           password={password}
//           setPassword={setPassword}
//         />
//       )}
//       {screen === "register" && (
//         <RegisterScreen
//           setScreen={setScreen}
//           email={email}
//           setEmail={setEmail}
//           password={password}
//           setPassword={setPassword}
//           fullName={fullName}
//           setFullName={setFullName}
//           height={height}
//           setHeight={setHeight}
//           weight={weight}
//           setWeight={setWeight}
//           age={age}
//           setAge={setAge}
//           gender={gender}
//           setGender={setGender}
//           address={address}
//           setAddress={setAddress}
//         />
//       )}
//       {screen === "otp" && (
//         <OTPScreen
//           setScreen={setScreen}
//           email={email}
//           password={password}
//           fullName={fullName}
//           height={height}
//           weight={weight}
//           age={age}
//           gender={gender}
//           address={address}
//         />
//       )}
//       {screen === "home" && (
//         <HomeScreen
//           setScreen={setScreen}
//           email={email}
//           setEmail={setEmail}
//           setPassword={setPassword}
//         />
//       )}
//       {screen === "forgotpassword" && (
//         <ForgotPasswordScreen
//           setScreen={setScreen}
//           email={email}
//           setEmail={setEmail}
//           setPassword={setPassword}
//         />
//       )}
//       {screen === "forgotpasswordreset" && (
//         <ForgotPasswordResetScreen
//           setScreen={setScreen}
//           email={email}
//           setEmail={setEmail}
//           setPassword={setPassword}
//         />
//       )}
//       {screen === "forgotpasswordverify" && (
//         <ForgotPasswordVerifyScreen
//           setScreen={setScreen}
//           email={email}
//           setEmail={setEmail}
//           setPassword={setPassword}
//         />
//       )}
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
// });