import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ ล็อกอิน
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("MainTabs");
    } catch (error) {
      Alert.alert("ล็อกอินไม่สำเร็จ", error.message);
    }
  };

  // ✅ ลืมรหัสผ่าน
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("กรุณากรอกอีเมลก่อน");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว 📧");
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔑 เข้าสู่ระบบ</Text>

      <TextInput
        style={styles.input}
        placeholder="อีเมล"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="รหัสผ่าน"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="เข้าสู่ระบบ" onPress={handleLogin} />

      <View style={{ marginTop: 10 }}>
        <Button title="ลืมรหัสผ่าน?" onPress={handleForgotPassword} />
      </View>

      <View style={{ marginTop: 10 }}>
        <Button
          title="ยังไม่มีบัญชี? สมัครสมาชิก"
          onPress={() => navigation.navigate("Register")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
