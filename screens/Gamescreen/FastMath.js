import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from "react-native";

export default function FastMathScreen({ navigation }) {
  const [timeLeft, setTimeLeft] = useState(20);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);

  // ✅ สร้างโจทย์ 20 ข้อ
  useEffect(() => {
    let q = [];
    for (let i = 0; i < 20; i++) {
      let a = Math.floor(Math.random() * 20) + 1;
      let b = Math.floor(Math.random() * 20) + 1;
      let op = Math.random() > 0.5 ? "+" : "-";
      let ans = op === "+" ? a + b : a - b;
      q.push({ a, b, op, ans });
    }
    setQuestions(q);
  }, []);

  // ✅ จับเวลา
  useEffect(() => {
    if (questionIndex >= 20) {
      setGameOver(true);
      return;
    }
    setTimeLeft(20);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          goNext();
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questionIndex]);

  const goNext = () => {
    // ✅ ถ้าครบทุกข้อ → จบเกม
    if (questionIndex + 1 >= questions.length) {
      setGameOver(true);
      return;
    }

    setTimeout(() => {
      setAnswer("");
      setFeedback(null);
      setQuestionIndex((prev) => prev + 1);
    }, 1000);
  };

  const handleSubmit = () => {
    if (answer.trim() === "") return;
    Keyboard.dismiss();

    const current = questions[questionIndex];
    if (!current) return;

    if (parseInt(answer) === current.ans) {
      setScore((s) => s + 1);
      setFeedback("✅ ถูกต้อง!");
    } else {
      setFeedback(`❌ ผิด! คำตอบคือ ${current.ans}`);
    }
    goNext();
  };

  // ✅ จบเกม
  if (gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>✅ จบเกม!</Text>
        <Text style={styles.score}>คุณได้ {score} / 20 คะแนน</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>🔙 กลับเมนูเกม</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ กัน error index เกิน
  if (questions.length === 0 || questionIndex >= questions.length) return null;

  const q = questions[questionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>⏳ เวลา: {timeLeft} วิ</Text>
      <Text style={styles.question}>
        {q.a} {q.op} {q.b} = ?
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={answer}
        onChangeText={setAnswer}
        placeholder="พิมพ์คำตอบที่นี่"
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>ยืนยันคำตอบ</Text>
      </TouchableOpacity>

      {feedback && <Text style={styles.feedback}>{feedback}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 20 },
  score: { fontSize: 26, marginBottom: 20 },
  timer: { fontSize: 26, fontWeight: "bold", color: "red", marginBottom: 20 },
  question: { fontSize: 40, fontWeight: "bold", marginBottom: 30 },
  input: {
    borderWidth: 2,
    borderColor: "#008080",
    borderRadius: 12,
    width: "70%",
    padding: 15,
    fontSize: 28,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#008080",
    padding: 18,
    borderRadius: 12,
    marginVertical: 10,
    width: "70%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  feedback: { fontSize: 24, fontWeight: "bold", marginTop: 15 },
});
