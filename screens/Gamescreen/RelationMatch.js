import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform, Dimensions } from "react-native";
import { post } from "../../api";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

/* ===== THEME ===== */
const ORANGE = { primary: "#FF8A1F", primaryDark: "#E67700", light: "#FFE7CC", pale: "#FFF6EC", border: "#FFD2A3", textMain: "#1F1300", textSub: "#4A3726" };
const NEUTRAL = { bg: "#FFFDF9", line: "#F0E7DC", card: "#FFFFFF" };
const STATE = { okBg: "#E9FFF5", okBd: "#1DBF73", okTx: "#075E3A", noBg: "#FFF1F0", noBd: "#F05252", noTx: "#7A1D1B" };

/* ===== CONFIG ===== */
const QUESTION_TIME = 30;
const AUTO_NEXT_DELAY = 3000;
const SHUFFLE_CHOICES = true;

/* ===== DATA ===== */
const BASE_QUESTIONS = [
  { id: "1", left: "สมุด", choices: ["โรงพยาบาล","ดินสอ","ประตู","ตู้เสื้อผ้า","รถดับเพลิง","โรงเรียน"], correctIndex: 1 },
  { id: "2", left: "หมอ", choices: ["รถดับเพลิง","ตู้เสื้อผ้า","ประตู","ดินสอ","โรงเรียน","โรงพยาบาล"], correctIndex: 5 },
  { id: "3", left: "ครู", choices: ["รถดับเพลิง","โรงพยาบาล","ประตู","โรงเรียน","ตู้เสื้อผ้า","ดินสอ"], correctIndex: 3 },
  { id: "4", left: "นักดับเพลิง", choices: ["ประตู","โรงพยาบาล","รถดับเพลิง","ดินสอ","โรงเรียน","ตู้เสื้อผ้า"], correctIndex: 2 },
  { id: "5", left: "กุญแจ", choices: ["ตู้เสื้อผ้า","โรงพยาบาล","ประตู","ดินสอ","โรงเรียน","รถดับเพลิง"], correctIndex: 2 },
  { id: "6", left: "เสื้อผ้า", choices: ["ดินสอ","โรงพยาบาล","ประตู","ตู้เสื้อผ้า","โรงเรียน","รถดับเพลิง"], correctIndex: 3 },
  { id: "7", left: "หนังสือ", choices: ["ห้องเรียน","สนามกีฬา","ครัว","ห้องสมุด","โรงรถ","สวนสาธารณะ"], correctIndex: 3 },
  { id: "8", left: "นักเรียน", choices: ["ห้องพยาบาล","โรงพัก","ห้องเรียน","ห้องครัว","โรงรถ","สนามกีฬา"], correctIndex: 2 },
  { id: "9", left: "เตาแก๊ส", choices: ["ห้องครัว","ห้องนอน","ห้องเรียน","โรงพยาบาล","สนามกีฬา","ห้องสมุด"], correctIndex: 0 },
  { id: "10", left: "ตำรวจ", choices: ["สนามบิน","สถานีตำรวจ","โรงเรียน","ห้องสมุด","โรงพยาบาล","สถานีดับเพลิง"], correctIndex: 1 },
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
    return { ...q, choices: shuffled.map((p) => p.c), correctIndex: shuffled.findIndex((p) => p.i === q.correctIndex) };
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

/* ===== Responsive helpers ===== */
const { width, height } = Dimensions.get("window");
const vh = (v) => (height * v) / 100;
const vw = (v) => (width * v) / 100;
const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: vh(1.2), shadowOffset: { width: 0, height: vh(0.5) } },
  android: { elevation: 2 },
  default: {},
});

/* ===== Screen ===== */
export default function MatchGame({ email, navigation }) {
  const [phase, setPhase] = useState("intro");
  const [questions, setQuestions] = useState(() => prepareRoundQuestions(BASE_QUESTIONS));
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const timerRef = useRef(null);
  const lockRef = useRef(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const current = questions[index];
  const correctCount = useMemo(() => answers.filter((a) => a.chosen === a.correctIndex).length, [answers]);

  const saveResult = async () => {
    await post({
      action: "savegametime",
      email: email.trim(),
      gameName: "เกมจับคู่ความสัมพันธ์",
      playTime: elapsedTime,
      score: correctCount,
      total: 0,
    });
  };

  const startGame = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setQuestions(prepareRoundQuestions(BASE_QUESTIONS));
    setPhase("quiz");
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setTimeLeft(QUESTION_TIME);
  };

  useEffect(() => {
    if (phase === "result" && elapsedTime > 0) saveResult();
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

  useEffect(() => {
    if (phase !== "quiz") return;
    const to = (index + 1) / questions.length;
    Animated.timing(progress, { toValue: to, duration: 250, useNativeDriver: false }).start();
  }, [index, phase, questions.length]);

  useEffect(() => {
    if (phase === "quiz" && timeLeft <= 10) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 250, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 250, useNativeDriver: true }),
        ])
      ).start();
    } else pulse.setValue(1);
  }, [phase, timeLeft]);

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
        const endTime = Date.now();
        const durationMs = endTime - startTime;
        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const playTime = parseFloat(`${minutes}.${seconds.toString().padStart(2, "0")}`);
        setElapsedTime(playTime.toFixed(2));
        setPhase("result");
        lockRef.current = false;
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
    const bullets = ["①","②","③","④","⑤","⑥"];
    const prefix = bullets[i] || "•";
    return (
      <PressableScale disabled={selected !== null} onPress={() => onChoose(i)} style={[
        styles.option,
        showGreen && styles.correct,
        showRed && styles.wrong,
        selected !== null && styles.optionDisabled
      ]}>
        <Text style={[styles.optionText, showGreen && styles.correctText, showRed && styles.wrongText]}>
          {prefix} {label}
        </Text>
      </PressableScale>
    );
  };

  return (
    <View style={styles.container}>
      {/* TOPBAR */}
      <View style={styles.topbar}>
        <View style={styles.topbarContent}>
          <Icon name="puzzle" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
          <Text style={styles.topbarTitle}>เกมจับคู่ความสัมพันธ์</Text>
        </View>
      </View>

      {/* INTRO */}
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
            <TouchableOpacity style={styles.primaryBtn} onPress={startGame} activeOpacity={0.9}>
              <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* QUIZ */}
      {phase === "quiz" && current && (
        <View style={{ flex: 1 }}>
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
                <Animated.View style={[styles.progressFill, { width: progress.interpolate({ inputRange: [0,1], outputRange: ["0%","100%"] }) }]} />
              </View>
            </View>
          </View>

          <View style={styles.CardWrap}>
            <View style={styles.leftCardWrap}>
              <View style={styles.leftCard}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: vw(2), justifyContent: "center" }}>
                  <Icon name="arrow-right-circle-outline" size={vh(2.8)} color={ORANGE.primaryDark} />
                  <Text style={styles.leftLabel}>จับคู่กับ:</Text>
                  <Text style={styles.leftWord}>{current.left}</Text>
                </View>
              </View>
            </View>
          </View>
      
          {/* Scrollable options */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: vw(4), rowGap: vh(1.5) }} showsVerticalScrollIndicator={false}>
            {current.choices.map((c,i) => <Option key={`${current.id}-${i}`} label={c} i={i} />)}
          </ScrollView>

          <View style={styles.feedbackbox}>
            {selected !== null && (
              <Text
                style={[styles.feedback, selected === current.correctIndex ? styles.ok : styles.no,]}
                >
                {selected === current.correctIndex
                  ? "✓ ถูกต้อง"
                  : `✗ ผิด (คำตอบคือ ${current.choices[current.correctIndex]})`}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* RESULT */}
      {phase === "result" && (
        <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap:  (2) }}>
              <Icon name="flag-checkered" size={22} color={ORANGE.primaryDark} />
              <Text style={styles.resultTitle}>สรุปผล</Text>
            </View>
            <Text style={styles.resultScore}>ได้ {correctCount} / {questions.length} ข้อ</Text>
            <View style={styles.resultBar}>
              <View style={[styles.resultFill, { width: `${(correctCount/questions.length)*100}%` }]} />
            </View>
          </View>
          {/* <View style={styles.resultActionsCenter}>
            <PressableScale style={styles.secondaryBtn} onPress={startGame}>
              <Text style={styles.secondaryBtnText}>เล่นอีกครั้ง</Text>
            </PressableScale>
          </View> */}
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
      )}
    </View>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NEUTRAL.bg, paddingBottom: vh(5) },
  topbar: {
    paddingTop: 14, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: NEUTRAL.card, borderBottomWidth: 1, borderBottomColor: NEUTRAL.line,
  },
  topbarContent: { flexDirection: "row", alignItems: "center", alignSelf: "center", maxWidth: "92%" },
  topbarTitle: { fontSize: 26, fontWeight: "900", color: ORANGE.textMain, textAlign: "center", flexShrink: 1 },

  introWrap: { padding: 18, alignItems: "center" },
  introCard: {
    backgroundColor: NEUTRAL.card, borderRadius: 18, borderWidth: 2, borderColor: ORANGE.border,
    padding: 18, width: "100%", ...cardShadow,
  },
  introRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  introText: { fontSize: 18, color: ORANGE.textSub, flexShrink: 1, lineHeight: 26 },
  introActions: { marginTop: 14, gap: 10, alignItems: "center", width: "100%" },

  quizHeader: { paddingTop: vh(2), paddingHorizontal: vw(4), backgroundColor: NEUTRAL.card, borderBottomWidth: 0, borderBottomColor: NEUTRAL.line, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: vw(5) },
  timerPill: { backgroundColor: ORANGE.pale, borderWidth: 2, borderColor: ORANGE.border, paddingHorizontal: vw(4), paddingVertical: vh(1.2), borderRadius: vh(2), minWidth: vw(28), alignItems: "center" },
  timerLabel: { fontSize: vh(2), color: ORANGE.textSub, marginBottom: vh(0.4), fontWeight: "800" },
  timerValue: { fontSize: vh(1.8), fontWeight: "900", color: ORANGE.primaryDark },
  timerUrgent: { color: "#C81E1E" },
  quizTitlePill: { paddingHorizontal: vw(3), paddingVertical: vh(1.2), borderRadius: 30, backgroundColor: ORANGE.light, borderWidth: 2, borderColor: ORANGE.border },
  quizTitleInline: { fontSize: vh(1.8), fontWeight: "900", color: ORANGE.textMain },
  progressBox: { flex: 1, marginLeft: vw(2) },
  progressBar: { width: "100%", height: vh(1.2), backgroundColor: ORANGE.pale, borderRadius: 999, overflow: "hidden", paddingHorizontal: vw(0.5) },
  progressFill: { height: "100%", backgroundColor: ORANGE.primary, borderRadius: 999 },

CardWrap: {
  paddingTop: vh(1),
  paddingBottom: vh(2),
  paddingHorizontal: vw(4),
  backgroundColor: NEUTRAL.card,
  borderBottomWidth: 1,
  borderBottomColor: NEUTRAL.line,
  flexDirection: "column", 
  justifyContent: "center",
  alignItems: "center",
},
  leftCardWrap: { paddingHorizontal: vw(4), paddingTop: vh(1.5) },
  leftCard: { backgroundColor: NEUTRAL.card, borderRadius: vh(2), borderWidth: 2, borderColor: ORANGE.border, padding: vw(4), alignItems: "center", ...cardShadow },
  leftLabel: { fontSize: vh(2), color: ORANGE.textSub, fontWeight: "800" },
  leftWord: { fontSize: vh(2), color: ORANGE.textMain, fontWeight: "900" },
  option: { backgroundColor: NEUTRAL.card, borderWidth: 2, borderColor: "#E5E2DA", borderRadius: vh(2), paddingVertical: vh(2), paddingHorizontal: vw(4), justifyContent: "center", ...cardShadow },
  optionDisabled: { opacity: 0.95 },
  optionText: { fontSize: vh(2), fontWeight: "700", color: ORANGE.textSub, textAlign: "center" },
  correct: { backgroundColor: STATE.okBg, borderColor: STATE.okBd },
  correctText: { color: STATE.okTx },
  wrong: { backgroundColor: STATE.noBg, borderColor: STATE.noBd },
  wrongText: { color: STATE.noTx },
  
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
  primaryBtn: {
    backgroundColor: ORANGE.primary, paddingVertical: 15, paddingHorizontal: 15,
    borderRadius: 16, minWidth: 260, alignItems: "center", ...cardShadow,
    
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", letterSpacing: 0.3 },
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

  feedbackbox: {alignItems: "center"  },
  feedback: { marginTop: 10, fontSize: 20, fontWeight: "bold" },
  ok: { color: "green" },
  no: { color: 'red' },
});
