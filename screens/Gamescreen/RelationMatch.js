// screens/Gamescreen/MatchGame.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";

/* ===== CONFIG ===== */
const QUESTION_TIME = 30;     // วินาทีต่อข้อ
const AUTO_NEXT_DELAY = 700;  // ms หลังตอบ
const SHUFFLE_CHOICES = true; // สุ่มช้อยส์ทุกครั้ง

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

/* ===== PressableScale: ปุ่มเด้งนิ่ม ๆ ===== */
const PressableScale = ({ style, onPress, disabled, children }) => {
  const v = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(v, { toValue: 0.98, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const onOut = () => Animated.spring(v, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  return (
    <Animated.View style={{ transform: [{ scale: v }] }}>
      <TouchableOpacity activeOpacity={0.85} onPressIn={onIn} onPressOut={onOut} onPress={onPress} disabled={disabled} style={style}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ===== Screen: intro | quiz | result ===== */
export default function MatchGame() {
  const [phase, setPhase] = useState("intro");
  const [questions, setQuestions] = useState(() => prepareRoundQuestions(BASE_QUESTIONS));
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]); // {id, chosen, correctIndex}

  const timerRef = useRef(null);
  const lockRef = useRef(false);
  const progress = useRef(new Animated.Value(0)).current;

  const current = questions[index];

  // map id -> โจทย์ (คำฝั่งซ้าย) เพื่อใช้ในสรุป
  const idToLeft = useMemo(() => {
    const m = {};
    BASE_QUESTIONS.forEach((q) => { m[q.id] = q.left; });
    return m;
  }, []);

  const startGame = () => {
    setQuestions(prepareRoundQuestions(BASE_QUESTIONS));
    setPhase("quiz");
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setTimeLeft(QUESTION_TIME);
  };

  /* TIMER */
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          if (!lockRef.current) finishQuestion(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };
  useEffect(() => {
    if (phase === "quiz") resetTimer();
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [phase, index]);

  /* PROGRESS */
  useEffect(() => {
    if (phase !== "quiz") { progress.setValue(0); return; }
    Animated.timing(progress, { toValue: (index + 1) / questions.length, duration: 250, useNativeDriver: false }).start();
  }, [index, phase, questions.length, progress]);

  /* FLOW */
  const finishQuestion = (choiceIndex) => {
    lockRef.current = true;
    setSelected(choiceIndex);
    setAnswers((prev) => [...prev, { id: current.id, chosen: choiceIndex, correctIndex: current.correctIndex }]);

    setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex((i) => i + 1);
        setSelected(null);
        lockRef.current = false;
        resetTimer();
      } else {
        setPhase("result");
        lockRef.current = false;
      }
    }, AUTO_NEXT_DELAY);
  };
  const onChoose = (i) => {
    if (lockRef.current || selected !== null) return;
    finishQuestion(i);
  };

  const correctCount = useMemo(() => answers.filter((a) => a.chosen === a.correctIndex).length, [answers]);

  /* Option item */
  const Option = ({ label, i }) => {
    const isChosen = selected === i;
    const isCorrect = i === current.correctIndex;
    const showGreen = selected !== null && isChosen && isCorrect;
    const showRed = selected !== null && isChosen && !isCorrect;
    return (
      <PressableScale
        disabled={selected !== null}
        onPress={() => onChoose(i)}
        style={[styles.option, showGreen && styles.correct, showRed && styles.wrong, selected !== null && styles.optionDisabled]}
      >
        <Text style={[styles.optionText, showGreen && styles.correctText, showRed && styles.wrongText]}>{label}</Text>
      </PressableScale>
    );
  };

  return (
    <View style={styles.container}>
      {/* ===== INTRO ===== */}
      {phase === "intro" && (
        <View style={{ flex: 1 }}>
          <View style={styles.topbar}><Text style={styles.topbarTitle}>เกมจับคู่ความสัมพันธ์</Text></View>
          <ScrollView contentContainerStyle={styles.storyWrap} showsVerticalScrollIndicator={false}>
            <View style={styles.storyCard}>
              <Text style={styles.storyTitle}>วิธีเล่น</Text>
              <View style={styles.divider} />
              <Text style={styles.storyBody}>
                จับคู่คำที่มีความสัมพันธ์กัน โดยจะมีคำด้านซ้าย เช่น “หมอ” และเลือกอันที่สอดคล้องกัน เช่น “โรงพยาบาล”
              </Text>
            </View>
          </ScrollView>
          <View style={styles.bottomBarCenter}>
            <PressableScale style={styles.primaryBtn} onPress={startGame}>
              <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
            </PressableScale>
          </View>
        </View>
      )}

      {/* ===== QUIZ ===== */}
      {phase === "quiz" && current && (
        <View style={{ flex: 1 }}>
          <View style={styles.quizHeader}>
            <View style={styles.timerPill}>
              <Text style={styles.timerLabel}>เวลา</Text>
              <Text style={[styles.timerValue, timeLeft <= 10 && styles.timerUrgent]}>{timeLeft} วินาที</Text>
            </View>

            <PressableScale style={styles.quizTitlePill} onPress={() => {}}>
              <Text style={styles.quizTitleInline}>ข้อ {index + 1}/{questions.length}</Text>
            </PressableScale>

            <View style={styles.progressBox}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.quizBody}>
            <Text style={styles.question}>จับคู่กับ: <Text style={{ fontWeight: "900" }}>{current.left}</Text></Text>
            <View style={{ rowGap: 12 }}>
              {current.choices.map((c, i) => <Option key={`${current.id}-${i}`} label={c} i={i} />)}
            </View>

            {selected !== null && (
              <View style={styles.feedback}>
                <Text style={[styles.feedbackText, selected === current.correctIndex ? styles.feedbackOk : styles.feedbackNo]}>
                  {selected === current.correctIndex ? "ถูกต้อง" : "ไม่ถูกต้อง"}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* ===== RESULT ===== */}
      {phase === "result" && (
        <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>สรุปผล</Text>
            <Text style={styles.resultScore}>ได้ {correctCount} / {questions.length} ข้อ</Text>
            <View style={styles.resultBar}>
              <View style={[styles.resultFill, { width: `${(correctCount / questions.length) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.resultList}>
            {answers.map((a, i) => {
              const ok = a.chosen === a.correctIndex;
              return (
                <View key={i} style={styles.resultItem}>
                  <View style={styles.resultLeftWrap}>
                    <Text style={styles.resultIndex}>ข้อ {i + 1}</Text>
                    <Text style={styles.resultLabel}> • {idToLeft[a.id] || ""}</Text>
                  </View>
                  <View style={[styles.badge, ok ? styles.badgeOk : styles.badgeNo]}>
                    <Text style={styles.badgeText}>{ok ? "ถูก" : "ผิด"}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.resultActionsCenter}>
            <PressableScale style={styles.secondaryBtn} onPress={() => setPhase("intro")}>
              <Text style={styles.secondaryBtnText}>กลับหน้าเริ่ม</Text>
            </PressableScale>
            <PressableScale style={styles.primaryBtn} onPress={startGame}>
              <Text style={styles.primaryBtnText}>เล่นอีกครั้ง</Text>
            </PressableScale>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

/* ===== Styles (โทนสะอาด คลีน ๆ + ฟอนต์ใหญ่ขึ้น) ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FB" },

  // TOP / INTRO
  topbar: {
    paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E9F0", alignItems: "center",
  },
  topbarTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  storyWrap: { padding: 16, paddingBottom: 110 },
  storyCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E5E9F0", padding: 20 },
  storyTitle: { fontSize: 22, fontWeight: "800", color: "#111827", textAlign: "center", marginBottom: 12 },
  storyBody: { lineHeight: 28, color: "#374151", fontSize: 18 },
  divider: { height: 1, backgroundColor: "#E5E9F0", marginBottom: 12 },
  bottomBarCenter: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    borderTopWidth: 1, borderTopColor: "#E5E9F0",
    backgroundColor: "#FFFFFF", padding: 16, alignItems: "center",
  },

  // QUIZ HEADER
  quizHeader: {
    paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E9F0",
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8,
  },
  timerPill: {
    backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FEE2E2",
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
  },
  timerLabel: { fontSize: 14, color: "#6B7280", marginBottom: 2 },
  timerValue: { fontSize: 18, fontWeight: "800", color: "#EF4444" },
  timerUrgent: { color: "#DC2626" },
  quizTitlePill: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E5E7EB",
  },
  quizTitleInline: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  progressBox: { width: 140 },
  progressBar: { width: "100%", height: 8, backgroundColor: "#E5E7EB", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#2563EB", borderRadius: 4 },

  // QUIZ BODY
  quizBody: { flex: 1, padding: 16 },
  question: { fontSize: 22, fontWeight: "800", color: "#0F172A", marginBottom: 18, textAlign: "center", lineHeight: 30 },
  option: { backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: "#E2E8F0", borderRadius: 14, padding: 18 },
  optionDisabled: { opacity: 0.85 },
  optionText: { fontSize: 18, fontWeight: "600", color: "#374151" },
  correct: { backgroundColor: "#ECFDF5", borderColor: "#10B981" },
  correctText: { color: "#065F46" },
  wrong: { backgroundColor: "#FEF2F2", borderColor: "#EF4444" },
  wrongText: { color: "#991B1B" },
  feedback: { alignItems: "center", marginTop: 14 },
  feedbackText: { fontSize: 18, fontWeight: "800" },
  feedbackOk: { color: "#10B981" },
  feedbackNo: { color: "#EF4444" },

  // RESULT
  resultWrap: { padding: 16, paddingTop: 36, alignItems: "center" },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E9F0",
    padding: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
  },
  resultTitle: { fontSize: 20, fontWeight: "900", color: "#0F172A", marginBottom: 6 },
  resultScore: { fontSize: 16, color: "#334155", marginBottom: 12 },
  resultBar: { width: "100%", height: 10, backgroundColor: "#E5E7EB", borderRadius: 6, overflow: "hidden" },
  resultFill: { height: "100%", backgroundColor: "#10B981" },

  resultList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E9F0",
    paddingVertical: 4,
    paddingHorizontal: 12,
    width: "100%",
    marginTop: 6,
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 12,
    gap: 10,
  },
  resultLeftWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
  },
  resultIndex: { fontSize: 17, fontWeight: "900", color: "#1F2937" },
  resultLabel: { fontSize: 17, color: "#1F2937", marginLeft: 6, flexShrink: 1 },
  badge: { minWidth: 72, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, alignItems: "center" },
  badgeOk: { backgroundColor: "#d2ffeaff" },
  badgeNo: { backgroundColor: "#fcb9b9ff" },
  badgeText: { fontSize: 15, fontWeight: "800", color: "#0F172A" },

  resultActionsCenter: { width: "100%", gap: 10, alignItems: "center" },

  // BUTTONS
  primaryBtn: {
    backgroundColor: "#0EA5E9", paddingVertical: 16, paddingHorizontal: 24,
    borderRadius: 12, minWidth: 220, alignItems: "center",
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  secondaryBtn: {
    backgroundColor: "#EEF2F6", paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 12, minWidth: 170, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0",
  },
  secondaryBtnText: { color: "#0F172A", fontSize: 16, fontWeight: "800" },
});
