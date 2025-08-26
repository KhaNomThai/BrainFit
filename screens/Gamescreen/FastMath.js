import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function CognitiveTestScreen() {
  const [timeLeft, setTimeLeft] = useState(20); // เวลา 20 วิ
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(1); // คำถามที่กำลังทำ
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  // สร้างโจทย์ + -
  const generateQuestion = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operator = Math.random() > 0.5 ? "+" : "-";
    const correct = operator === "+" ? num1 + num2 : num1 - num2;

    setQuestion(`${num1} ${operator} ${num2}`);
    setCorrectAnswer(correct);
    setAnswer("");
  };

  // เริ่มเกม
  useEffect(() => {
    generateQuestion();

    // ตัวจับเวลา
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ตรวจคำตอบ
  const checkAnswer = () => {
    if (parseInt(answer) === correctAnswer) {
      setScore((prev) => prev + 1);
    }

    if (currentQ < 20) {
      setCurrentQ((prev) => prev + 1);
      generateQuestion();
    } else {
      setGameOver(true);
    }
  };

  return (
    <View style={styles.container}>
      {gameOver ? (
        <Text style={styles.resultText}>🎉 จบเกม! คุณได้ {score} / 20 คะแนน</Text>
      ) : (
        <>
          <Text style={styles.timer}>⏱ เหลือเวลา: {timeLeft} วิ</Text>
          <Text style={styles.question}>
            {currentQ}.) {question}
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={answer}
            onChangeText={setAnswer}
            placeholder="พิมพ์คำตอบ"
          />
          <TouchableOpacity style={styles.button} onPress={checkAnswer}>
            <Text style={styles.buttonText}>ตอบ</Text>
          </TouchableOpacity>
          <Text style={styles.score}>คะแนนตอนนี้: {score}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  timer: { fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "red" },
  question: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", width: 120, padding: 10, fontSize: 18, textAlign: "center" },
  button: { backgroundColor: "#008080", marginTop: 20, padding: 15, borderRadius: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  score: { marginTop: 20, fontSize: 18, fontWeight: "bold" },
  resultText: { fontSize: 24, fontWeight: "bold", color: "blue", textAlign: "center" },
});
