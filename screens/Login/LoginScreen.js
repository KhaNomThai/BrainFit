import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { post, isEmail } from "../../api";

export default function LoginScreen({ navigation, email, setEmail, password, setPassword }) {
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async () => {
    let hasError = false;

    if (!isEmail(email)) {
      setEmailError("กรุณากรอกอีเมลให้ถูกต้อง");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("กรุณากรอกรหัสผ่าน");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    setLoading(true);
    const data = await post({
      action: "login",
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (data.success) {
      navigation.replace("MainTabs");
    } else {
      setEmailError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setPasswordError("");
    }
  };

  const handleForgotPassword = () => {
    navigation.replace("forgotpassword");
  };

  return (
    <ImageBackground
      source={require("../../assets/background_login.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.form}>
        <Text style={styles.loginAText}>เข้าสู่ระบบบัญชี</Text>
        <Text style={styles.WelconeText}>ยินดีต้อนรับเข้าสู่เเอปพลิเคชัน....</Text>

        {/* Email */}
        <Text style={styles.EmailText}>อีเมล</Text>
        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          placeholder="กรอกข้อมูล..."
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (emailError) setEmailError("");
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{emailError}</Text>
        </View>

        <Text style={styles.PasswordText}>รหัสผ่าน</Text>
        <TextInput
          style={[styles.input, passwordError ? styles.inputError : null]}
          placeholder="กรอกข้อมูล..."
          keyboardType="default"
          secureTextEntry
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (passwordError) setPasswordError("");
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{passwordError}</Text>
        </View>

        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotContainer}>
          <Text style={styles.forgot}>ลืมรหัสผ่าน?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>เข้าสู่ระบบ</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linklogin}>
          <Text style={{ color: "#555" }}> ยังไม่มีบัญชี? </Text>
          <TouchableOpacity onPress={() => navigation.replace("register")}>
            <Text style={{ color: "#ff7f32", fontWeight: "bold" }}>สร้างบัญชี</Text>
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
  linklogin: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
  },
  inputError: {
    borderColor: "red",
  },
  errorContainer: {
    minHeight: 18,
    marginBottom: 10,
    justifyContent: "center",
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginLeft: 5,
  },
  forgotContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgot: {
    color: "#ff7f32",
    fontSize: 14,
    fontWeight: "bold",
  },
  loginBtn: {
    backgroundColor: "#ff7f32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  loginAText: {
    color: "#000",
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 5,
  },
  WelconeText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 30,
    marginLeft: 5,
  },
  EmailText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  PasswordText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
