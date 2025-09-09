import React, { useState, useRef } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { post } from "../../api";

export default function OTPScreen({ navigation, email, password, 
  fullName, height, weight, age, gender, address}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    } else if (!text && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (!code || code.length < 6) {
      return Alert.alert("กรุณากรอก OTP ให้ครบ 6 หลัก");
    }

    setLoadingVerify(true);
    const data = await post({
      action: "verifyOtp",
      email: email.trim(),
      otp: code.trim(),
      password,
      fullName,
      height,
      weight,
      age,
      gender,
      address
    });
    setLoadingVerify(false);

    if (data.success) {
      Alert.alert("สมัครข้อมูลสำเร็จ", "เข้าสู่ระบบได้เลย");
        navigation.replace("login");
    } else {
      Alert.alert("ยืนยัน OTP ไม่สำเร็จ", data.message || "ลองใหม่อีกครั้ง");
    }
  };

  const handleResendOtp = async () => {
    setLoadingVerify(true);
    const data = await post({
      action: "register",
      email: email.trim(),
      password,
      fullName,
      height,
      weight,
      age,
      gender,
      address
    });
    setLoadingVerify(false);

    if (data.success) {
      Alert.alert("ส่ง OTP ใหม่แล้ว", "กรุณาตรวจอีเมลอีกครั้ง");
    } else {
      Alert.alert("ส่ง OTP ใหม่ไม่สำเร็จ", data.message || "ลองใหม่อีกครั้ง");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background_otp.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
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
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
              />
            ))}
          </View>
          <View style={styles.linkotp}>
            <Text style={styles.codeText}>หากไม่ได้รับรหัส </Text>
            <TouchableOpacity onPress={handleResendOtp}>
              <Text style={styles.resendText}>ส่งรหัสอีกครั้ง</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.buttonV} onPress={handleVerifyOtp}>
          {loadingVerify ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonVText}>ยืนยันรหัส OTP</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 10 }} />
        <View style={styles.linklogin}>
          <Text style={{ color: "#555"}}> มีบัญชีอยู่แล้ว? </Text>
          <TouchableOpacity onPress={() => navigation.replace("login")}>
            <Text style={{ color: "#ff7f32", fontWeight: "bold", }}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 230,    
    padding: 30,
  },
  securityText: {
    color: "#000000ff",
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 5,
  },
  optText: {
    color: "#000000ff",
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 50,
    marginLeft: 5,
  },
  linkotp: {
    flexDirection: "row", 
    marginBottom: 50
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
    color: "#000000",
    fontSize: 16,
    fontWeight: "400",
    marginBottom: "5",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 10, 
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
  },
  linkContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  link: {
    color: "#ff7f32",
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonV: {
    backgroundColor: "#ff7f32",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonVText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
