import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ ฟังก์ชันล็อกอิน
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("MainTabs");
    } catch (error) {
      Alert.alert("ล็อกอินไม่สำเร็จ", error.message);
    }
  };

  // ✅ ฟังก์ชันลืมรหัสผ่าน
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
      {/* ส่วนหัว */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 40, color: "#fff" }}>👤</Text>
        </View>
        <Text style={styles.title}>เข้าสู่ระบบ</Text>
      </View>

      {/* ฟอร์ม */}
      <View style={styles.form}>
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

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgot}>ลืมรหัสผ่าน?</Text>
        </TouchableOpacity>

        {/* ปุ่ม Login */}
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>

        {/* สมัครสมาชิก */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 20 }}
        >
          <Text style={styles.registerText}>
            ยังไม่มีบัญชี?{" "}
            <Text style={{ fontWeight: "bold", color: "#ff7f32" }}>สร้างบัญชี</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#ff7f32",
    paddingVertical: 50,
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#000" },
  subtitle: { fontSize: 14, color: "#444", marginTop: 5 },
  form: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  forgot: { color: "#ff7f32", textAlign: "right", marginBottom: 20 },
  loginBtn: {
    backgroundColor: "#ff7f32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  registerText: { textAlign: "center", color: "#444" },
});
