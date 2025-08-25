import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function ProfileSetupScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");

  const handleSave = async () => {
    if (!firstName || !lastName || !age || !weight || !height || !gender) {
      Alert.alert("กรอกข้อมูลให้ครบก่อนครับ");
      return;
    }
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        firstName,
        lastName,
        age,
        weight,
        height,
        gender,
        email: auth.currentUser.email,
      });
      navigation.replace("MainTabs");
    } catch (error) {
      Alert.alert("บันทึกไม่สำเร็จ", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 กรอกข้อมูลผู้ใช้</Text>
      <TextInput style={styles.input} placeholder="ชื่อ" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="นามสกุล" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="อายุ" keyboardType="numeric" value={age} onChangeText={setAge} />
      <TextInput style={styles.input} placeholder="น้ำหนัก (กก.)" keyboardType="numeric" value={weight} onChangeText={setWeight} />
      <TextInput style={styles.input} placeholder="ส่วนสูง (ซม.)" keyboardType="numeric" value={height} onChangeText={setHeight} />
      <TextInput style={styles.input} placeholder="เพศ (ชาย/หญิง)" value={gender} onChangeText={setGender} />
      <Button title="บันทึกข้อมูล" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 15, borderRadius: 5 },
});
