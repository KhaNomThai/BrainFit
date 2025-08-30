import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// สุ่ม
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const ORANGE = "#ff7f32";

export default function Catchword({ navigation }) {
  const bank = useMemo(
    () =>
      shuffle([
        { word: "แอปเปิ้ล",   correct: "🍎", choices: ["🍎", "🍌", "🍇", "🍑"] },
        { word: "หมา",       correct: "🐶", choices: ["🐶", "🐱", "🐭", "🐹"] },
        { word: "พระอาทิตย์", correct: "☀️", choices: ["🌧️", "☀️", "⛄", "🌙"] },
        { word: "พิซซ่า",    correct: "🍕", choices: ["🍔", "🍟", "🍕", "🌭"] },
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
        <Text style={styles.title}>จบเกม</Text>
        <Text style={styles.scoreText}>คุณได้ {score} / {total} คะแนน</Text>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => {
            setIndex(0);
            setScore(0);
            setPicked(null);
            setIsCorrect(null);
          }}
        >
          <Text style={styles.buttonText}>เล่นอีกครั้ง</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.buttonText}>กลับเมนูเกม</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header badges */}
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ข้อ {index + 1}/{total}</Text>
        </View>
        <View style={styles.badgeOutline}>
          <Text style={styles.badgeOutlineText}>คะแนน {score}</Text>
        </View>
      </View>

      {/* กล่องคำศัพท์ (สไตล์เดียวกับ FastMath questionBox) */}
      <View style={[
        styles.questionBox,
        picked && isCorrect === true && { borderColor: "#2ecc71", backgroundColor: "#d4f8e8" },
        picked && isCorrect === false && { borderColor: "#e74c3c", backgroundColor: "#ffe3e3" },
      ]}>
        <Text style={styles.word}>{q.word}</Text>
      </View>

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
              activeOpacity={0.85}
            >
              <Text style={styles.choiceEmoji}>{em}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ปุ่มถัดไป โชว์เมื่อเลือกแล้วและยังไม่จบ */}
      {picked && index < total - 1 && (
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={next}>
          <Text style={styles.buttonText}>ข้อต่อไป ▶</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // โทนเดียวกับ FastMath: พื้นหลังขาว + ส้ม
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

  // กล่องคำถาม/คำศัพท์
  questionBox: {
    borderWidth: 3,
    borderColor: ORANGE,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    width: "100%",
    alignItems: "center",
  },
  word: {
    fontSize: 42,
    fontWeight: "800",
    color: "#222",
    textAlign: "center",
  },

  // 2x2 grid
  choicesGrid: {
    width: "90%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  choice: {
    width: "44%",          // 2 ปุ่มต่อแถว
    aspectRatio: 1,        // จัตุรัส
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    margin: 8,
    // เงาเบา ๆ
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  choiceEmoji: { fontSize: 40, textAlign: "center" },

  // ปุ่มส้ม
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonPrimary: { backgroundColor: ORANGE },
  buttonSecondary: { backgroundColor: "#8e8e8e" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  // จบเกม
  title: { fontSize: 28, fontWeight: "800", color: ORANGE, marginBottom: 8 },
  scoreText: { fontSize: 22, color: "#333", marginBottom: 24 },
});
