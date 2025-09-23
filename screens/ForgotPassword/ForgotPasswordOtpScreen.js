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
  Dimensions,
  SafeAreaView,
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
    <SafeAreaView style={{ flex: 1 }}>
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
                      placeholder="-"
                      placeholderTextColor="#666"
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
                  <Text style={styles.buttonText}>ยืนยัน OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    padding: vw(8),
  },
  Viewlogo: {
    alignItems: "center",
    marginTop: vh(5),
    marginBottom: vh(2),
  },
  logo: {
    width: vw(25),
    height: vh(12),
  },
  securityText: {
    fontSize: vh(2.5),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: vh(1),
  },
  optText: {
    fontSize: vh(1.8),
    color: "#000",
    textAlign: "center",
    marginBottom: vh(3),
  },
  form1: {
    alignItems: "center",
  },
  codeText: {
    fontSize: vh(1.6),
    color: "#000",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: vh(2),
    marginBottom: vh(2),
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 8,
    width: vw(10),
    height: vh(6),
    textAlign: "center",
    fontSize: vh(2.2),
    color: "#000",
  },
  inputError: {
    borderColor: "red",
  },
  errorContainer: {
    marginVertical: vh(1),
  },
  errorText: {
    color: "red",
    fontSize: vh(1.5),
    textAlign: "center",
  },
  linkotp: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: vh(1),
  },
  codeTexts: {
    fontSize: vh(1.5),
    color: "#000",
  },
  resendText: {
    color: "#ff7f32",
    fontSize: vh(1.5),
    fontWeight: "bold",
  },
  buttonV: {
    backgroundColor: "#ff7f32",
    paddingVertical: vh(1.5),
    borderRadius: 8,
    marginTop: vh(3),
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: vh(1.8),
    fontWeight: "bold",
  },
});
