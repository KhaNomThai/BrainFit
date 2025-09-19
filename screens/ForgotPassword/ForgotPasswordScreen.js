import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import { post, isEmail } from "../../api";

export default function ForgotPasswordRequestScreen({ navigation, email, setEmail }) {
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleRequestOtp = async () => {
    setEmailError("");

    if (!email) {
      setEmailError("กรุณากรอกอีเมล");
      return;
    }
    if (!isEmail(email)) {
      setEmailError("อีเมลไม่ถูกต้อง");
      return;
    }

    setLoading(true);
    try {
      const res = await post({
        action: "requestReset",
        email: email.trim(),
      });
      setLoading(false);

      if (res.success) {
        navigation.replace("forgotpasswordverify");
      } else {
        setEmailError("อีเมลไม่ถูกต้อง");
      }
    } catch (err) {
      setLoading(false);
      setEmailError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background_login.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.form}>
         <View style={styles.Viewlogo}>
            <Image 
              source={require("../../assets/profile.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        <Text style={styles.forgotText}>ลืมรหัสผ่าน</Text>
        <Text style={styles.forText}>เปลี่ยนรหัสผ่าน</Text>

        <Text style={styles.EmailText}>อีเมล</Text>
        <TextInput
          style={[styles.Input, emailError ? styles.inputError : null]}
          placeholder="กรอกอีเมลของคุณ"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError("");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.errorText}>{emailError}</Text>

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

const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;
const styles = StyleSheet.create({
  form: {
    flex: 1,
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
  forgotText: {
    color: "#000",
    fontSize: vh(5),
    fontWeight: "900",
    marginBottom: vh(0.8),
  },
  forText: {
    color: "#000",
    fontSize: vh(1.8),
    fontWeight: "400",
    marginBottom: vh(5),
    marginLeft: vw(1.2),
  },
  EmailText: {
    color: "#000",
    fontSize: vh(2),
    fontWeight: "bold",
    marginBottom: vh(0.8),
  },
  Input: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: vw(3),
    paddingVertical: vh(1.2),
    paddingHorizontal: vw(2),
    fontSize: vh(1.5),
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
  button: {
    backgroundColor: "#ff7f32",
    paddingVertical: vh(1.5),
    borderRadius: vw(2.5),
    alignItems: "center",
    marginTop: vh(1.2),
  },
  buttonText: {
    color: "#fff",
    fontSize: vh(1.5),
    fontWeight: "bold",
  },
  linklogin: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: vh(2),
  },
  linkText: {
    color: "#ff7f32",
    fontWeight: "bold",
    fontSize: vh(1.5),
  },
});
