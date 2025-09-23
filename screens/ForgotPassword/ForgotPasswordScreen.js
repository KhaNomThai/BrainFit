import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { post, isEmail } from "../../api";

export default function ForgotPasswordScreen({ navigation, email, setEmail }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    if (!isEmail(email)) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }
    setLoading(true);
    try {
      const res = await post({ action: "requestReset", email });
      if (res.success) {
        navigation.replace("forgotpasswordverify");
      } else {
        setError(res.message || "ไม่สามารถขอ OTP ได้");
      }
    } catch (err) {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/background_login.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.form}>
          <Text style={styles.title}>ลืมรหัสผ่าน</Text>
          <Text style={styles.label}>กรอกอีเมลที่ใช้สมัคร</Text>

          <TextInput
            style={styles.input}
            placeholder="กรอกอีเมล..."
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError("");
            }}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.sendBtn} onPress={handleRequestOtp}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendText}>ขอรหัส OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.replace("login")}
          >
            <Text style={styles.backText}>กลับไปหน้าเข้าสู่ระบบ</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;

const styles = StyleSheet.create({
  form: {
    flex: 1,
    justifyContent: "center",
    padding: vw(10),
  },
  title: {
    fontSize: vh(3),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: vh(2),
  },
  label: {
    fontSize: vh(1.8),
    color: "#000",
    marginBottom: vh(1),
    textAlign: "center",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: vh(1.2),
    paddingHorizontal: vw(3),
    fontSize: vh(1.8),
    color: "#000",
    marginBottom: vh(1),
  },
  errorText: {
    color: "red",
    fontSize: vh(1.5),
    marginBottom: vh(1),
    textAlign: "center",
  },
  sendBtn: {
    backgroundColor: "#ff7f32",
    paddingVertical: vh(1.5),
    borderRadius: 8,
    marginTop: vh(2),
    alignItems: "center",
  },
  sendText: {
    color: "#fff",
    fontSize: vh(1.8),
    fontWeight: "bold",
  },
  backBtn: {
    marginTop: vh(2),
    alignItems: "center",
  },
  backText: {
    color: "#ff7f32",
    fontSize: vh(1.6),
    fontWeight: "600",
  },
});
