import React, { useState, useRef } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { post } from "../../api";

export default function ForgotPasswordVerifyScreen({ navigation, email }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setOtpError(""); // clear error เมื่อพิมพ์ใหม่

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    } else if (!text && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (!code || code.length < 6) {
      setOtpError("กรุณากรอก OTP ให้ครบ 6 หลัก");
      return;
    }

    setLoadingVerify(true);
    const data = await post({
      action: "verifyOtpPassword",
      email: email.trim(),
      otp: code.trim(),
    });
    setLoadingVerify(false);

    if (data.success) {
      navigation.replace("forgotpasswordreset");
    } else {
      setOtpError(data.message || "ยืนยัน OTP ไม่สำเร็จ");
    }
  };

  const handleResendOtp = async () => {
    setLoadingVerify(true);
    const data = await post({
      action: "requestReset",
      email: email.trim(),
    });
    setLoadingVerify(false);

    if (data.success) {
      Alert.alert("ส่ง OTP ใหม่แล้ว", "กรุณาตรวจอีเมลอีกครั้ง");
    } else {
      setOtpError(data.message || "ส่ง OTP ใหม่ไม่สำเร็จ");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background_otp.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.form}>
            <Text style={styles.securityText}>ตรวจสอบความปลอดภัย</Text>
            <Text style={styles.optText}>ยืนยันตัวตนด้วยรหัส OTP</Text>

            <View style={styles.form1}>
              <Text style={styles.codeText}>ป้อนรหัสยืนยัน OTP</Text>
              <Text style={styles.codeText}>ที่ส่งไปยังอีเมลของคุณ</Text>

              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(el) => (inputs.current[index] = el)}
                    style={[
                      styles.otpInput,
                      otpError ? styles.inputError : null,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                  />
                ))}
              </View>

              {otpError ? (
                <Text style={styles.errorText}>{otpError}</Text>
              ) : null}

              <View style={styles.linkotp}>
                <Text style={styles.codeText}>หากไม่ได้รับรหัส </Text>
                <TouchableOpacity onPress={handleResendOtp}>
                  <Text style={styles.resendText}>ส่งรหัสอีกครั้ง</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.buttonV}
              onPress={handleVerifyOtp}
              disabled={loadingVerify}
            >
              {loadingVerify ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonVText}>ยืนยันรหัส OTP</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
            <View style={styles.linklogin}>
              <Text style={{ color: "#555" }}>มีบัญชีอยู่แล้ว? </Text>
              <TouchableOpacity onPress={() => navigation.replace("login")}>
                <Text style={{ color: "#ff7f32", fontWeight: "bold" }}>
                  เข้าสู่ระบบ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
  },
  securityText: {
    color: "#000",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 5,
    marginTop: 150
  },
  optText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 30,
  },
  linkotp: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 30,
  },
  linklogin: {
    flexDirection: "row",
    justifyContent: "center",
  },
  resendText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  form1: {
    justifyContent: "center",
    alignItems: "center",
  },
  codeText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 5,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5,
    marginTop: 15,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    width: 50,
    height: 50,
    textAlign: "center",
    fontSize: 18,
    marginHorizontal: 5,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  buttonV: {
    backgroundColor: "#ff7f32",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonVText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
