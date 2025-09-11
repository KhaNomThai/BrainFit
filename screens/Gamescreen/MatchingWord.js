// screens/Gamescreen/Catchword.js
import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { post } from "../../api";

// ===== THEME =====
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

// หน่วงเวลาหลังเลือก (ms) เพื่อให้เห็นสีถูก/ผิดก่อนข้าม
const AUTO_NEXT_DELAY = 1000;

// ===== Helper =====
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const sampleN = (arr, n) => shuffle(arr).slice(0, n);

// กลุ่ม emoji ที่ “คล้ายกันเกินไป” จะถูกกันไม่ให้สุ่มมาเป็นตัวหลอก
const SIMILAR_GROUPS = [
  ["🏀","⚽","🏐","🎾","🏉","🥎","🏈","🏓","🏸"],
  ["🚗","🚙","🚕","🚓","🚚","🚛","🚜","🛻","🚒","🚑"],
  ["👕","👚","👗","🧥","👔","👖","👘"],
  ["🐝","🦋","🐞","🐜","🪲","🦟","🪰"],
  ["✈️","🚁","🚀","🛫","🛬"],
  ["📖","📚","📘","📕","📒"],
  ["⏰","⏱️","🕰️","⌛","⏳"],
  ["🛏️","🛌","🛋️"],
  ["🔨","🔧","🔩","🪓","🪛"],
  ["🍜","🍝","🍲","🥘"],
  ["🌊","⛲","💧","🏞️"],
];

// คืน set ของ emoji ที่ควรกันออกเพราะ “คล้าย” กับ target
const similarSetOf = (emoji) => {
  for (const group of SIMILAR_GROUPS) {
    if (group.includes(emoji)) return new Set(group);
  }
  return new Set([emoji]);
};

// คลัง emoji ทั่วไป (ใช้เป็นตัวหลอก “ข้ามหมวด”)
const DISTRACTOR_POOL = [
  "📱","🎧","🖥️","🧸","🍕","🍔","🍟","🌮","🍩","🍪",
  "🐶","🐱","🦊","🐼","🦄","🦈","🦑","🦀",
  "🌋","🏝️","🌈","☀️","🌙","⭐","🔥","❄️",
  "🎒","💼","💡","🔦","📷","🎲","🎯","🎹",
  "🚲","🛴","🛵","🚆","🚇","🚢",
  "🏰","⛩️","⛪","🏯","🏫","🏥",
  "🧂","🍯","🥫","🫙","🍶","🍳",
];

// ===== คลังคำทั้งหมด (ไม่ใช่ 10 ข้อ ยังไม่สุ่ม) =====
const FULL_BANK = [
  { word: "แอปเปิ้ล", correct: "🍎" },
  { word: "หมา", correct: "🐶" },
  { word: "พระอาทิตย์", correct: "☀️" },
  { word: "พิซซ่า", correct: "🍕" },
  { word: "วาฬ", correct: "🐋" },
  { word: "ภูเขา", correct: "⛰️" },
  { word: "กระทะ", correct: "🍳" },
  { word: "ห้องสมุด", correct: "📚" },
  // ไม่มี emoji มะละกอ → ใช้ 🥭 (แทนผลไม้โทนใกล้เคียง)
  { word: "มะละกอ", correct: "🥭" },
  { word: "เตียงนอน", correct: "🛏️" },
  { word: "ค้อน", correct: "🔨" },
  { word: "ชาวนา", correct: "👨‍🌾" },
  { word: "ตลาด", correct: "🛍️" },
  { word: "กระโปรง", correct: "👗" },
  { word: "น้ำตก", correct: "🌊" },
  { word: "ก๋วยเตี๋ยว", correct: "🍜" },
  { word: "นาฬิกา", correct: "⏰" },
  { word: "บาสเกตบอล", correct: "🏀" },
  { word: "กระเป๋า", correct: "👜" },
  { word: "กรรไกร", correct: "✂️" },
  { word: "ผีเสื้อ", correct: "🦋" },
  { word: "เครื่องบิน", correct: "✈️" },
  { word: "เครื่องปรุงรส", correct: "🧂" },
  { word: "รองเท้า", correct: "👟" },
  { word: "ปลาหมึก", correct: "🦑" },
  { word: "พยาบาล", correct: "👩‍⚕️" },
  { word: "แจกัน", correct: "🏺" },
  { word: "หมอน", correct: "🛏️" }, // ไม่มีหมอนเฉพาะ ใช้เตียง
  { word: "รถบรรทุก", correct: "🚚" },
  { word: "ไฟฉาย", correct: "🔦" },
  { word: "กวาง", correct: "🦌" },
  { word: "เสื้อ", correct: "👕" },
  { word: "นักเรียน", correct: "👩‍🎓" },
  { word: "วัด", correct: "⛩️" },
  { word: "ต้มยำกุ้ง", correct: "🍲" },
  { word: "จักรยาน", correct: "🚲" },
  { word: "ต้นไม้", correct: "🌳" },
  { word: "รถไฟ", correct: "🚆" },
  { word: "ปิงปอง", correct: "🏓" },
  { word: "หนังสือ", correct: "📖" },
  { word: "ตำรวจ", correct: "👮" },
  { word: "ผัก", correct: "🥦" },
];

// สร้างตัวเลือก 4 ตัว (ถูก 1 + หลอก 3) โดยกันของคล้ายเกินไป
function buildChoices(correct) {
  const ban = similarSetOf(correct);    // emoji ที่คล้าย (รวมตัวมันเอง)
  const pool = DISTRACTOR_POOL.filter((e) => !ban.has(e));
  const distractors = sampleN(pool, 3);
  return shuffle([correct, ...distractors]);
}

// สร้างคำถาม (word, correct, choices)
function buildQuestion(item) {
  return { ...item, choices: buildChoices(item.correct) };
}

// ===== Component =====
export default function Matchingword({ navigation, email }) {
  const [phase, setPhase] = useState("intro");

  // เลือก “10 ข้อแบบสุ่ม” ตอน mount + ผูก choices ให้เรียบร้อย
  const QUESTIONS = useMemo(
    () => shuffle(FULL_BANK).slice(0, 10).map(buildQuestion),
    []
  );

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const total = QUESTIONS.length;
  const q = QUESTIONS[index];
  const choices = q.choices; // สุ่มครั้งเดียวตอนสร้างคำถาม (ลดกระพริบ/สับสน)

  const saveResult = async () => {
    const data = await 
    post({ 
      action: "savegametime",
      email: email.trim(), 
      gameName: "เกมจับคู่คำกับอิโมจิ",
      playTime: elapsedTime,
      score: score,
      total: 0,
    });
  };

  const GameStartTime = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setPhase("quiz");
  };

  // เลือกคำตอบ
  const choose = (emoji) => {
    if (picked) return;
    const ok = emoji === q.correct;
    setPicked(emoji);
    setIsCorrect(ok);
    if (ok) setScore((s) => s + 1);

    setTimeout(() => {
      if (index < total - 1) {
        setIndex((i) => i + 1);
        setPicked(null);
        setIsCorrect(null);
      } else {
        const endTime = Date.now();
        const durationMs = endTime - startTime;
        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const playTime = parseFloat(`${minutes}.${seconds.toString().padStart(2, "0")}`);
        setElapsedTime(playTime.toFixed(2));
        setPhase("result");
      }
    }, AUTO_NEXT_DELAY);
  };

  useEffect(() => {
    if (phase === "result" && elapsedTime > 0) {
      saveResult();
    }
  }, [phase]);

  const restart = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setIndex(0);
    setScore(0);
    setPicked(null);
    setIsCorrect(null);
    setPhase("quiz");
  };

  return (
    <View style={styles.container}>
      {/* ===== TOPBAR ===== */}
      <View style={styles.topbar}>
        <View style={styles.topbarContent}>
          <Icon name="emoticon-outline" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
          <Text style={styles.topbarTitle}>เกมจับคู่คำกับ Emoji</Text>
        </View>
      </View>

      {/* ===== INTRO ===== */}
      {phase === "intro" && (
        <ScrollView contentContainerStyle={styles.introWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.introCard}>
            <View style={styles.introRow}>
              <Icon name="book-outline" size={26} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>
                อ่านคำศัพท์ตรงกลาง แล้วเลือก Emoji ที่ตรงกับคำนั้น
              </Text>
            </View>
            <View style={styles.introRow}>
              <Icon name="gesture-tap" size={26} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>แตะตัวเลือก Emoji เพื่อเลือกคำตอบ</Text>
            </View>
            <View style={styles.introRow}>
              <Icon name="check-circle-outline" size={26} color={"#1DBF73"} />
              <Text style={styles.introText}>ตอบถูก = กรอบ/พื้นหลังสีเขียว, ตอบผิด = สีแดง</Text>
            </View>
          </View>

          <View style={styles.introActions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={GameStartTime}>
              <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ===== QUIZ ===== */}
      {phase === "quiz" && (
        <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 20 }}>
          {/* Header badges */}
          <View style={styles.headerRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ข้อ {index + 1}/{total}</Text>
            </View>
            <View style={styles.badgeOutline}>
              <Text style={styles.badgeOutlineText}>คะแนน {score}</Text>
            </View>
          </View>

          {/* กล่องคำศัพท์ */}
          <View
            style={[
              styles.questionBox,
              picked && isCorrect === true && { borderColor: "#2ecc71", backgroundColor: "#d4f8e8" },
              picked && isCorrect === false && { borderColor: "#e74c3c", backgroundColor: "#ffe3e3" },
            ]}
          >
            <Text style={styles.word}>{q.word}</Text>
          </View>

          {/* ตัวเลือกอีโมจิ 2x2 */}
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
            <Text style={styles.resultScore}>ได้ {score} / {total} ข้อ</Text>
            <View style={styles.resultBar}>
              <View style={[styles.resultFill, { width: `${(score / total) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.resultActionsCenter}>
            {/* <TouchableOpacity style={styles.secondaryBtn} onPress={() => setPhase("intro")}>
              <Text style={styles.secondaryBtnText}>กลับหน้าเริ่ม</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.primaryBtn} onPress={restart}>
              <Text style={styles.primaryBtnText}>เล่นอีกครั้ง (สุ่มใหม่)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: "#8e8e8e" }]}
              onPress={() => navigation?.goBack?.()}
            >
              <Text style={styles.primaryBtnText}>กลับเมนูเกม</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

/* ===== Styles (เหมือนเดิม) ===== */
const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  android: { elevation: 2 },
  default: {},
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NEUTRAL.bg },
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
  primaryBtn: {
    backgroundColor: ORANGE.primary, paddingVertical: 18, paddingHorizontal: 26,
    borderRadius: 14, minWidth: 240, alignItems: "center", ...cardShadow,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  headerRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  badge: { backgroundColor: ORANGE.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  badgeOutline: { borderWidth: 2, borderColor: ORANGE.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  badgeOutlineText: { color: ORANGE.primary, fontWeight: "700", fontSize: 16 },
  questionBox: {
    borderWidth: 3, borderColor: ORANGE.primary, borderRadius: 16,
    padding: 20, marginTop: 16, marginBottom: 20, backgroundColor: "#fff", width: "100%", alignItems: "center",
  },
  word: { fontSize: 42, fontWeight: "800", color: "#222", textAlign: "center" },
  choicesGrid: {
    width: "90%", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 20,
  },
  choice: {
    width: "44%", aspectRatio: 1, borderRadius: 20, justifyContent: "center", alignItems: "center",
    backgroundColor: "#f2f2f2", margin: 8, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  choiceEmoji: { fontSize: 40, textAlign: "center" },
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
  secondaryBtn: {
    backgroundColor: ORANGE.light, paddingVertical: 16, paddingHorizontal: 22,
    borderRadius: 14, minWidth: 200, alignItems: "center",
    borderWidth: 2, borderColor: ORANGE.border, ...cardShadow,
  },
  secondaryBtnText: { color: ORANGE.textMain, fontSize: 18, fontWeight: "900" },
});
