import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { post, isEmail } from "../../api";

export default function ForgotPasswordRequestScreen({ navigation, email, setEmail }) {
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    if (!isEmail(email)) return Alert.alert("อีเมลไม่ถูกต้อง");

    setLoading(true);
    try {
      const res = await post({
        action: "requestReset",
        email: email.trim(),
      });
      setLoading(false);

      if (res.success) {
        Alert.alert("ส่ง OTP สำเร็จ", "กรุณาตรวจสอบอีเมลของคุณ");
        navigation.replace("forgotpasswordverify");
      } else {
        Alert.alert("ผิดพลาด", res.message || "ไม่สามารถส่ง OTP ได้");
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("ผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background_login.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.form}>
        <Text style={styles.forgotText}>ลืมรหัสผ่าน</Text>
        <Text style={styles.forText}>เปลี่ยนรหัสผ่าน</Text>

        <Text style={styles.EmailText}>อีเมล</Text>
        <TextInput
          style={styles.Input}
          placeholder="กรอกอีเมลของคุณ"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ส่ง OTP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linklogin}>
          <Text style={{ color: "#555" }}>มีบัญชีอยู่แล้ว? </Text>
          <TouchableOpacity onPress={() => navigation.replace("login")}>
            <Text style={styles.linkText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
  },
  forgotText: {
    color: "#000",
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 5,
  },
  forText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 50,
    marginLeft: 5,
  },
  EmailText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  Input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
  },
  button: {
    backgroundColor: "#ff7f32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 50,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  linklogin: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  linkText: {
    color: "#ff7f32",
    fontWeight: "bold",
  },
});
