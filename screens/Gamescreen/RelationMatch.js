// screens/Gamescreen/MatchGame.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";

/* ===== CONFIG ===== */
const QUESTION_TIME = 30;
const AUTO_NEXT_DELAY = 700;
const SHUFFLE_CHOICES = true;

/* ===== DATA (10 ข้อ) ===== */
const BASE_QUESTIONS = [
  { id: "1",  left: "สมุด",       choices: ["โรงพยาบาล","ดินสอ","ประตู","ตู้เสื้อผ้า","รถดับเพลิง","โรงเรียน"], correctIndex: 1 },
  { id: "2",  left: "หมอ",        choices: ["รถดับเพลิง","ตู้เสื้อผ้า","ประตู","ดินสอ","โรงเรียน","โรงพยาบาล"], correctIndex: 5 },
  { id: "3",  left: "ครู",        choices: ["รถดับเพลิง","โรงพยาบาล","ประตู","โรงเรียน","ตู้เสื้อผ้า","ดินสอ"], correctIndex: 3 },
  { id: "4",  left: "นักดับเพลิง", choices: ["ประตู","โรงพยาบาล","รถดับเพลิง","ดินสอ","โรงเรียน","ตู้เสื้อผ้า"], correctIndex: 2 },
  { id: "5",  left: "กุญแจ",      choices: ["ตู้เสื้อผ้า","โรงพยาบาล","ประตู","ดินสอ","โรงเรียน","รถดับเพลิง"], correctIndex: 2 },
  { id: "6",  left: "เสื้อผ้า",    choices: ["ดินสอ","โรงพยาบาล","ประตู","ตู้เสื้อผ้า","โรงเรียน","รถดับเพลิง"], correctIndex: 3 },
  { id: "7",  left: "หนังสือ",     choices: ["ห้องเรียน","สนามกีฬา","ครัว","ห้องสมุด","โรงรถ","สวนสาธารณะ"], correctIndex: 3 },
  { id: "8",  left: "นักเรียน",     choices: ["ห้องพยาบาล","โรงพัก","ห้องเรียน","ห้องครัว","โรงรถ","สนามกีฬา"], correctIndex: 2 },
  { id: "9",  left: "เตาแก๊ส",     choices: ["ห้องครัว","ห้องนอน","ห้องเรียน","โรงพยาบาล","สนามกีฬา","ห้องสมุด"], correctIndex: 0 },
  { id: "10", left: "ตำรวจ",       choices: ["สนามบิน","สถานีตำรวจ","โรงเรียน","ห้องสมุด","โรงพยาบาล","สถานีดับเพลิง"], correctIndex: 1 },
];

/* ===== Utils ===== */
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const prepareRoundQuestions = (qs) =>
  shuffleArray(qs).map((q) => {
    if (!SHUFFLE_CHOICES) return { ...q };
    const pairs = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffleArray(pairs);
    return {
      ...q,
      choices: shuffled.map((p) => p.c),
      correctIndex: shuffled.findIndex((p) => p.i === q.correctIndex),
    };
  });

/* ===== PressableScale ===== */
const PressableScale = ({ style, onPress, disabled, children }) => {
  const v = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(v, { toValue: 0.98, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(v, { toValue: 1, useNativeDriver: true }).start();
  return (
    <Animated.View style={{ transform: [{ scale: v }] }}>
      <TouchableOpacity activeOpacity={0.85} onPressIn={onIn} onPressOut={onOut} onPress={onPress} disabled={disabled} style={style}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ===== Screen ===== */
export default function MatchGame() {
  const [phase, setPhase] = useState("intro");
  const [questions, setQuestions] = useState(() => prepareRoundQuestions(BASE_QUESTIONS));
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);

  const timerRef = useRef(null);
  const lockRef = useRef(false);

  const current = questions[index];
  const correctCount = useMemo(() => answers.filter((a) => a.chosen === a.correctIndex).length, [answers]);

  const startGame = () => {
    setQuestions(prepareRoundQuestions(BASE_QUESTIONS));
    setPhase("quiz");
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setTimeLeft(QUESTION_TIME);
  };

  /* Timer ต่อข้อ */
  useEffect(() => {
    if (phase !== "quiz") return;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          finishQuestion(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [phase, index]);

  const finishQuestion = (choiceIndex) => {
    lockRef.current = true;
    setSelected(choiceIndex);
    setAnswers((prev) => [...prev, { id: current.id, chosen: choiceIndex, correctIndex: current.correctIndex }]);
    setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex((i) => i + 1);
        setSelected(null);
        lockRef.current = false;
      } else {
        setPhase("result");
      }
    }, AUTO_NEXT_DELAY);
  };
  const onChoose = (i) => {
    if (lockRef.current || selected !== null) return;
    finishQuestion(i);
  };

  const Option = ({ label, i }) => {
    const isChosen = selected === i;
    const isCorrect = i === current.correctIndex;
    const showGreen = selected !== null && isChosen && isCorrect;
    const showRed = selected !== null && isChosen && !isCorrect;
    return (
      <PressableScale
        disabled={selected !== null}
        onPress={() => onChoose(i)}
        style={[
          styles.option,
          showGreen && styles.correct,
          showRed && styles.wrong,
        ]}
      >
        <Text style={[styles.optionText, showGreen && styles.correctText, showRed && styles.wrongText]}>{label}</Text>
      </PressableScale>
    );
  };

  return (
    <View style={styles.container}>
      {/* ===== INTRO ===== */}
      {phase === "intro" && (
        <View style={styles.centerWrap}>
          <Text style={styles.title}>เกมจับคู่ความสัมพันธ์</Text>
          <Text style={styles.body}>เลือกคำที่เกี่ยวข้องกับโจทย์ที่กำหนด</Text>
          <PressableScale style={styles.primaryBtn} onPress={startGame}>
            <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
          </PressableScale>
        </View>
      )}

      {/* ===== QUIZ ===== */}
      {phase === "quiz" && current && (
        <View style={{ flex: 1, padding: 20 }}>
          {/* ✅ แถบหัว: ข้อ/คะแนน/เวลา (แบบเกมอื่น ๆ) */}
          <View style={styles.headerRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ข้อ {index + 1}/{questions.length}</Text>
            </View>
            <View style={styles.badgeOutline}>
              <Text style={styles.badgeOutlineText}>คะแนน {correctCount}</Text>
            </View>
            <View style={styles.timePill}>
              <Text style={styles.timeText}>เวลา {timeLeft} วิ</Text>
            </View>
          </View>

          <Text style={styles.question}>
            จับคู่กับ: <Text style={{ fontWeight: "900" }}>{current.left}</Text>
          </Text>

          <View style={{ rowGap: 12 }}>
            {current.choices.map((c, i) => <Option key={`${current.id}-${i}`} label={c} i={i} />)}
          </View>
        </View>
      )}

      {/* ===== RESULT ===== */}
      {phase === "result" && (
        <View style={styles.centerWrap}>
          <Text style={styles.title}>สรุปผล</Text>
          <Text style={styles.score}>คุณได้ {correctCount} / {questions.length} คะแนน</Text>
          <PressableScale style={styles.primaryBtn} onPress={startGame}>
            <Text style={styles.primaryBtnText}>เล่นอีกครั้ง</Text>
          </PressableScale>
        </View>
      )}
    </View>
  );
}

/* ===== Styles: โทนส้มเหมือนเกมอื่น ๆ ===== */
const ORANGE = "#ff7f32";
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  centerWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "800", color: ORANGE, marginBottom: 12, textAlign: "center" },
  body: { fontSize: 18, color: "#333", marginBottom: 16, textAlign: "center" },

  /* Header badges */
  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
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
  timePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff2e9",
    borderWidth: 1,
    borderColor: "#ffd3b4",
  },
  timeText: { color: ORANGE, fontWeight: "800" },

  question: { fontSize: 22, fontWeight: "800", marginBottom: 16, textAlign: "center", color: "#222" },

  option: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: ORANGE,
    borderRadius: 14,
    padding: 16,
    marginVertical: 6,
  },
  optionText: { fontSize: 18, fontWeight: "600", color: "#333", textAlign: "center" },

  correct: { backgroundColor: "#d4f8e8", borderColor: "#10B981" },
  correctText: { color: "#065F46" },
  wrong: { backgroundColor: "#ffe3e3", borderColor: "#EF4444" },
  wrongText: { color: "#991B1B" },

  score: { fontSize: 20, fontWeight: "700", marginBottom: 16, color: "#333" },

  primaryBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 200,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
