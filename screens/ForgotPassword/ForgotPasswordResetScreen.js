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
  SafeAreaView,
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
    <SafeAreaView style={{ flex: 1 }}>
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
                  placeholderTextColor="#666"
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
                  placeholderTextColor="#666"
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

              <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>ยืนยันรหัสผ่านใหม่</Text>
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
    marginBottom: vh(2),
  },
  logo: {
    width: vw(30),
    height: vh(15),
  },
  forgotText: {
    fontSize: vh(3),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: vh(1),
  },
  forText: {
    fontSize: vh(1.8),
    color: "#000",
    textAlign: "center",
    marginBottom: vh(3),
  },
  label: {
    fontSize: vh(1.6),
    color: "#000",
    marginTop: vh(1),
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: vh(1.2),
    paddingHorizontal: vw(3),
    fontSize: vh(1.6),
    color: "#000",
    marginTop: vh(0.5),
    paddingRight: vw(10),
  },
  inputError: {
    borderColor: "red",
  },
  eyeButton: {
    position: "absolute",
    right: vw(2),
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  errorText: {
    color: "red",
    marginTop: vh(0.5),
    fontSize: vh(1.4),
  },
  button: {
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
