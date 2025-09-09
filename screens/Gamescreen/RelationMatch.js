// screens/Gamescreen/MatchGame.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform } from "react-native";

// ===== ICONS =====
// Expo:
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// RN CLI (แทนบรรทัดบนหากไม่ได้ใช้ Expo):
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";

/* ===== THEME: โทนส้ม อ่านง่ายเท่ากับ StoryGame ===== */
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
const STATE = {
  okBg: "#E9FFF5",
  okBd: "#1DBF73",
  okTx: "#075E3A",
  noBg: "#FFF1F0",
  noBd: "#F05252",
  noTx: "#7A1D1B",
};

/* ===== CONFIG ===== */
const QUESTION_TIME = 30;
const AUTO_NEXT_DELAY = 600;
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
  const onIn = () => Animated.spring(v, { toValue: 0.98, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const onOut = () => Animated.spring(v, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  return (
    <Animated.View style={{ transform: [{ scale: v }] }}>
      <TouchableOpacity activeOpacity={0.9} onPressIn={onIn} onPressOut={onOut} onPress={onPress} disabled={disabled} style={style}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ===== Screen ===== */
export default function MatchGame() {
  // phase: intro -> quiz -> result
  const [phase, setPhase] = useState("intro");
  const [questions, setQuestions] = useState(() => prepareRoundQuestions(BASE_QUESTIONS));
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);

  const timerRef = useRef(null);
  const lockRef = useRef(false);

  // progress + pulse เหมือนเกมแรก
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

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
          if (!lockRef.current) finishQuestion(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [phase, index]);

  /* Progress bar */
  useEffect(() => {
    if (phase !== "quiz") {
      progress.setValue(0);
      return;
    }
    const to = (index + 1) / questions.length;
    Animated.timing(progress, { toValue: to, duration: 250, useNativeDriver: false }).start();
  }, [index, phase, questions.length, progress]);

  /* Pulse เมื่อเวลาน้อย */
  useEffect(() => {
    if (phase === "quiz" && timeLeft <= 10) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 250, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 250, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [phase, timeLeft, pulse]);

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
        lockRef.current = false;
      }
    }, AUTO_NEXT_DELAY);
  };
  const onChoose = (i) => {
    if (lockRef.current || selected !== null) return;
    finishQuestion(i);
  };

  /* ตัวเลือก */
  const Option = ({ label, i }) => {
    const isChosen = selected === i;
    const isCorrect = i === current.correctIndex;
    const showGreen = selected !== null && isChosen && isCorrect;
    const showRed = selected !== null && isChosen && !isCorrect;

    const bullets = ["①", "②", "③", "④", "⑤", "⑥"];
    const prefix = bullets[i] || "•";

    return (
      <PressableScale
        disabled={selected !== null}
        onPress={() => onChoose(i)}
        style={[
          styles.option,
          showGreen && styles.correct,
          showRed && styles.wrong,
          selected !== null && styles.optionDisabled,
        ]}
      >
        <Text style={[styles.optionText, showGreen && styles.correctText, showRed && styles.wrongText]}>
          {prefix}  {label}
        </Text>
      </PressableScale>
    );
  };

  return (
    <View style={styles.container}>
      {/* ===== TOPBAR ===== */}
      <View style={styles.topbar}>
        <View style={styles.topbarContent}>
          <Icon name="puzzle" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
          <Text style={styles.topbarTitle}>เกมจับคู่ความสัมพันธ์ </Text>
        </View>
      </View>

      {/* ===== INTRO (วิธีเล่น) ===== */}
      {phase === "intro" && (
        <ScrollView contentContainerStyle={styles.introWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.introCard}>
            <View style={styles.introRow}>
              <Icon name="book-outline" size={26} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>อ่านโจทย์ตรงกลาง แล้วเลือกคำที่ “เกี่ยวข้องที่สุด” จากตัวเลือก</Text>
            </View>
            <View style={styles.introRow}>
              <Icon name="timer-outline" size={26} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>ตอบภายใน {QUESTION_TIME} วินาทีต่อข้อ</Text>
            </View>
            <View style={styles.introRow}>
              <Icon name="gesture-tap" size={26} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>ปุ่มตัวเลือกใหญ่ แตะง่าย เหมาะผู้สูงอายุ</Text>
            </View>
            <View style={styles.introRow}>
              <Icon name="check-circle-outline" size={26} color={STATE.okBd} />
              <Text style={styles.introText}>ตอบถูกเป็นกรอบเขียว / ผิดเป็นกรอบแดง</Text>
            </View>
          </View>

          <View style={styles.introActions}>
            <PressableScale style={styles.primaryBtn} onPress={startGame}>
              <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
            </PressableScale>
          </View>
        </ScrollView>
      )}

      {/* ===== QUIZ ===== */}
      {phase === "quiz" && current && (
        <View style={{ flex: 1 }}>
          {/* Header: เวลา + ข้อ + แถบความคืบหน้า */}
          <View style={styles.quizHeader}>
            <Animated.View style={[styles.timerPill, { transform: [{ scale: pulse }] }]}>
              <Text style={styles.timerLabel}>เวลา</Text>
              <Text style={[styles.timerValue, timeLeft <= 10 && styles.timerUrgent]}>{timeLeft} วินาที</Text>
            </Animated.View>

            <View style={styles.quizTitlePill}>
              <Text style={styles.quizTitleInline}>ข้อ {index + 1} / {questions.length}</Text>
            </View>

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

          {/* โจทย์หลัก (คำด้านซ้าย) */}
          <View style={styles.leftCardWrap}>
            <View style={styles.leftCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <Icon name="arrow-right-circle-outline" size={22} color={ORANGE.primaryDark} />
                <Text style={styles.leftLabel}>จับคู่กับ:</Text>
              </View>
              <Text style={styles.leftWord}>{current.left}</Text>
            </View>
          </View>

          {/* ตัวเลือก */}
          <View style={styles.quizBody}>
            <View style={{ rowGap: 14 }}>
              {current.choices.map((c, i) => (
                <Option key={`${current.id}-${i}`} label={c} i={i} />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* ===== RESULT ===== */}
      {phase === "result" && (
        <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Icon name="flag-checkered" size={22} color={ORANGE.primaryDark} />
              <Text style={styles.resultTitle}>สรุปผล</Text>
            </View>
            <Text style={styles.resultScore}>ได้ {correctCount} / {questions.length} ข้อ</Text>
            <View style={styles.resultBar}>
              <View style={[styles.resultFill, { width: `${(correctCount / questions.length) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.resultActionsCenter}>
            <PressableScale style={styles.secondaryBtn} onPress={startGame}>
              <Text style={styles.secondaryBtnText}>เล่นอีกครั้ง</Text>
            </PressableScale>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

/* ===== Styles (เหมือนสไตล์เกมแรก) ===== */
const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  android: { elevation: 2 },
  default: {},
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NEUTRAL.bg },

  // TOP BAR
  topbar: {
    paddingTop: 14, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: NEUTRAL.card, borderBottomWidth: 1, borderBottomColor: NEUTRAL.line,
  },
  topbarContent: { flexDirection: "row", alignItems: "center", alignSelf: "center", maxWidth: "92%" },
  topbarTitle: {
    fontSize: 26, fontWeight: "900", color: ORANGE.textMain,
    textAlign: "center", flexShrink: 1,
  },

  // INTRO
  introWrap: { padding: 18, alignItems: "center" },
  introCard: {
    backgroundColor: NEUTRAL.card, borderRadius: 18, borderWidth: 2, borderColor: ORANGE.border,
    padding: 18, width: "100%", ...cardShadow,
  },
  introRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  introText: { fontSize: 18, color: ORANGE.textSub, flexShrink: 1, lineHeight: 26 },
  introActions: { marginTop: 14, gap: 10, alignItems: "center", width: "100%" },

  // QUIZ HEADER
  quizHeader: {
    paddingTop: 42, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: NEUTRAL.card, borderBottomWidth: 1, borderBottomColor: NEUTRAL.line,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8,
  },
  timerPill: {
    backgroundColor: ORANGE.pale, borderWidth: 2, borderColor: ORANGE.border,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 120, alignItems: "center",
  },
  timerLabel: { fontSize: 14, color: ORANGE.textSub, marginBottom: 2, fontWeight: "800" },
  timerValue: { fontSize: 20, fontWeight: "900", color: ORANGE.primaryDark },
  timerUrgent: { color: "#C81E1E" },

  quizTitlePill: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    backgroundColor: ORANGE.light, borderWidth: 2, borderColor: ORANGE.border,
  },
  quizTitleInline: { fontSize: 18, fontWeight: "900", color: ORANGE.textMain },

  progressBox: { flex: 1, marginLeft: 8 },          // <-- แทน width เดิม
progressBar: {
  width: "100%",
  height: 10,
  backgroundColor: ORANGE.pale,
  borderRadius: 999,
  overflow: "hidden",
  paddingHorizontal: 1.5,                           // กันชนขอบ
},
progressFill: {
  height: "100%",
  backgroundColor: ORANGE.primary,
  borderRadius: 999,
},

  // LEFT WORD
  leftCardWrap: { paddingHorizontal: 18, paddingTop: 12 },
  leftCard: {
    backgroundColor: NEUTRAL.card, borderRadius: 16, borderWidth: 2, borderColor: ORANGE.border,
    padding: 16, alignItems: "center", ...cardShadow,
  },
  leftLabel: { fontSize: 18, color: ORANGE.textSub, fontWeight: "800" },
  leftWord: { fontSize: 28, color: ORANGE.textMain, fontWeight: "900", marginTop: 6 },

  // QUIZ BODY
  quizBody: { flex: 1, padding: 18, paddingBottom: 24 },
  option: {
    backgroundColor: NEUTRAL.card,
    borderWidth: 2, borderColor: "#E5E2DA", borderRadius: 16, paddingVertical: 18, paddingHorizontal: 18,
    minHeight: 64, justifyContent: "center", ...cardShadow,
  },
  optionDisabled: { opacity: 0.95 },
  optionText: { fontSize: 20, fontWeight: "800", color: ORANGE.textSub, textAlign: "center" },
  correct: { backgroundColor: STATE.okBg, borderColor: STATE.okBd },
  correctText: { color: STATE.okTx },
  wrong: { backgroundColor: STATE.noBg, borderColor: STATE.noBd },
  wrongText: { color: STATE.noTx },

  // RESULT
  resultWrap: { padding: 18, paddingTop: 36, alignItems: "center" },
  resultCard: {
    backgroundColor: NEUTRAL.card, borderRadius: 18, borderWidth: 2, borderColor: ORANGE.border,
    padding: 22, width: "100%", alignItems: "center", marginBottom: 14, ...cardShadow,
  },
  resultTitle: { fontSize: 22, fontWeight: "900", color: ORANGE.textMain },
  resultScore: { fontSize: 18, color: ORANGE.textSub, marginTop: 6, marginBottom: 12 },
  resultBar: { width: "100%", height: 12, backgroundColor: ORANGE.pale, borderRadius: 999, overflow: "hidden" },
  resultFill: { height: "100%", backgroundColor: STATE.okBd },

  resultActionsCenter: { width: "100%", gap: 12, alignItems: "center" },

  // BUTTONS
  primaryBtn: {
    backgroundColor: ORANGE.primary, paddingVertical: 18, paddingHorizontal: 26,
    borderRadius: 14, minWidth: 240, alignItems: "center", ...cardShadow,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  secondaryBtn: {
    backgroundColor: ORANGE.light, paddingVertical: 16, paddingHorizontal: 22,
    borderRadius: 14, minWidth: 200, alignItems: "center",
    borderWidth: 2, borderColor: ORANGE.border, ...cardShadow,
  },
  secondaryBtnText: { color: ORANGE.textMain, fontSize: 18, fontWeight: "900" },
});
