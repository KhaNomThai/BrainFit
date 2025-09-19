import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions
} from "react-native";
import { post, isEmail } from "../../api";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen({
  navigation,
  email, setEmail,
  password, setPassword,
  fullName, setFullName,
  height, setHeight,
  weight, setWeight,
  age, setAge,
  gender, setGender,
}) {
  const [loading, setLoading] = useState(false);
  const [fullNameError, setFullNameError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    setFullNameError("");
    setHeightError("");
    setWeightError("");
    setAgeError("");
    setGenderError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    
    let hasError = false;

    if (!fullName) {
      setFullNameError("กรุณากรอกชื่อ-นามสกุล");
      hasError = true;
    } else if (!/^[^0-9]+$/.test(fullName)) {
      setFullNameError("ชื่อนามสกุลห้ามมีตัวเลข");
      hasError = true;
    } else 

    if (!height) {
      setHeightError("กรุณากรอกส่วนสูง");
      hasError = true;
    } else

    if (!weight) {
      setWeightError("กรุณากรอกน้ำหนัก");
      hasError = true;
    } else

    if (!age) {
      setAgeError("กรุณากรอกอายุ");
      hasError = true;
    } else

    if (!gender) {
      setGenderError("กรุณากรอกเพศ");
      hasError = true;
    } else if (gender !== "ชาย" && gender !== "หญิง") {
      setGenderError("เพศต้องเป็น 'ชาย' หรือ 'หญิง'");
      hasError = true;
    } else

    if (!email) {
      setEmailError("กรุณากรอกอีเมล");
      hasError = true;
    } else if (!isEmail(email)) {
      setEmailError("รูปแบบอีเมลไม่ถูกต้อง");
      hasError = true;
    } else

    if (!password) {
      setPasswordError("กรุณากรอกรหัสผ่าน");
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      hasError = true;
    } else if (!confirmPassword) {
      setConfirmPasswordError("กรุณากรอกยืนยันรหัสผ่าน");
      hasError = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("รหัสผ่านไม่ตรงกัน");
      hasError = true;
    }

    if (hasError) return;
    setLoading(true);
    const data = await post({
      action: "register",
      email: email.trim(),
      password,
      fullName,
      height,
      weight,
      age,
      gender,
    });
    setLoading(false);

    if (data.success) {
      navigation.replace("otp");
    } else {
      setEmailError(data.message || "สมัครไม่สำเร็จ");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background_login.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.Viewlogo}>
                <Image 
                  source={require("../../assets/profile.png")}
                  style={styles.logo}
                  resizeMode="contain"
                  />
      </View>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        
        <View>
          <Text style={styles.label}>ชื่อ-นามสกุล</Text>
          <TextInput
            style={[styles.input, fullNameError ? styles.inputError : null]}
            placeholder="กรอกข้อมูล..."
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              setFullNameError("");
            }}
          />
          <Text style={styles.errorText}>{fullNameError}</Text>
        </View>

        <View style={styles.rowLabel}>
          <Text style={styles.labelLeft}>ส่วนสูง</Text>
          <Text style={styles.labelRight}>น้ำหนัก</Text>
        </View>
        <View style={styles.rowInput}>
          <View>
            <TextInput
              style={[styles.inputLeft, heightError ? styles.inputError : null]}
              placeholder="กรอกข้อมูล..."
              keyboardType="numeric"
              value={height}
              onChangeText={(text) => {
                setHeight(text);
                setHeightError("");
              }}
            />
            <Text style={styles.errorText}>{heightError}</Text>
          </View>
          <View>
            <TextInput
              style={[styles.inputRight, weightError ? styles.inputError : null]}
              placeholder="กรอกข้อมูล..."
              keyboardType="numeric"
              value={weight}
              onChangeText={(text) => {
                setWeight(text);
                setWeightError("");
              }}
            />
            <View style={{ marginLeft: "24%" }}>
              <Text style={styles.errorText}>{weightError}</Text>
            </View>
          </View>
        </View>

        <View style={styles.rowLabel}>
          <Text style={styles.labelLeft}>อายุ</Text>
          <Text style={styles.labelRight}>เพศ</Text>
        </View>
        <View style={styles.rowInput}>
          <View>
            <TextInput
              style={[styles.inputLeft, ageError ? styles.inputError : null]}
              placeholder="กรอกข้อมูล..."
              keyboardType="numeric"
              value={age}
              onChangeText={(text) => {
                setAge(text);
                setAgeError("");
              }}
            />
            <Text style={styles.errorText}>{ageError}</Text>
          </View>
          <View>
            <TextInput
              style={[styles.inputRight, genderError ? styles.inputError : null]}
              placeholder="กรอกข้อมูล..."
              value={gender}
              onChangeText={(text) => {
                setGender(text);
                setGenderError("");
              }}
            />
            <View style={{ marginLeft: "24%" }}>
              <Text style={styles.errorText}>{genderError}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.label}>อีเมล</Text>
        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          placeholder="กรอกข้อมูล..."
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError("");
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{emailError}</Text>
        </View>

        <Text style={styles.label}>รหัสผ่าน</Text>
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
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError("");
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

        <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              confirmPasswordError ? styles.inputError : null,
            ]}
            placeholder="กรอกข้อมูลอีกครั้ง..."
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError("");
            }}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={18}
              color="#555"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>สมัครสมาชิก</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linklogin}>
          <Text style={{ color: "#555" }}>มีบัญชีอยู่แล้ว? </Text>
          <TouchableOpacity onPress={() => navigation.replace("login")}>
            <Text style={{ color: "#ff7f32", fontWeight: "bold" }}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;
const styles = StyleSheet.create({
  form: {
    flexGrow: 1,
    paddingBottom: vh(5),
    paddingHorizontal: vw(8),
  },
  label: {
    color: "#000",
    fontSize: vh(2),
    fontWeight: "bold",
  },
  Viewlogo: {
    marginTop: vh(12),
    alignItems: "center",
  },
  logo: {
    width: vw(55),
    height: vh(18),
    marginBottom: vh(2),
  },
  rowLabel: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  labelLeft: {
    width: vw(28),
    fontSize: vh(2),
    fontWeight: "bold",
  },
  labelRight: {
    width: vw(28),
    fontSize: vh(2),
    fontWeight: "bold",
    marginLeft: vw(10),
  },
  rowInput: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: vw(3),
    paddingVertical: vh(1.2),
    paddingHorizontal: vw(2),
    marginTop: vh(1),
    fontSize: vh(1.5),
  },
  inputLeft: {
    width: vw(28),
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: vw(3),
    paddingVertical: vh(1.2),
    paddingHorizontal: vw(2),
    marginTop: vh(1),
    fontSize: vh(1.5),
  },
  inputRight: {
    width: vw(28),
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: vw(3),
    paddingVertical: vh(1.2),
    paddingHorizontal: vw(2),
    marginTop: vh(1),
    marginLeft: vw(10),
    fontSize: vh(1.5),
  },
  button: {
    backgroundColor: "#ff7f32",
    paddingVertical: vh(1.5),
    borderRadius: vw(3),
    alignItems: "center",
    marginTop: vh(2.5),
  },
  buttonText: {
    color: "#fff",
    fontSize: vh(1.5),
    fontWeight: "bold",
  },
  linklogin: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: vh(1.5),
  },
  errorText: {
    color: "red",
    fontSize: vh(1.5),
    marginLeft: vw(1),
  },
  inputError: {
    borderColor: "red",
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
    top: "60%",
    transform: [{ translateY: -10 }],
  },
});