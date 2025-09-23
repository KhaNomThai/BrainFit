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
  Alert,
  ActivityIndicator,
} from "react-native";
import { post } from "../../api";

export default function OTPScreen({ navigation, email }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError("กรุณากรอก OTP ให้ครบ 6 หลัก");
      return;
    }
    setLoading(true);
    try {
      const res = await post({ action: "verifyOtp", email, otp });
      if (res.success) {
        navigation.replace("MainTabs");
      } else {
        setError(res.message || "OTP ไม่ถูกต้อง");
      }
    } catch (err) {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await post({ action: "resendOtp", email });
      if (res.success) {
        Alert.alert("ส่ง OTP ใหม่แล้ว", "กรุณาตรวจสอบอีเมล");
      } else {
        setError(res.message || "ไม่สามารถส่ง OTP ใหม่ได้");
      }
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/background_otp.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.form}>
          <Text style={styles.title}>ยืนยัน OTP</Text>
          <Text style={styles.label}>กรอกรหัส OTP ที่ส่งไปยังอีเมล</Text>

          <TextInput
            style={styles.input}
            placeholder="กรอกรหัส OTP"
            placeholderTextColor="#666"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(t) => {
              setOtp(t);
              setError("");
            }}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyText}>ยืนยัน</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendBtn} onPress={handleResend}>
            <Text style={styles.resendText}>ส่งรหัสอีกครั้ง</Text>
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
    fontSize: vh(2),
    textAlign: "center",
    letterSpacing: 5,
    color: "#000",
  },
  errorText: {
    color: "red",
    marginTop: vh(1),
    fontSize: vh(1.5),
    textAlign: "center",
  },
  verifyBtn: {
    backgroundColor: "#ff7f32",
    paddingVertical: vh(1.5),
    borderRadius: 8,
    marginTop: vh(2),
    alignItems: "center",
  },
  verifyText: {
    color: "#fff",
    fontSize: vh(1.8),
    fontWeight: "bold",
  },
  resendBtn: {
    marginTop: vh(2),
    alignItems: "center",
  },
  resendText: {
    color: "#ff7f32",
    fontSize: vh(1.6),
    fontWeight: "600",
  },
});
