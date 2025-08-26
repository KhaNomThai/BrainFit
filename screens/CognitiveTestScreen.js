import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView, StyleSheet } from "react-native";
import { auth, db } from "../firebase";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

export default function CognitiveTestScreen({ navigation }) {
  const [answers, setAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    q6: "",
  });

  const handleChange = (key, value) => {
    setAnswers({ ...answers, [key]: value });
  };

  const handleSubmit = async () => {
    // ตรวจสอบว่าใส่ครบทุกข้อ
    for (let i = 1; i <= 6; i++) {
      if (!answers[`q${i}`]) {
        Alert.alert("กรุณาตอบทุกข้อ");
        return;
      }
    }

    // คำนวณคะแนนง่าย ๆ (ตัวอย่าง) 
    // จริง ๆ ต้องใช้เกณฑ์ของ 6CIT
    let score = 0;
    Object.values(answers).forEach(ans => {
      if (ans.toLowerCase() === "correct") score += 1; // placeholder
    });

    try {
      await setDoc(doc(db, "cognitiveTests", auth.currentUser.uid + "_" + Date.now()), {
        uid: auth.currentUser.uid,
        answers,
        score,
        createdAt: serverTimestamp(),
      });

      Alert.alert("เสร็จสิ้น", `คะแนนของคุณ: ${score}/6`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🧠 แบบทดสอบ 6CIT</Text>

      {[1,2,3,4,5,6].map(i => (
        <View key={i} style={styles.questionContainer}>
          <Text style={styles.question}>คำถามข้อ {i}</Text>
          <TextInput
            style={styles.input}
            placeholder="พิมพ์คำตอบ"
            value={answers[`q${i}`]}
            onChangeText={(text) => handleChange(`q${i}`, text)}
          />
        </View>
      ))}

      <Button title="ส่งคำตอบ" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  questionContainer: { marginBottom: 15, width: "100%" },
  question: { fontSize: 16, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5 },
});
