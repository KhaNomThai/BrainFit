import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Dimensions } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { post } from "../../api";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";


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

const AUTO_NEXT_DELAY = 3000;
const MAX_ROUNDS = 5;

export default function SoundRecognize({email, navigation}) {
  const [phase, setPhase] = useState("intro");
  const [currentSound, setCurrentSound] = useState(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [history, setHistory] = useState([]);

  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [answers, setAnswers] = useState("");

  const soundRef = useRef(null);

  // cleanup sound when unmount
  useEffect(() => {
    if (phase === "result" && elapsedTime > 0) {
      saveResult();
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [phase]);

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

  const saveResult = async () => {
      const data = await 
      post({ 
        action: "savegametime",
        email: email.trim(), 
        gameName: "เกมฟังเสียง",
        playTime: elapsedTime,
        score: score,
        total: 0,
      });
    };
  
  const startGame = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
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
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      const totalSeconds = Math.floor(durationMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const playTime = parseFloat(`${minutes}.${seconds.toString().padStart(2, "0")}`);
      setElapsedTime(playTime.toFixed(2));
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
    setAnswers(currentSound.answer);
    setTimeout(
      goNext, 
    AUTO_NEXT_DELAY);
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
              <Ionicons name="musical-notes-outline" size={26} color={ORANGE.primary} />
              <Text style={styles.introText}>กดปุ่ม “เล่นเสียง” เพื่อฟังเสียงตัวอย่าง</Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="hand-right-outline" size={26} color={ORANGE.primary} />
              <Text style={styles.introText}>เลือกคำตอบที่ตรงกับเสียงมากที่สุด</Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="checkmark-circle-outline" size={26} color={GREEN} />
              <Text style={styles.introText}>ตอบถูก = ปุ่มเป็นสีเขียว</Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="close-circle-outline" size={26} color={RED} />
              <Text style={styles.introText}>ตอบผิด = ปุ่มเป็นสีแดง</Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="albums-outline" size={26} color={ORANGE.primary} />
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
        {/* <Text style={styles.title}>สรุปผล</Text>
        <Text style={styles.scoreText}>
          คุณได้ {score} / {MAX_ROUNDS} คะแนน
        </Text> */}
        <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: vw(2) }}>
                <Icon name="flag-checkered" size={22} color={ORANGE.primaryDark} />
                <Text style={styles.resultTitle}>สรุปผล</Text>
              </View>
              <Text style={styles.resultScore}>ได้ {score} / {MAX_ROUNDS} ข้อ</Text>
              <Text style={styles.resultScore}>ได้ ข้อ</Text>
              <View style={styles.resultBar}>
                <View style={[styles.resultFill, { width: `${(score/MAX_ROUNDS)*100}%` }]} />
                <View style={[styles.resultFill]} />
              </View>
            </View>

          <View style={styles.resultActionsCenter}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={startGame}>
              <Text style={styles.secondaryBtnText}>เล่นอีกครั้ง</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.backBtn]}
              onPress={() => navigation?.goBack?.()}
            >
              <Text style={styles.secondaryBtnText}>เลือกเกมอื่นๆ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      
    );
  }

  return (
    <View style={styles.container}>
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

      {/* <Text style={styles.title}>ฟังเสียงอะไรเอ่ย?</Text> */}
      <View style={styles.CardWrap}>
        <View style={styles.PlayWrap}>
          <TouchableOpacity style={styles.primaryBtnPlay} onPress={playSound}>
            {/* <Ionicons name="play-circle-outline" size={26} color={ORANGE.primaryDark} /> */}
            <Text style={styles.primaryBtnPlayText}>▶️ เล่นเสียง</Text>
          </TouchableOpacity>
        </View>
      </View>
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
      <View style={styles.feedbackbox}>
        {selected && (
          <Text style={[styles.feedback, isCorrect ? styles.ok : styles.no]}>
            {isCorrect ? "✓ ถูกต้อง" : `✗ ผิด (คำตอบคือ ${answers})`}
          </Text>
        )}
      </View>
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

const { width, height } = Dimensions.get("window");
const vh = (v) => (height * v) / 100;
const vw = (v) => (width * v) / 100;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NEUTRAL.bg },
  
  headerRow: { paddingTop: vh(2), paddingHorizontal: vw(4), backgroundColor: NEUTRAL.card, borderBottomWidth: 0, borderBottomColor: NEUTRAL.line, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: vw(5)},
  badgeSolid: { backgroundColor: ORANGE.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  badgeSolidText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  badgeOutline: { borderWidth: 2, borderColor: ORANGE.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  badgeOutlineText: { color: ORANGE.primary, fontWeight: "800", fontSize: 18 },
  title: { fontSize: 24, fontWeight: "bold", color: ORANGE.primary, marginVertical: 8, alignItems: "center" },
  subtitle: { fontSize: 16, color: "#444", textAlign: "center", marginBottom: 20 },
  CardWrap: {
    paddingTop: vh(1),
    paddingBottom: vh(2),
    paddingHorizontal: vw(4),
    backgroundColor: NEUTRAL.card,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL.line,
    flexDirection: "column", 
    justifyContent: "center",
    // alignItems: "center",
  },
  PlayWrap: { paddingHorizontal: vw(25), paddingTop: vh(1.5) },
  primaryBtnPlay: {backgroundColor: NEUTRAL.card, borderRadius: vh(2), borderWidth: 2, borderColor: ORANGE.border, padding: vw(4), alignItems: "center", ...cardShadow},
  primaryBtnPlayText: { color: "#000000ff", fontSize: 18, fontWeight: "700", letterSpacing: 0.3 },

  primaryBtn: {
    backgroundColor: ORANGE.primary, paddingVertical: 15, paddingHorizontal: 15,
    borderRadius: 16, minWidth: 260, marginTop: 15,alignItems: "center", ...cardShadow,
    
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", letterSpacing: 0.3 },
  choices: { width: "100%", marginTop: 10, paddingHorizontal: vw(5), },
  choiceBtn: {
    backgroundColor: NEUTRAL.card, borderWidth: 2, borderColor: "#E5E2DA", borderRadius: vh(2), paddingVertical: vh(2), paddingHorizontal: vw(4), marginTop: vh(1.5),justifyContent: "center", ...cardShadow },
  correctChoice: { backgroundColor: "#d4f8e8", borderColor: GREEN },
  wrongChoice: { backgroundColor: "#ffe3e3", borderColor: RED },
  choiceText: { fontSize: vh(2), fontWeight: "700", color: ORANGE.textSub, textAlign: "center" },
  correctText: { color: GREEN },
  wrongText: { color: RED },
  feedbackbox: {alignItems: "center"  },
  feedback: { marginTop: 10, fontSize: 20, fontWeight: "bold" },
  ok: { color: GREEN },
  no: { color: RED },
  scoreText: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },

  // Topbar
  topbar: {
    paddingTop: 14, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: NEUTRAL.card, borderBottomWidth: 1, borderBottomColor: NEUTRAL.line,
  },
  topbarContent: { flexDirection: "row", alignItems: "center", alignSelf: "center", maxWidth: "92%" },
  topbarTitle: { fontSize: 26, fontWeight: "900", color: ORANGE.textMain, textAlign: "center", flexShrink: 1 },

  // Intro
  introWrap: { padding: 18, alignItems: "center" },
  introCard: {
    backgroundColor: NEUTRAL.card, borderRadius: 18, borderWidth: 2, borderColor: ORANGE.border,
    padding: 18, width: "100%", ...cardShadow,
  },
  introRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  introText: { fontSize: 18, color: ORANGE.textSub, flexShrink: 1, lineHeight: 26 },
  introActions: { marginTop: 14, gap: 10, alignItems: "center", width: "100%" },

  resultWrap: { padding: 18, paddingTop: 36, alignItems: "center" },
  resultCard: {
    backgroundColor: NEUTRAL.card, borderRadius: 18, borderWidth: 2, borderColor: ORANGE.border,
    padding: 22, width: "100%", alignItems: "center", marginBottom: 14, ...cardShadow,
  },
  resultTitle: { fontSize: 22, fontWeight: "900", color: ORANGE.textMain },
  resultScore: { fontSize: 18, color: ORANGE.textSub, marginTop: 6, marginBottom: 12 },
  resultBar: { width: "100%", height: 12, backgroundColor: ORANGE.pale, borderRadius: 999, overflow: "hidden" },
  resultFill: { height: "100%", backgroundColor: "#1DBF73" },
  resultActionsCenter: { width: "100%", gap: 12, alignItems: "center" },
  backBtn: {
    backgroundColor: "#bebebeff",
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 14,
    minWidth: 200,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#a0a0a0ff",
    ...cardShadow,
  },
  secondaryBtn: {
    backgroundColor: ORANGE.light,
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 14,
    minWidth: 200,
    alignItems: "center",
    borderWidth: 2,
    borderColor: ORANGE.border,
    ...cardShadow,
  },
  secondaryBtnText: { color: "#000000ff", fontSize: 18, fontWeight: "700", letterSpacing: 0.3 },
});
