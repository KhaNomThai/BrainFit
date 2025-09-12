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
} from "react-native";
import { post, isEmail } from "../../api";

export default function RegisterScreen({
  navigation,
  email, setEmail,
  password, setPassword,
  fullName, setFullName,
  height, setHeight,
  weight, setWeight,
  age, setAge,
  gender, setGender,
  address, setAddress
}) {
  const [loading, setLoading] = useState(false);
  const [fullNameError, setFullNameError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleRegister = async () => {
    setFullNameError("");
    setHeightError("");
    setWeightError("");
    setAgeError("");
    setGenderError("");
    setAddressError("");
    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!fullName) {
      setFullNameError("กรุณากรอกชื่อ-นามสกุล");
      hasError = true;
    } else if (!/^[^0-9]+$/.test(fullName)) {
      setFullNameError("ชื่อนามสกุลห้ามมีตัวเลข");
      hasError = true;
    }

    if (!height) {
      setHeightError("กรุณากรอกส่วนสูง");
      hasError = true;
    }

    if (!weight) {
      setWeightError("กรุณากรอกน้ำหนัก");
      hasError = true;
    }

    if (!age) {
      setAgeError("กรุณากรอกอายุ");
      hasError = true;
    }

    if (!gender) {
      setGenderError("กรุณากรอกเพศ");
      hasError = true;
    } else if (gender !== "ชาย" && gender !== "หญิง") {
      setGenderError("เพศต้องเป็น 'ชาย' หรือ 'หญิง'");
      hasError = true;
    }

    if (!address) {
      setAddressError("กรุณากรอกที่อยู่");
      hasError = true;
    }

    if (!email) {
      setEmailError("กรุณากรอกอีเมล");
      hasError = true;
    } else if (!isEmail(email)) {
      setEmailError("รูปแบบอีเมลไม่ถูกต้อง");
      hasError = true;
    }

    if (!password) {
      setPasswordError("กรุณากรอกรหัสผ่าน");
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
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
      address
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
          <View style={{ marginLeft: 30 }}>
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
            <View style={{ marginLeft: "15%" }}>
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
          <View style={{ marginLeft: 30 }}>
            <TextInput
              style={[styles.inputRight, genderError ? styles.inputError : null]}
              placeholder="กรอกข้อมูล..."
              value={gender}
              onChangeText={(text) => {
                setGender(text);
                setGenderError("");
              }}
            />
            <View style={{ marginLeft: "15%" }}>
              <Text style={styles.errorText}>{genderError}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.label}>ที่อยู่ปัจจุบัน</Text>
        <TextInput
          style={[styles.input, addressError ? styles.inputError : null]}
          placeholder="กรอกข้อมูล..."
          value={address}
          onChangeText={(text) => {
            setAddress(text);
            setAddressError("");
          }}
        />
        <Text style={styles.errorText}>{addressError}</Text>


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
        <TextInput
          style={[styles.input, passwordError ? styles.inputError : null]}
          placeholder="กรอกข้อมูล..."
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError("");
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{passwordError}</Text>
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

const styles = StyleSheet.create({
  form: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingBottom: 40,
    padding: 30,
  },
  label: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  rowLabel: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  labelLeft: {
    width: 120,
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  labelRight: {
    width: 120,
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginLeft: '15%',
  },
  rowInput: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
  },
  inputLeft: {
    width: 120,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  inputRight: {
    width: 120,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    marginLeft: '15%',
  },
  button: {
    backgroundColor: "#ff7f32",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linklogin: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  errorContainer: {
    minHeight: 20,
    marginTop: 2,
  },
  errorText: {
    color: "red",
    fontSize: 14,
  },
  inputError: {
    borderColor: "red",
  },
});
