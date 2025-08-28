import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// สุ่ม 
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export default function Catchword({ navigation }) {
  const bank = useMemo(
    () =>
      shuffle([
        { word: "แอปเปิ้ล", correct: "🍎", choices: ["🍎", "🍌", "🍇", "🍑"] },
        { word: "หมา", correct: "🐶", choices: ["🐶", "🐱", "🐭", "🐹"] },
        { word: "พระอาทิตย์", correct: "☀️", choices: ["🌧️", "☀️", "⛄", "🌙"] },
        { word: "พิซซ่า", correct: "🍕", choices: ["🍔", "🍟", "🍕", "🌭"] },
      ]),
    []
  );

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const total = bank.length;
  const q = bank[index];
  const choices = useMemo(() => shuffle(q.choices), [index]);

  const choose = (emoji) => {
    if (picked) return;
    setPicked(emoji);
    const ok = emoji === q.correct;
    setIsCorrect(ok);
    if (ok) setScore((s) => s + 1);
  };

  const next = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setPicked(null);
      setIsCorrect(null);
    }
  };

  if (index === total - 1 && picked && isCorrect !== null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎉 จบเกม!</Text>
        <Text style={styles.result}>คะแนนของคุณ: {score} / {total}</Text>

        <TouchableOpacity
          style={[styles.btn, styles.primary]}
          onPress={() => {
            setIndex(0);
            setScore(0);
            setPicked(null);
            setIsCorrect(null);
          }}
        >
          <Text style={styles.btnText}>เล่นอีกครั้ง</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.secondary]}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.btnText}>กลับเมนูเกม</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ส่วนหัว */}
      <Text style={styles.progress}>
        ข้อ {index + 1} / {total} | คะแนน: {score}
      </Text>

      {/* คำศัพท์ */}
      <Text style={styles.word}>{q.word}</Text>

      {/* ตัวเลือกอีโมจิ (2x2 grid) */}
      <View style={styles.choicesGrid}>
        {choices.map((em, i) => {
          const isPicked = picked === em;
          let bg = "#f2f2f2";
          if (isPicked && isCorrect === true) bg = "#2ecc71";
          if (isPicked && isCorrect === false) bg = "#e74c3c";

          return (
            <TouchableOpacity
              key={i}
              style={[styles.choice, { backgroundColor: bg }]}
              onPress={() => choose(em)}
            >
              <Text style={styles.choiceEmoji}>{em}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {picked && index < total - 1 && (
        <TouchableOpacity style={[styles.btn, styles.primary]} onPress={next}>
          <Text style={styles.btnText}>ข้อต่อไป ▶</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: "center", alignItems: "center",
    padding: 20, backgroundColor: "#fff"
  },
  progress: { fontSize: 20, marginBottom: 20, color: "#555" },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 10 },
  result: { fontSize: 24, marginBottom: 20 },
  word: {
    fontSize: 48,
    fontWeight: "bold",
    marginVertical: 30,
    textAlign: "center",
  },
  choicesGrid: {
    width: "80%",
    flexDirection: "row",
    flexWrap: "wrap",            // ✅ ทำให้ขึ้นบรรทัดใหม่
    justifyContent: "center",
    marginBottom: 30,
  },
  choice: {
    width: "40%",                // ✅ 2 ปุ่มต่อแถว
    aspectRatio: 1,              // ✅ ทำให้เป็นสี่เหลี่ยมจัตุรัส
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    margin: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  choiceEmoji: { fontSize: 40 },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
    minWidth: 200,
  },
  primary: { backgroundColor: "#ff7f32" },
  secondary: { backgroundColor: "#8e8e8e" },
  btnText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
});
