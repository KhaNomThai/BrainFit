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
} from "react-native";
import { post } from "../../api";

export default function ForgotPasswordResetScreen({ navigation, email }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    let hasError = false;

    if (!newPassword) {
      setNewPasswordError("กรุณากรอกรหัสผ่านใหม่");
      hasError = true;
    } else
    if (newPassword && newPassword.length < 8) {
      setNewPasswordError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      hasError = true;
    } else
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
            <Text style={styles.forgotText}>ตั้งรหัสผ่านใหม่</Text>
            <Text style={styles.forText}>ป้อนรหัสผ่านใหม่ของคุณ</Text>

            <Text style={styles.label}>รหัสผ่าน</Text>
            <TextInput
              style={[styles.input, newPasswordError ? styles.inputError : null]}
              placeholder="กรอกรหัสผ่านใหม่"
              secureTextEntry
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setNewPasswordError("");
              }}
            />
            {newPasswordError ? (
              <Text style={styles.errorText}>{newPasswordError}</Text>
            ) : null}

            <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
            <TextInput
              style={[
                styles.input,
                confirmPasswordError ? styles.inputError : null,
              ]}
              placeholder="กรอกยืนยันรหัสผ่าน"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError("");
              }}
            />
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

const styles = StyleSheet.create({
  form: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
  },
  forgotText: {
    color: "#000",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 5,
    marginTop: 50,
  },
  forText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 30,
  },
  label: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#ff7f32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linklogin: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  linkText: {
    color: "#ff7f32",
    fontWeight: "bold",
  },
});
