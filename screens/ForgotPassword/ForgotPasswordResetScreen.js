import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { post } from "../../api";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPasswordResetScreen({ navigation, email }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async () => {
    let hasError = false;

    if (!newPassword) {
      setNewPasswordError("กรุณากรอกรหัสผ่านใหม่");
      hasError = true;
    } else if (newPassword.length < 8) {
      setNewPasswordError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("กรุณายืนยันรหัสผ่าน");
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("รหัสผ่านไม่ตรงกัน");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const res = await post({
        action: "resetPassword",
        email: email.trim(),
        newPassword: newPassword.trim(),
      });
      setLoading(false);

      if (res.success) {
        navigation.replace("login");
      } else {
        setConfirmPasswordError(res.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้");
      }
    } catch (err) {
      setLoading(false);
      setConfirmPasswordError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background_login.png")}
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
            <Text style={styles.forgotText}>ตั้งรหัสผ่านใหม่</Text>
            <Text style={styles.forText}>ป้อนรหัสผ่านใหม่ของคุณ</Text>

            <Text style={styles.label}>รหัสผ่าน</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, newPasswordError ? styles.inputError : null]}
                placeholder="กรอกรหัสผ่านใหม่"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setNewPasswordError("");
                }}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off" : "eye"}
                  size={18}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
            {newPasswordError ? (
              <Text style={styles.errorText}>{newPasswordError}</Text>
            ) : null}

            <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  confirmPasswordError ? styles.inputError : null,
                ]}
                placeholder="กรอกยืนยันรหัสผ่าน"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError("");
                }}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={18}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>ยืนยัน</Text>
              )}
            </TouchableOpacity>

            <View style={styles.linklogin}>
              <Text style={{ color: "#555" }}>มีบัญชีอยู่แล้ว? </Text>
              <TouchableOpacity onPress={() => navigation.replace("login")}>
                <Text style={styles.linkText}>เข้าสู่ระบบ</Text>
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
    marginBottom: vh(4),
  },
  label: {
    color: "#000",
    fontSize: vh(2),
    fontWeight: "bold",
    marginBottom: vh(0.6),
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: vw(3),
    paddingVertical: vh(1.2),
    paddingHorizontal: vw(2),
    fontSize: vh(1.5),
    marginBottom: vh(1.2),
  },
  eyeButton: {
    position: "absolute",
    right: vw(3),
    top: vh(1.5),
  },
  inputError: {
    borderColor: "red",
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
  },
});
