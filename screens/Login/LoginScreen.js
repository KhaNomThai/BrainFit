import React, { useState } from "react";
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
import { post, isEmail } from "../../api";

export default function LoginScreen({ navigation, email, setEmail, password, setPassword }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!isEmail(email)) return Alert.alert("รูปแบบอีเมลไม่ถูกต้อง");
    if (!password) return Alert.alert("กรอกรหัสผ่านก่อน");

    setLoading(true);
    const data = await 
    post({ 
      action: "login", 
      email: email.trim(), 
      password 
    });
    setLoading(false);

    if (data.success) {
      // setScreen("home");
      navigation.replace("MainTabs");

    } else {
      Alert.alert("เข้าสู่ระบบไม่ได้", data.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleForgotPassword = () => {
    // setScreen("forgotpassword");
    navigation.replace("forgotpassword");

    // Alert.alert("ลืมรหัสผ่าน", "ฟีเจอร์ยังไม่พร้อมใช้งาน");
  };

  return (
    <ImageBackground
      source={require("../../assets/background_login.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.form}>
        <Text style={styles.loginAText}>เข้าสู่ระบบบัญชี</Text>
        <Text style={styles.WelconeText}>ยินดีต้อนรับเข้าสู่เเอปพลิเคชั่น....</Text>
        <Text style={styles.EmailText}>อีเมล</Text>
        <TextInput
          style={styles.inputEmail}
          placeholder="กรอกข้อมูล..."
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.PasswordText}>รหัสผ่าน</Text>
        <TextInput
          style={styles.inputPassword}
          placeholder="กรอกข้อมูล..."
          keyboardType="default"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
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
            <Text style={{ color: "#555"}}> ยังไม่มีบัญชี? </Text>
            <TouchableOpacity onPress={() => navigation.replace("register")}>
                <Text style={{ color: "#ff7f32", fontWeight: "bold", }}>สร้างบัญชี</Text>
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
  inputEmail: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  inputPassword: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 5,
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
    color: "#000000ff", 
    fontSize: 36, 
    fontWeight: "900",
    marginBottom: 5,
  },
  WelconeText: { 
    color: "#000000ff", 
    fontSize: 16, 
    fontWeight: "400",
    marginBottom: 30,
    marginLeft: 5
  },
  EmailText: { 
    color: "#000000ff", 
    fontSize: 20, 
    fontWeight: "bold",
    marginBottom: 5,
  },
  PasswordText: { 
    color: "#000000ff", 
    fontSize: 20, 
    fontWeight: "bold",
    // marginTop: 10,
    marginBottom: 5,
  },
  loginText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});
