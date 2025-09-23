import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { post, isEmail } from "../../api";

export default function RegisterScreen({
  navigation,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  height,
  setHeight,
  weight,
  setWeight,
  age,
  setAge,
  gender,
  setGender,
  address,
  setAddress,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!fullName || !isEmail(email) || !password) {
      setError("กรอกข้อมูลให้ครบและถูกต้อง");
      return;
    }
    setLoading(true);
    try {
      const res = await post({
        action: "register",
        fullName,
        email,
        password,
        height,
        weight,
        age,
        gender,
        address,
      });
      if (res.success) {
        navigation.replace("otp");
      } else {
        setError(res.message || "สมัครไม่สำเร็จ");
      }
    } catch (err) {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/background_login.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.form}>
            <Text style={styles.title}>สร้างบัญชีใหม่</Text>

            <Text style={styles.label}>ชื่อ - นามสกุล</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกชื่อ-นามสกุล"
              placeholderTextColor="#666"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>อีเมล</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกอีเมล"
              placeholderTextColor="#666"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>รหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกรหัสผ่าน"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.label}>อายุ</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกอายุ"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />

            <Text style={styles.label}>เพศ</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกเพศ"
              placeholderTextColor="#666"
              value={gender}
              onChangeText={setGender}
            />

            <Text style={styles.label}>ส่วนสูง (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกส่วนสูง"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />

            <Text style={styles.label}>น้ำหนัก (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกน้ำหนัก"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />

            <Text style={styles.label}>ที่อยู่</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกที่อยู่"
              placeholderTextColor="#666"
              value={address}
              onChangeText={setAddress}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerText}>สมัครสมาชิก</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.replace("login")}
            >
              <Text style={styles.linkText}>มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: vw(5),
  },
  form: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    padding: vw(5),
  },
  title: {
    fontSize: vh(3),
    fontWeight: "bold",
    color: "#000",
    marginBottom: vh(2),
    textAlign: "center",
  },
  label: {
    fontSize: vh(1.8),
    fontWeight: "bold",
    color: "#000",
    marginTop: vh(1.5),
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: vh(1.2),
    paddingHorizontal: vw(3),
    fontSize: vh(1.5),
    color: "#000",
    marginTop: vh(0.5),
  },
  errorText: {
    color: "red",
    marginTop: vh(1),
    fontSize: vh(1.5),
  },
  registerBtn: {
    backgroundColor: "#ff7f32",
    paddingVertical: vh(1.5),
    borderRadius: 8,
    marginTop: vh(2),
    alignItems: "center",
  },
  registerText: {
    color: "#fff",
    fontSize: vh(1.8),
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: vh(2),
    alignItems: "center",
  },
  linkText: {
    color: "#ff7f32",
    fontSize: vh(1.6),
    fontWeight: "600",
  },
});
