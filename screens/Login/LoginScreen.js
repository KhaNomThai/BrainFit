import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView
} from "react-native";
import { post, isEmail } from "../../api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation, email, setEmail, password, setPassword }) {
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    try {
      const data = await post({
        action: "login",
        email: email.trim(),
        password,
      });
      if (data?.success) {
        await AsyncStorage.setItem("userToken", data.token ? String(data.token) : "1");
        await AsyncStorage.setItem("userEmail", data.email ? String(data.email) : email);
        navigation.replace("MainTabs");
      } else {
        setEmailError(data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error) {
      console.error(error);
      setEmailError("เกิดข้อผิดพลาด เเจ้งผู้พัฒนาเเอปพลิเคชัน");
    } finally {
      setLoading(false);
    }

  };

  const handleForgotPassword = () => {
    navigation.replace("forgotpassword");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
        <Text style={styles.loginAText}>เข้าสู่ระบบบัญชี</Text>
        <Text style={styles.WelconeText}>ยินดีต้อนรับเข้าสู่เเอปพลิเคชัน....</Text>

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
         <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                passwordError ? styles.inputError : null,
              ]}
              placeholder="กรอกข้อมูล..."
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (passwordError) setPasswordError("");
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color="#555"
              />
            </TouchableOpacity>
          </View>
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
          <Text style={{     fontSize: vh(1.5), color: "#555" }}> ยังไม่มีบัญชี? </Text>
          <TouchableOpacity onPress={() => navigation.replace("register")}>
            <Text style={{ color: "#ff7f32", fontWeight: "bold",    fontSize: vh(1.5) }}>สร้างบัญชี</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: vw(8),
    paddingVertical: vh(3),
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
  linklogin: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: vh(1.5),
  },
  input: {
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
  forgotContainer: {
    alignItems: "flex-end",
    marginBottom: vh(3),
  },
  forgot: {
    color: "#ff7f32",
    fontSize: vh(1.5),
    fontWeight: "bold",
    marginTop: vh(-2)
  },
  loginBtn: {
    backgroundColor: "#ff7f32",
    paddingVertical: vh(1.5),
    borderRadius: vw(3),
    alignItems: "center",
  },
  loginAText: {
    color: "#000",
    fontSize: vh(5),
    fontWeight: "900",
    marginBottom: vh(0.5),
  },
  WelconeText: {
    color: "#000",
    fontSize: vh(1.8),
    fontWeight: "400",
    marginBottom: vh(3),
    marginLeft: vw(1),
  },
  EmailText: {
    color: "#000",
    fontSize: vh(2),
    fontWeight: "bold",
    marginBottom: vh(0.8),
  },
  PasswordText: {
    color: "#000",
    fontSize: vh(2),
    fontWeight: "bold",
    marginBottom: vh(0.8),
  },
  loginText: {
    color: "#fff",
    fontSize: vh(1.5),
    fontWeight: "bold",
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: vw(10),
  },
  eyeBtn: {
    position: "absolute",
    right: vw(2),
    top: "50%",
    transform: [{ translateY: -10 }],
  },
});