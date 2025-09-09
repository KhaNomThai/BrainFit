import React, { useState } from "react";
import { ImageBackground, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { post } from "../../api";

export default function ForgotPasswordResetScreen({ navigation, email }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword) return Alert.alert("กรุณากรอกรหัสผ่านใหม่");
    if (newPassword !== confirmPassword) return Alert.alert("รหัสผ่านไม่ตรงกัน");

    setLoading(true);
    try {
      const res = await post({
        action: "resetPassword",
        email: email.trim(),
        newPassword: newPassword.trim(),
      });
      setLoading(false);

      if (res.success) {
        Alert.alert("สำเร็จ", "รีเซ็ตรหัสผ่านเรียบร้อยแล้ว");
        // setScreen("login");
        navigation.replace("login");
      } else {
        Alert.alert("ผิดพลาด", res.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้");
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("ผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (

    // <View style={styles.container}>
    //   <Text style={styles.title}>ตั้งรหัสผ่านใหม่</Text>
    //   <Text style={styles.label}>รหัสผ่านใหม่</Text>
    //   <TextInput
    //     style={styles.input}
    //     placeholder="รหัสผ่านใหม่"
    //     secureTextEntry
    //     value={newPassword}
    //     onChangeText={setNewPassword}
    //   />
    //   <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
    //     {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>บันทึก</Text>}
    //   </TouchableOpacity>
    // </View>
  <ImageBackground
          source={require("../../assets/background_login.png")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
        <View style={styles.form}>
          <Text style={styles.forgotText}>ตั้งรหัสผ่านใหม่</Text>
          <Text style={styles.forText}>รหัสผ่านใหม่</Text>
          <Text style={styles.EmailText}>รหัสผ่าน</Text>
          <TextInput
              style={styles.Input}
              placeholder="กรอกข้อมูล"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
          />
          <Text style={styles.EmailText}>ยืนยันรหัสผ่าน</Text>
          <TextInput
              style={styles.Input}
              placeholder="กรอกข้อมูล"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
           {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ยืนยัน</Text>}
         </TouchableOpacity>
         <View style={styles.linklogin}>
            <Text style={{ color: "#555"}}> มีบัญชีอยู่แล้ว? </Text>
            <TouchableOpacity onPress={() => navigation.replace("login")}>
              <Text style={{ color: "#ff7f32", fontWeight: "bold", }}>เข้าสู่ระบบ</Text>
            </TouchableOpacity>
          </View>
        </View> 
      </ImageBackground>
    );
  }
  
  const styles = StyleSheet.create({
    form: { 
      flex: 1, 
      justifyContent: "flex-end",
      padding: 30,
      marginBottom: 220,
    },
    forgotText:{
      color: "#000000ff", 
      fontSize: 36, 
      fontWeight: "900",
      marginBottom: 5,
    },
    forText: { 
      color: "#000000ff", 
      fontSize: 16, 
      fontWeight: "400",
      marginBottom: 50,
      marginLeft: 5
    },
    Input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 10,
      padding: 12,
      marginBottom: 15,
    },
    linklogin: {
      flexDirection: "row", 
      justifyContent: "center",
      marginTop: 10,
    },
    EmailText: { 
      color: "#000000ff", 
      fontSize: 20, 
      fontWeight: "bold",
      marginBottom: 5,
    },
  
  
  
    // container: { flex: 1, justifyContent: "center", padding: 20 },
    // title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    // label: { fontSize: 16, marginBottom: 5 },
    // input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 15 },
    button: { 
      backgroundColor: "#ff7f32", 
      padding: 15, 
      borderRadius: 10, 
      alignItems: "center", 
      marginTop: 35,
    },
    buttonText: { 
      color: "#fff", 
      fontWeight: "bold" 
    },
  });