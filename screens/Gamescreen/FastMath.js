import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from "react-native";

const ORANGE = "#ff7f32";
const GREEN = "#2ecc71";
const RED = "#e74c3c";

export default function FastMathScreen({ navigation }) {
  const [timeLeft, setTimeLeft] = useState(20);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [answerState, setAnswerState] = useState(null); // "correct" | "wrong" | null

  // ✅ สร้างโจทย์ 20 ข้อ (ห้ามผลลัพธ์ติดลบ)
  useEffect(() => {
    const q = [];
    for (let i = 0; i < 20; i++) {
      let a = Math.floor(Math.random() * 20) + 1; // 1..20
      let b = Math.floor(Math.random() * 20) + 1; // 1..20
      const op = Math.random() > 0.5 ? "+" : "-";

      // ถ้าเป็นลบแล้ว a < b → สลับเพื่อให้ผลลัพธ์ไม่ติดลบ
      if (op === "-" && a < b) {
        [a, b] = [b, a];
      }

      const ans = op === "+" ? a + b : a - b;
      q.push({ a, b, op, ans });
    }
    setQuestions(q);
  }, []);

  // ⏱️ จับเวลา 20 วิ/ข้อ
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
          goNext(); // หมดเวลาไปข้อถัดไป
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [questionIndex]);

  const total = useMemo(() => 20, []);

  const goNext = () => {
    if (questionIndex + 1 >= total) {
      setGameOver(true);
      return;
    }
    setTimeout(() => {
      setAnswer("");
      setFeedback(null);
      setAnswerState(null);
      setQuestionIndex((prev) => prev + 1);
    }, 800);
  };

  const handleSubmit = () => {
    if (answer.trim() === "") return;
    Keyboard.dismiss();

    const current = questions[questionIndex];
    if (!current) return;

    if (Number(answer) === current.ans) {
      setScore((s) => s + 1);
      setFeedback("✓ ถูกต้อง");
      setAnswerState("correct");
    } else {
      setFeedback(`✗ ผิด (คำตอบคือ ${current.ans})`);
      setAnswerState("wrong");
    }
    goNext();
  };

  // ✅ หน้าสรุป
  if (gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>จบเกม</Text>
        <Text style={styles.score}>
          คุณได้ {score} / {total} คะแนน
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>กลับเมนูเกม</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (questions.length === 0 || questionIndex >= questions.length) {
    return <View style={styles.container} />;
  }

  const q = questions[questionIndex];

  return (
    <View style={styles.container}>
      {/* หัวเรื่อง */}
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            ข้อ {questionIndex + 1}/{total}
          </Text>
        </View>
        <View style={styles.badgeOutline}>
          <Text style={styles.badgeOutlineText}>คะแนน {score}</Text>
        </View>
      </View>

      {/* เวลา */}
      <Text style={styles.timerText}>เวลา {timeLeft} วิ</Text>

      {/* กล่องโจทย์ (เปลี่ยนสีตามผลลัพธ์) */}
      <View
        style={[
          styles.questionBox,
          answerState === "correct" && {
            borderColor: GREEN,
            backgroundColor: "#d4f8e8",
          },
          answerState === "wrong" && {
            borderColor: RED,
            backgroundColor: "#ffe3e3",
          },
        ]}
      >
        <Text style={styles.question}>
          {q.a} {q.op} {q.b} = ?
        </Text>
      </View>

      {/* กล่องคำตอบ */}
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={answer}
        onChangeText={setAnswer}
        placeholder="พิมพ์คำตอบที่นี่"
        placeholderTextColor="#b3b3b3"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      {/* ปุ่มยืนยัน */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.buttonPrimary,
          answer.trim() === "" && styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={answer.trim() === ""}
      >
        <Text style={styles.buttonText}>ยืนยันคำตอบ</Text>
      </TouchableOpacity>

      {/* Feedback */}
      {!!feedback && (
        <Text
          style={[
            styles.feedback,
            answerState === "correct" && { color: GREEN },
            answerState === "wrong" && { color: RED },
          ]}
        >
          {feedback}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // พื้นหลังขาว โทนส้ม
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 28,
    alignItems: "center",
  },

  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  badge: {
    backgroundColor: ORANGE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  badgeOutline: {
    borderWidth: 2,
    borderColor: ORANGE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeOutlineText: { color: ORANGE, fontWeight: "700", fontSize: 16 },

  timerText: {
    fontSize: 22,
    fontWeight: "700",
    color: ORANGE,
    marginVertical: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: ORANGE,
    marginBottom: 8,
  },
  score: { fontSize: 22, color: "#333", marginBottom: 24 },

  questionBox: {
    borderWidth: 3,
    borderColor: ORANGE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    width: "100%",
  },
  question: {
    fontSize: 42,
    fontWeight: "800",
    color: "#222",
    textAlign: "center",
  },

  input: {
    width: "100%",
    borderWidth: 2,
    borderColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 14,
    fontSize: 24,
    textAlign: "center",
    color: "#222",
    marginBottom: 14,
    backgroundColor: "#fff",
  },

  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonPrimary: { backgroundColor: ORANGE },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  feedback: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: ORANGE,
  },
});
