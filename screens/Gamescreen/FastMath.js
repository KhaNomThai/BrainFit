// screens/Gamescreen/FastMath.js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ScrollView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

/* ===== THEME ===== */
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
const GREEN = "#2ECC71";
const RED = "#E74C3C";

/* ===== CONFIG ===== */
const TOTAL_QUESTIONS = 20;
const SECONDS_PER_QUESTION = 20;
const AUTO_NEXT_DELAY = 800; // หน่วงให้เห็นสีถูก/ผิดก่อนข้าม

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  android: { elevation: 2 },
  default: {},
});

export default function FastMath() {
  // phase: intro | quiz | result
  const [phase, setPhase] = useState("intro");

  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // ข้อความ ✓/✗
  const [answerState, setAnswerState] = useState(null); // "correct" | "wrong" | null
  const [gameOver, setGameOver] = useState(false);

  const total = useMemo(() => TOTAL_QUESTIONS, []);

  // สร้างโจทย์ (ลบไม่ติดลบ)
  const generateQuestions = () => {
    const q = [];
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      let a = Math.floor(Math.random() * 20) + 1; // 1..20
      let b = Math.floor(Math.random() * 20) + 1; // 1..20
      const op = Math.random() > 0.5 ? "+" : "-";
      if (op === "-" && a < b) [a, b] = [b, a]; // กันผลลัพธ์ติดลบ
      const ans = op === "+" ? a + b : a - b;
      q.push({ a, b, op, ans });
    }
    return q;
  };

  const startGame = () => {
    setQuestions(generateQuestions());
    setPhase("quiz");
    setQuestionIndex(0);
    setScore(0);
    setAnswer("");
    setFeedback(null);
    setAnswerState(null);
    setGameOver(false);
    setTimeLeft(SECONDS_PER_QUESTION);
  };

  // จับเวลาต่อข้อ
  useEffect(() => {
    if (phase !== "quiz") return;
    if (questionIndex >= total) {
      setGameOver(true);
      setPhase("result");
      return;
    }
    setTimeLeft(SECONDS_PER_QUESTION);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          goNext(); // หมดเวลา -> ไปข้อถัดไป
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, questionIndex]);

  const goNext = () => {
    if (questionIndex + 1 >= total) {
      setGameOver(true);
      setPhase("result");
      return;
    }
    setTimeout(() => {
      setAnswer("");
      setFeedback(null);
      setAnswerState(null);
      setQuestionIndex((prev) => prev + 1);
    }, AUTO_NEXT_DELAY);
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

  /* ===== RENDER ===== */
  if (phase === "intro") {
    return (
      <View style={styles.containerBG}>
        {/* TOPBAR */}
        <View style={styles.topbar}>
          <View style={styles.topbarContent}>
            <Icon name="calculator-variant" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
            <Text style={styles.topbarTitle}>เกมคณิตคิดเร็ว</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.introWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.introCard}>
            <View style={styles.introRow}>
              <Icon name="timer-outline" size={26} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>
                ตอบโจทย์บวก/ลบให้ถูกต้อง ภายใน {SECONDS_PER_QUESTION} วินาทีต่อข้อ ทั้งหมด {TOTAL_QUESTIONS} ข้อ
              </Text>
            </View>
            <View style={styles.introRow}>
              <Icon name="gesture-tap" size={26} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>พิมพ์คำตอบ แล้วกด “ยืนยันคำตอบ” หรือกด Enter</Text>
            </View>
            <View style={styles.introRow}>
              <Icon name="check-circle-outline" size={26} color={"#1DBF73"} />
              <Text style={styles.introText}>ตอบถูก = กรอบ/พื้นหลังสีเขียว, ตอบผิด = สีแดง จากนั้นไปข้อถัดไปอัตโนมัติ</Text>
            </View>
          </View>

          <View style={styles.introActions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={startGame}>
              <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (phase === "result" || gameOver) {
    return (
      <View style={styles.containerBG}>
        {/* TOPBAR */}
        <View style={styles.topbar}>
          <View style={styles.topbarContent}>
            <Icon name="calculator-variant" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
            <Text style={styles.topbarTitle}>เกมคณิตคิดเร็ว</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Icon name="flag-checkered" size={22} color={ORANGE.primaryDark} />
              <Text style={styles.resultTitle}>สรุปผล</Text>
            </View>
            <Text style={styles.resultScore}>ได้ {score} / {total} ข้อ</Text>
            <View style={styles.resultBar}>
              <View style={[styles.resultFill, { width: `${(score / total) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.resultActionsCenter}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={startGame}>
              <Text style={styles.secondaryBtnText}>เล่นอีกครั้ง</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // phase === "quiz"
  if (!questions[questionIndex]) {
    return <View style={styles.containerBG} />;
  }
  const q = questions[questionIndex];

  return (
    <View style={styles.containerBG}>
      {/* TOPBAR */}
      <View style={styles.topbar}>
        <View style={styles.topbarContent}>
          <Icon name="calculator-variant" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
          <Text style={styles.topbarTitle}>เกมคณิตคิดเร็ว</Text>
        </View>
      </View>

      <View style={styles.bodyWrap}>
        {/* Header badges */}
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

        {/* เวลา (ตัวเลขล้วน) */}
        <Text style={styles.timerText}>เวลา {timeLeft} วิ</Text>

        {/* กล่องโจทย์ (เปลี่ยนสีตามผลลัพธ์) */}
        <View
          style={[
            styles.questionBox,
            answerState === "correct" && { borderColor: GREEN, backgroundColor: "#d4f8e8" },
            answerState === "wrong" && { borderColor: RED, backgroundColor: "#ffe3e3" },
          ]}
        >
          <Text style={styles.question}>
            {q.a} {q.op} {q.b} = ?
          </Text>
        </View>

        {/* คำตอบ */}
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
          style={[styles.button, styles.buttonPrimary, answer.trim() === "" && styles.buttonDisabled]}
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
    </View>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  containerBG: { flex: 1, backgroundColor: NEUTRAL.bg },

  // TOPBAR
  topbar: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: NEUTRAL.card,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL.line,
  },
  topbarContent: { flexDirection: "row", alignItems: "center", alignSelf: "center", maxWidth: "92%" },
  topbarTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: ORANGE.textMain,
    textAlign: "center",
    flexShrink: 1,
  },

  // INTRO
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
  primaryBtn: {
    backgroundColor: ORANGE.primary,
    paddingVertical: 18,
    paddingHorizontal: 26,
    borderRadius: 14,
    minWidth: 240,
    alignItems: "center",
    ...cardShadow,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },

  // QUIZ BODY WRAP
  bodyWrap: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 24 },

  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  badge: {
    backgroundColor: ORANGE.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  badgeOutline: {
    borderWidth: 2,
    borderColor: ORANGE.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeOutlineText: { color: ORANGE.primary, fontWeight: "700", fontSize: 16 },

  timerText: {
    fontSize: 25,
    fontWeight: "700",
    color: ORANGE.primary,
    marginVertical: 16,
  },

  questionBox: {
    borderWidth: 3,
    borderColor: ORANGE.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    width: "100%",
    ...cardShadow,
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
    borderColor: ORANGE.primary,
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
  buttonPrimary: { backgroundColor: ORANGE.primary },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  feedback: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: ORANGE.primary,
  },

  // RESULT
  resultWrap: { padding: 18, paddingTop: 36, alignItems: "center" },
  resultCard: {
    backgroundColor: NEUTRAL.card,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: ORANGE.border,
    padding: 22,
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
    ...cardShadow,
  },
  resultTitle: { fontSize: 22, fontWeight: "900", color: ORANGE.textMain },
  resultScore: { fontSize: 18, color: ORANGE.textSub, marginTop: 6, marginBottom: 12 },
  resultBar: { width: "100%", height: 12, backgroundColor: ORANGE.pale, borderRadius: 999, overflow: "hidden" },
  resultFill: { height: "100%", backgroundColor: "#1DBF73" },
  resultActionsCenter: { width: "100%", gap: 12, alignItems: "center" },
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
  secondaryBtnText: { color: ORANGE.textMain, fontSize: 18, fontWeight: "900" },
});
