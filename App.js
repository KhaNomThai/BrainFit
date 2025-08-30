import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

//import File Game
import FastMath from "./screens/Gamescreen/FastMath";
import SoundRecognize from "./screens/Gamescreen/SoundRecognize";
import MatchingWord from "./screens/Gamescreen/MatchingWord";
import StoryGame from "./screens/Gamescreen/StoryGame";
import RelationMatch from "./screens/Gamescreen/RelationMatch";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileSetupScreen from "./screens/ProfileSetupScreen";
import MainTabs from "./navigation/MainTabs";
import GameScreen from "./screens/GameScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInitialRoute("MainTabs");
        } else {
          setInitialRoute("ProfileSetup");
        }
      } else {
        setInitialRoute("Login");
      }
    });
    return unsubscribe;
  }, []);

  if (!initialRoute) return null; // หรือแสดง Spinner

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name="FastMath" component={FastMath} />
        <Stack.Screen name="SoundRecognize" component={SoundRecognize} />
        <Stack.Screen name="StoryGame" component={StoryGame} />
        <Stack.Screen name="MatchingWord" component={MatchingWord} />
        <Stack.Screen name="RelationMatch" component={RelationMatch} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
