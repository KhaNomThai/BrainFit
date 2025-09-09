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

  const handleRegister = async () => {
    if (!fullName || !height || !weight || !age || !gender || !address || !email || !password) {
      return Alert.alert("กรอกข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
    }

    if (!isEmail(email)) {
      return Alert.alert("รูปแบบอีเมลไม่ถูกต้อง");
    }

    const nameRegex = /^[^0-9]+$/;
    if (!nameRegex.test(fullName)) {
      return Alert.alert("ชื่อนามสกุลไม่ถูกต้อง", "ชื่อนามสกุลห้ามมีตัวเลข");
    }

    if (gender !== "ชาย" && gender !== "หญิง") {
    return Alert.alert(
      "เพศไม่ถูกต้อง", "กรุณาเลือกเพศเป็น 'ชาย' หรือ 'หญิง' เท่านั้น"
    );
  }

    if (password.length < 8) {
      return Alert.alert(
        "รหัสผ่านสั้นเกินไป", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
      );
    }

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
      Alert.alert("ส่ง OTP แล้ว", "ตรวจสอบอีเมลของคุณแล้วกรอกรหัส OTP");
      navigation.replace("otp");
    } else {
      Alert.alert("สมัครไม่สำเร็จ", data.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background_login.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>ชื่อ-นามสกุล</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกข้อมูล..."
          value={fullName}
          onChangeText={setFullName}
        />
        <View style={styles.rowLabel}>
          <Text style={styles.labelLeft}>ส่วนสูง</Text>
          <Text style={styles.labelRight}>น้ำหนัก</Text>
        </View>
        <View style={styles.rowInput}>
          <TextInput
            style={styles.inputLeft}
            placeholder="กรอกข้อมูล..."
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
          <TextInput
            style={styles.inputRight}
            placeholder="กรอกข้อมูล..."
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>
        <View style={styles.rowLabel}>
          <Text style={styles.labelLeft}>อายุ</Text>
          <Text style={styles.labelRight}>เพศ</Text>
        </View>
        <View style={styles.rowInput}>
          <TextInput
            style={styles.inputLeft}
            placeholder="กรอกข้อมูล..."
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
          <TextInput
            style={styles.inputRight}
            placeholder="กรอกข้อมูล..."
            value={gender}
            onChangeText={setGender}
          />
        </View>
        <Text style={styles.label}>ที่อยู่ปัจจุบัน</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกข้อมูล..."
          value={address}
          onChangeText={setAddress}
        />
        <Text style={styles.label}>อีเมล</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกข้อมูล..."
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.label}>รหัสผ่าน</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกข้อมูล..."
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
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
    marginTop: 10,
  },
  rowLabel: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  labelLeft: {
    width: 120,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  labelRight: {
    width: 120,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: '15%',
  },
  rowInput: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 5,
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
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  inputRight: {
    width: 120,
    borderWidth: 1,
    borderColor: '#ccc',
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
});
