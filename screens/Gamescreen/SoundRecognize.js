import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from "react-native";
import { Audio } from "expo-audio";
import { Ionicons } from "@expo/vector-icons";

const GREEN = "#10B981";
const RED = "#EF4444";

const sounds = [
  { file: require("../../assets/sounds/Dog.mp3"), answer: "หมา" },
  { file: require("../../assets/sounds/Cat.mp3"), answer: "แมว" },
  { file: require("../../assets/sounds/Car.mp3"), answer: "รถยนต์" },
  { file: require("../../assets/sounds/Bird.mp3"), answer: "นก" },
  { file: require("../../assets/sounds/Horse.mp3"), answer: "ม้า" },
  { file: require("../../assets/sounds/Rain.mp3"), answer: "ฝน" },
  { file: require("../../assets/sounds/Sheep.mp3"), answer: "แกะ" },
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateChoices(correctAnswer) {
  const wrongAnswers = sounds.map((s) => s.answer).filter((a) => a !== correctAnswer);
  const randomWrongs = shuffleArray(wrongAnswers).slice(0, 2);
  return shuffleArray([correctAnswer, ...randomWrongs]);
}

const AUTO_NEXT_DELAY = 800;
const MAX_ROUNDS = 5;

export default function SoundRecognize() {
  const [phase, setPhase] = useState("intro");
  const [currentSound, setCurrentSound] = useState(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [history, setHistory] = useState([]);

  const soundRef = useRef(null);

  // cleanup sound when unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playSound = async () => {
    try {
      if (!currentSound?.file) return;

      // unload sound ก่อน
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(currentSound.file);
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn("playSound error:", e);
    }
  };

  const startGame = () => {
    const first = sounds[Math.floor(Math.random() * sounds.length)];
    setCurrentSound(first);
    setChoices(generateChoices(first.answer));
    setRound(1);
    setScore(0);
    setSelected(null);
    setIsCorrect(null);
    setHistory([]);
    setPhase("quiz");
  };

  const goNext = () => {
    if (round >= MAX_ROUNDS) {
      setPhase("result");
      return;
    }
    const next = sounds[Math.floor(Math.random() * sounds.length)];
    setCurrentSound(next);
    setChoices(generateChoices(next.answer));
    setRound((r) => r + 1);
    setSelected(null);
    setIsCorrect(null);
  };

  const checkAnswer = (choice) => {
    if (selected) return;
    const ok = choice === currentSound.answer;
    setSelected(choice);
    setIsCorrect(ok);
    setHistory((h) => [...h, { answer: currentSound.answer, chosen: choice, correct: ok }]);
    if (ok) setScore((s) => s + 1);

    setTimeout(goNext, AUTO_NEXT_DELAY);
  };

  // ----- UI -----
  if (phase === "intro") {
    return (
      <>
        <View style={styles.topbar}>
          <View style={styles.topbarContent}>
            <Ionicons
              name="headset"
              size={26}
              color={ORANGE.primaryDark}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.topbarTitle}>เกมฟังเสียง</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.introWrap}>
          <View style={styles.introCard}>
            <View style={styles.introRow}>
              <Ionicons name="musical-notes-outline" size={22} color={ORANGE.primary} />
              <Text style={styles.introText}>กดปุ่ม “เล่นเสียง” เพื่อฟังเสียงตัวอย่าง</Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="hand-right-outline" size={22} color={ORANGE.primary} />
              <Text style={styles.introText}>เลือกคำตอบที่ตรงกับเสียงมากที่สุด</Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="checkmark-circle-outline" size={22} color={GREEN} />
              <Text style={styles.introText}>ตอบถูก = ปุ่มเป็นสีเขียว</Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="close-circle-outline" size={22} color={RED} />
              <Text style={styles.introText}>ตอบผิด = ปุ่มเป็นสีแดง</Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="albums-outline" size={22} color={ORANGE.primary} />
              <Text style={styles.introText}>ทั้งหมด {MAX_ROUNDS} รอบ ระบบจะนับคะแนนให้</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={startGame} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
          </TouchableOpacity>
        </ScrollView>
      </>
    );
  }

  if (phase === "result") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>สรุปผล</Text>
        <Text style={styles.scoreText}>
          คุณได้ {score} / {MAX_ROUNDS} คะแนน
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={startGame}>
          <Text style={styles.primaryBtnText}>เล่นอีกครั้ง</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.badgeSolid}>
          <Text style={styles.badgeSolidText}>
            รอบ {round}/{MAX_ROUNDS}
          </Text>
        </View>
        <View style={styles.badgeOutline}>
          <Text style={styles.badgeOutlineText}>คะแนน {score}</Text>
        </View>
      </View>

      <Text style={styles.title}>ฟังเสียงอะไรเอ่ย?</Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={playSound}>
        <Text style={styles.primaryBtnText}>▶️ เล่นเสียง</Text>
      </TouchableOpacity>

      <View style={styles.choices}>
        {choices.map((c) => {
          const isChosen = selected === c;
          return (
            <TouchableOpacity
              key={c}
              style={[
                styles.choiceBtn,
                isChosen && (isCorrect ? styles.correctChoice : styles.wrongChoice),
                selected && !isChosen && { opacity: 0.6 },
              ]}
              onPress={() => checkAnswer(c)}
              disabled={!!selected}
            >
              <Text
                style={[
                  styles.choiceText,
                  isChosen && (isCorrect ? styles.correctText : styles.wrongText),
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected && (
        <Text style={[styles.feedback, isCorrect ? styles.ok : styles.no]}>
          {isCorrect ? "✅ ถูกต้อง!" : "❌ ไม่ถูกต้อง"}
        </Text>
      )}
    </View>
  );
}

const ORANGE = {
  primary: "#FF8A1F",
  primaryDark: "#E67700",
  light: "#FFE7CC",
  pale: "#FFF6EC",
  border: "#FFD2A3",
  textMain: "#1F1300",
  textSub: "#4A3726",
};
const NEUTRAL = { bg: "#FFFDF9", line: "#F0E7DC", card: "#FFFFFF" };
const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 2 },
  default: {},
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", padding: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 16 },
  badgeSolid: { backgroundColor: ORANGE.primary, padding: 8, borderRadius: 8 },
  badgeSolidText: { color: "#fff", fontWeight: "bold" },
  badgeOutline: { borderWidth: 1, borderColor: ORANGE.primary, padding: 8, borderRadius: 8 },
  badgeOutlineText: { color: ORANGE.primary, fontWeight: "bold" },
  title: { fontSize: 24, fontWeight: "bold", color: ORANGE.primary, marginVertical: 8 },
  subtitle: { fontSize: 16, color: "#444", textAlign: "center", marginBottom: 20 },
  primaryBtn: {
    backgroundColor: ORANGE.primary,
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 14,
    minWidth: 200,
    alignItems: "center",
    marginTop: 20,
    ...cardShadow,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", },
  choices: { width: "100%", marginTop: 10 },
  choiceBtn: {
    padding: 16,
    borderWidth: 2,
    borderColor: ORANGE.primary,
    borderRadius: 12,
    marginVertical: 6,
    alignItems: "center",
  },
  correctChoice: { backgroundColor: "#d4f8e8", borderColor: GREEN },
  wrongChoice: { backgroundColor: "#ffe3e3", borderColor: RED },
  choiceText: { fontSize: 18, fontWeight: "bold", color: ORANGE.primary },
  correctText: { color: GREEN },
  wrongText: { color: RED },
  feedback: { marginTop: 10, fontSize: 20, fontWeight: "bold" },
  ok: { color: GREEN },
  no: { color: RED },
  scoreText: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },

  // Topbar
  topbar: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: NEUTRAL.card,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL.line,
  },
  topbarContent: { flexDirection: "row", alignItems: "center", alignSelf: "center", maxWidth: "92%" },
  topbarTitle: { fontSize: 24, fontWeight: "900", color: ORANGE.textMain, textAlign: "center", flexShrink: 1 },

  // Intro
  introWrap: { padding: 18, alignItems: "center" },
  introCard: {
    backgroundColor: NEUTRAL.card,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: ORANGE.border,
    padding: 18,
    width: "100%",
    ...cardShadow,
  },
  introRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  introText: { fontSize: 18, color: ORANGE.textSub, flexShrink: 1, lineHeight: 26 },
  introActions: { marginTop: 14, gap: 10, alignItems: "center", width: "100%" },
});
