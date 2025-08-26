import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    // ตรวจสอบรหัสสองครั้ง
    if (password !== confirmPassword) {
      Alert.alert("รหัสไม่ตรงกัน", "กรุณากรอกรหัสให้เหมือนกันทั้งสองช่อง");
      return;
    }

    if (password.length < 6) {
      Alert.alert("รหัสสั้นเกินไป", "รหัสต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // หลังสมัคร → ไปกรอกข้อมูล ProfileSetup
      navigation.replace("ProfileSetup");
    } catch (error) {
      Alert.alert("สมัครไม่สำเร็จ", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 สมัครสมาชิก</Text>

      <TextInput
        style={styles.input}
        placeholder="อีเมล"
        keyboardType="email-address"
        autoCapitalize="none"
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

      <TextInput
        style={styles.input}
        placeholder="ยืนยันรหัสผ่าน"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button title="สมัครสมาชิก" onPress={handleRegister} />
      <View style={{ marginTop: 10 }}>
        <Button title="กลับไปหน้าเข้าสู่ระบบ" onPress={() => navigation.navigate("Login")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
