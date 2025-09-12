import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView, ImageBackground } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { post } from "../../api";

const AUTO_NEXT_DELAY = 1000;

/* ---------------------- Result Screen (UI ใหม่) ---------------------- */
function ScoreScreen({ score, total, onRestart, SetScreen }) {
  return (
    <View style={styles.resultWrap}>
      <View style={styles.resultCard}>
        <Icon name="trophy" size={40} color={ORANGE.primaryDark} style={{ marginBottom: 12 }} />
        <Text style={styles.resultTitle}>เกมจบแล้ว!</Text>
        <Text style={styles.resultScore}>{score} / {total}</Text>

        <View style={styles.resultActions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={onRestart} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>เล่นใหม่อีกครั้ง</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={SetScreen} activeOpacity={0.9}>
            <Text style={styles.secondaryBtnText}>กลับหน้าหลัก</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ---------------------- Intro Screen (สไตล์การ์ดโทนส้ม) ---------------------- */
function IntroScreen({ onStart }) {
  return (
    <>
      <View className="topbar" style={styles.topbar}>
        <View style={styles.topbarContent}>
          <Icon name="emoticon-outline" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
          <Text style={styles.topbarTitle}>จับคู่ตัวเลขกับจำนวนรูปภาพที่ถูกต้อง</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.introWrap} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <View style={styles.introRow}>
            <Icon name="book-outline" size={26} color={ORANGE.primaryDark} />
            <Text style={styles.introText}>ดูตัวเลขที่กำหนดให้แล้วเลือกรูปที่มีจำนวนเท่ากับตัวเลข</Text>
          </View>
          <View style={styles.introRow}>
            <Icon name="gesture-tap" size={26} color={ORANGE.primaryDark} />
            <Text style={styles.introText}>แตะตัวเลือก เพื่อเลือกคำตอบ</Text>
          </View>
          <View style={styles.introRow}>
            <Icon name="check-circle-outline" size={26} color={ORANGE.okBd} />
            <Text style={styles.introText}>ตอบถูก = กรอบ/พื้นหลังสีเขียว, ตอบผิด = กรอบ/พื้นหลังสีแดง</Text>
          </View>
        </View>

        <View style={styles.introActions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={onStart} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

/* ---------------------- Main Game Screen ---------------------- */
export default function HomeScreen({ navigation, email }) {
  const [phase, setPhase] = useState("intro"); // intro | quiz | result
  const [selected, setSelected] = useState({});
  const [showScore, setShowScore] = useState(false);

  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const questions = [
    {
      number: 3,
      choices: [
        { image: require("../../assets/3_4.png"), correct: false },
        { image: require("../../assets/3_2.png"), correct: false },
        { image: require("../../assets/3_3.png"), correct: true },
        { image: require("../../assets/3_5.png"), correct: false },
      ],
    },
    {
      number: 1,
      choices: [
        { image: require("../../assets/1_3.png"), correct: false },
        { image: require("../../assets/1_2.png"), correct: false },
        { image: require("../../assets/1_1.png"), correct: true },
        { image: require("../../assets/1_4.png"), correct: false },
      ],
    },
    {
      number: 5,
      choices: [
        { image: require("../../assets/3_2.png"), correct: false },
        { image: require("../../assets/3_3.png"), correct: false },
        { image: require("../../assets/1_4.png"), correct: false },
        { image: require("../../assets/3_5.png"), correct: true },
      ],
    },
    {
      number: 4,
      choices: [
        { image: require("../../assets/3_4.png"), correct: true },
        { image: require("../../assets/1_3.png"), correct: false },
        { image: require("../../assets/3_2.png"), correct: false },
        { image: require("../../assets/3_5.png"), correct: false },
      ],
    },
    {
      number: 2,
      choices: [
        { image: require("../../assets/3_3.png"), correct: false },
        { image: require("../../assets/3_4.png"), correct: false },
        { image: require("../../assets/3_5.png"), correct: false },
        { image: require("../../assets/3_2.png"), correct: true },
      ],
    },
  ];

  const handleChoice = (qIndex, cIndex) => {
    setSelected({ ...selected, [qIndex]: cIndex });
    if (Object.keys(selected).length + 1 === questions.length) {
      setShowScore(true);
      setPhase("result");
    }
    setTimeout(() => {
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      const totalSeconds = Math.floor(durationMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const playTime = parseFloat(`${minutes}.${seconds.toString().padStart(2, "0")}`);
      setElapsedTime(playTime.toFixed(2));
    }, AUTO_NEXT_DELAY);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, index) => {
      if (q.choices[selected[index]]?.correct) score += 1;
    });
    return score;
  };

  const saveResult = async () => {
    const data = await post({
      action: "savegametime",
      email: email.trim(),
      gameName: "เกมจับคู่จำนวนกับภาพ",
      playTime: elapsedTime,
      score: calculateScore(),
      total: 0,
    });
  };

  const handleRestart = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setSelected({});
    setShowScore(false);
    setPhase("quiz");
  };

  useEffect(() => {
    if (phase === "result" && elapsedTime > 0) {
      saveResult();
    }
  }, [phase]);

  const SetScreen = () => {
    navigation.navigate("MainTabs");
  };

  const startGame = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setPhase("quiz");
  };

  if (phase === "intro") {
    return <IntroScreen onStart={startGame} />;
  }

  if (phase === "result") {
    return (
      <ScoreScreen
        score={calculateScore()}
        total={questions.length}
        onRestart={handleRestart}
        SetScreen={SetScreen}
      />
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>เกมจับคู่จำนวนกับภาพ</Text>
      <Text style={styles.subtitle1}>จับคู่ตัวเลขกับ</Text>
      <Text style={styles.subtitle2}>จำนวนรูปภาพที่ถูกต้อง</Text>

      {questions.map((q, qIndex) => (
        <View key={qIndex} style={styles.card1}>
          <View style={styles.circle}>
            <Text style={styles.point}>{q.number}</Text>
          </View>

          <View style={styles.choicesRow}>
            {q.choices.slice(0, 2).map((c, cIndex) => {
              const isSelected = selected[qIndex] === cIndex;
              let borderColor = "#fff";
              if (selected[qIndex] !== undefined) {
                if (c.correct) borderColor = "green";
                else if (isSelected) borderColor = "red";
              }
              return (
                <TouchableOpacity
                  key={cIndex}
                  style={[styles.choice, { borderWidth: 3, borderColor }]}
                  onPress={() => handleChoice(qIndex, cIndex)}
                  disabled={selected[qIndex] !== undefined}
                >
                  <Image source={c.image} style={styles.image} resizeMode="contain" />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.choicesRow}>
            {q.choices.slice(2, 4).map((c, cIndex) => {
              const realIndex = cIndex + 2;
              const isSelected = selected[qIndex] === realIndex;
              let borderColor = "#fff";
              if (selected[qIndex] !== undefined) {
                if (c.correct) borderColor = "green";
                else if (isSelected) borderColor = "red";
              }
              return (
                <TouchableOpacity
                  key={realIndex}
                  style={[styles.choice, { borderWidth: 3, borderColor }]}
                  onPress={() => handleChoice(qIndex, realIndex)}
                  disabled={selected[qIndex] !== undefined}
                >
                  <Image source={c.image} style={styles.image} resizeMode="contain" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

/* ---------------------- Theme & Styles ---------------------- */
const ORANGE = {
  primary: "#FF8A1F",
  primaryDark: "#E67700",
  light: "#FFE7CC",
  pale: "#FFF6EC",
  border: "#FFD2A3",
  textMain: "#1F1300",
  textSub: "#4A3726",
  okBd: "#1DBF73",
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
  /* Quiz screen container */
  card: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: NEUTRAL.bg,
  },
  title: { color: "#000", fontSize: 25, fontWeight: "900", marginBottom: 20 },
  subtitle1: { color: "#000", fontSize: 20, fontWeight: "400", marginBottom: 5 },
  subtitle2: { color: "#000", fontSize: 20, fontWeight: "400", marginBottom: 30 },

  card1: {
    width: 330,
    height: 120,
    justifyContent: "center",
    position: "relative",
    borderRadius: 20,
    backgroundColor: "#fdcc9fff",
    alignItems: "center",
    padding: 20,
    alignSelf: "center",
    marginBottom: 20,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 100,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: -35,
    top: "75%",
    transform: [{ translateY: -30 }],
  },
  point: { color: "#000", fontSize: 25, fontWeight: "900" },

  choicesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    left: 5,
    marginBottom: 5,
    marginTop: 5,
  },
  choice: {
    width: 130,
    height: 45,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "90%", height: 60 },

  /* Buttons (shared) */
  primaryBtn: {
    backgroundColor: ORANGE.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    ...cardShadow,
  },
  primaryBtnText: { fontSize: 18, fontWeight: "600", color: "#fff" },

  /* Intro */
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

  introWrap: { padding: 18, alignItems: "center", backgroundColor: NEUTRAL.bg },
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

  /* Result (new) */
  resultWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NEUTRAL.bg,
    padding: 20,
  },
  resultCard: {
    backgroundColor: NEUTRAL.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: ORANGE.border,
    padding: 24,
    alignItems: "center",
    width: "90%",
    ...cardShadow,
  },
  resultTitle: { fontSize: 24, fontWeight: "800", color: ORANGE.textMain, marginBottom: 6 },
  resultScore: { fontSize: 28, fontWeight: "900", color: ORANGE.primaryDark, marginBottom: 20 },
  resultActions: { width: "100%", gap: 12, marginTop: 10 },
  secondaryBtn: {
    borderWidth: 2,
    borderColor: ORANGE.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryBtnText: { fontSize: 16, fontWeight: "600", color: ORANGE.primary },
});
