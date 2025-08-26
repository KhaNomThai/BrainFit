import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileSetupScreen from "./screens/ProfileSetupScreen";
import MainTabs from "./navigation/MainTabs";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = React.useState(null); // ใช้ null เพื่อรอโหลด

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ตรวจสอบว่า user มีข้อมูลใน Firestore หรือยัง
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInitialRoute("MainTabs"); // มีข้อมูลแล้ว → ไป MainTabs
        } else {
          setInitialRoute("ProfileSetup"); // ไม่มีข้อมูล → ไป ProfileSetup
        }
      } else {
        setInitialRoute("Login"); // ยังไม่ได้ login → Login
      }
    });
    return unsubscribe;
  }, []);

  if (!initialRoute) {
    return null; // หรือ Spinner/Loading screen
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Text>Test Commit 1</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
