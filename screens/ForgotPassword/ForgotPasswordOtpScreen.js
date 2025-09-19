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
  Image,
  Dimensions
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
    setOtpError("");

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
              <View style={styles.Viewlogo}>
                <Image 
                  source={require("../../assets/security.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
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
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{otpError}</Text>
                </View>
              ) : null}

              <View style={styles.linkotp}>
                <Text style={styles.codeTexts}>หากไม่ได้รับรหัส </Text>
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

const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;
const styles = StyleSheet.create({
  form: {
    flex: 1,
    paddingBottom: vh(25),
    paddingHorizontal: vw(8),
  },
  Viewlogo: {
    alignItems: "center",
  },
  logo: {
    marginTop: vh(10),
    width: vw(55),
    height: vh(18),
    marginBottom: vh(2),
  },
  securityText: {
    color: "#000000ff",
    fontSize: vh(5),
    fontWeight: "900",
    marginBottom: vh(0.8),
  },
  optText: {
    color: "#000000ff",
    fontSize: vh(1.8),
    fontWeight: "400",
    marginBottom: vh(6),
    marginLeft: vw(1.5),
  },
  linkotp: {
    flexDirection: "row",
    marginBottom: vh(6),
  },
  linklogin: {
    flexDirection: "row",
    justifyContent: "center",
  },
  resendText: {
    color: "red",
    fontSize: vh(1.8),
    fontWeight: "bold",
  },
  form1: {
    justifyContent: "center",
    alignItems: "center",
  },
  codeText: {
    color: "#000000",
    fontSize: vh(2),
    fontWeight: "400",
    marginBottom: vh(0.5),
  },
  codeTexts: {
    color: "#000000",
    fontSize: vh(1.8),
    fontWeight: "400",
    marginBottom: vh(0.5),
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: vh(1.5),
    marginTop: vh(1.5),
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: vw(2.5),
    width: vw(12),
    height: vh(6),
    textAlign: "center",
    fontSize: vh(2.2),
    marginHorizontal: vw(1.5),
  },
  linkContainer: {
    alignItems: "flex-end",
    marginBottom: vh(2),
  },
  link: {
    color: "#ff7f32",
    fontSize: vh(1.8),
    fontWeight: "bold",
  },
  buttonV: {
    backgroundColor: "#ff7f32",
    paddingVertical: vh(1.5),
    borderRadius: vw(2.5),
    alignItems: "center",
    marginTop: vh(1.2),
  },
  buttonVText: {
    color: "#fff",
    fontSize: vh(1.5),
    fontWeight: "bold",
  },
  inputError: {
    borderColor: "red",
  },
  errorContainer: {
    minHeight: vh(2),
    justifyContent: "center",
    marginBottom: vh(1),
  },
  errorText: {
    color: "red",
    fontSize: vh(1.5),
    marginLeft: vw(1),
  },
});