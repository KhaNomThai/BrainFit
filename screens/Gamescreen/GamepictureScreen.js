import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { post } from "../../api";

const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;
const AUTO_NEXT_DELAY = 1000;

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

export default function GamepictureScreen({ navigation, email }) {
  const [screen, setScreen] = useState("home"); // home | memory | choice | score
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5);

  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // ===== โจทย์ทั้งหมด 10 ข้อ =====
  const allQuestions = [
    { id: 1, memoryImg: require("../../assets/pic1.png"), choices: [require("../../assets/choice1_1.png"), require("../../assets/pic1.png"), require("../../assets/choice1_3.png")], answer: 1 },
    { id: 2, memoryImg: require("../../assets/pic2.png"), choices: [require("../../assets/choice2_1.png"), require("../../assets/choice2_2.png"), require("../../assets/pic2.png")], answer: 2 },
    { id: 3, memoryImg: require("../../assets/pic3.png"), choices: [require("../../assets/pic3.png"), require("../../assets/choice3_2.png"), require("../../assets/choice3_3.png")], answer: 0 },
    { id: 4, memoryImg: require("../../assets/pic4.png"), choices: [require("../../assets/choice4_1.png"), require("../../assets/pic4.png"), require("../../assets/choice4_3.png")], answer: 1 },
    { id: 5, memoryImg: require("../../assets/pic5.png"), choices: [require("../../assets/pic5.png"), require("../../assets/choice5_2.png"), require("../../assets/choice5_3.png")], answer: 0 },
    { id: 6, memoryImg: require("../../assets/pic6.png"), choices: [require("../../assets/choice6_1.png"), require("../../assets/choice6_2.png"), require("../../assets/pic6.png")], answer: 2 },
    { id: 7, memoryImg: require("../../assets/pic7.png"), choices: [require("../../assets/choice7_1.png"), require("../../assets/pic7.png"), require("../../assets/choice7_3.png")], answer: 1 },
    { id: 8, memoryImg: require("../../assets/pic8.png"), choices: [require("../../assets/choice8_1.png"), require("../../assets/choice8_2.png"), require("../../assets/pic8.png")], answer: 2 },
    { id: 9, memoryImg: require("../../assets/pic9.png"), choices: [require("../../assets/choice9_1.png"), require("../../assets/pic9.png"), require("../../assets/choice9_3.png")], answer: 1 },
    { id: 10, memoryImg: require("../../assets/pic10.png"), choices: [require("../../assets/pic10.png"), require("../../assets/choice10_2.png"), require("../../assets/choice10_3.png")], answer: 0 },
  ];

  // ฟังก์ชันสลับลำดับ array
  function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  const saveResult = async () => {
    try {
      await post({
        action: "savegametime",
        email: email?.trim?.() ?? "",
        gameName: "เกมจำภาพ",
        playTime: elapsedTime,
        score,
        total: 0,
      });
    } catch (e) {
      // เงียบไว้ก่อน / หรือจะแจ้งเตือนก็ได้
    }
  };

  // เริ่มเกม: สุ่ม 4 ข้อ
  const startGame = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setScore(0);
    const shuffled = shuffle(allQuestions).slice(0, 4);
    setGameQuestions(shuffled);
    setCurrentIndex(0);
    setTimeLeft(5);
    setSelected(null);
    setScreen("memory");
  };

  const nextQuestion = (isCorrect) => {
    if (isCorrect) setScore((prev) => prev + 1);

    if (currentIndex + 1 < gameQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setTimeLeft(5);
      setScreen("memory");
    } else {
      setScreen("score");
      saveResult();
    }
  };

  // จัดการ countdown ตอนหน้า memory
  useEffect(() => {
    if (screen !== "memory") return;
    if (timeLeft === 0) {
      setScreen("choice");
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, screen]);

  /* ------------------------- Home ------------------------- */
  if (screen === "home") {
    return (
      <>
        <View style={styles.topbar}>
          <View style={styles.topbarContent}>
            <Icon name="emoticon-outline" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
            <Text style={styles.topbarTitle}>เกมจำรูปภาพ</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.introWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.introCard}>
            <View style={styles.introRow}>
              <Icon name="book-outline" size={26} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>สุ่มมาเล่น 4 ข้อ จากทั้งหมด 10 ข้อ</Text>
            </View>
            <View style={styles.introRow}>
              <Icon name="timer-outline" size={26} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>จำตำแหน่งตัวการ์ตูนที่อยู่ในภาพ มีเวลา 5 วินาที แล้วเลือกคำตอบ</Text>
            </View>
            <View style={styles.introRow}>
              <Icon name="gesture-tap" size={26} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>แตะเลือกรูปภาพที่ตำแหน่งตัวการ์ตูนตรงกับภาพที่ให้จำ</Text>
            </View>
            <View style={styles.introRow}>
              <Icon name="check-circle-outline" size={26} color={ORANGE.okBd} />
              <Text style={styles.introText}>ตอบถูก = กรอบ/พื้นหลังสีเขียว, ตอบผิด = กรอบ/พื้นหลังสีแดง</Text>
            </View>
          </View>

          <View style={styles.introActions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={startGame} activeOpacity={0.9}>
              <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </>
    );
  }

  /* ------------------------- Memory ------------------------- */
  if (screen === "memory") {
    const question = gameQuestions[currentIndex];
    if (!question) return null;

    return (
      <ImageBackground style={{ flex: 1 }}>
        <View style={styles.topbar}>
          <View style={styles.topbarContent}>
            <Icon name="emoticon-outline" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
            <Text style={styles.topbarTitle}>เกมจำรูปภาพ</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>จำรูปนี้ให้ดี</Text>
          <Text style={styles.timer}>เหลือเวลา {timeLeft} วิ</Text>
          <Image source={question.memoryImg} style={styles.pic} resizeMode="contain" />
        </View>
      </ImageBackground>
    );
  }

  /* ------------------------- Choice ------------------------- */
  if (screen === "choice") {
    const question = gameQuestions[currentIndex];

    const handleChoice = (index) => {
      setSelected(index);
      const isCorrect = index === question.answer;

      setTimeout(() => {
        nextQuestion(isCorrect);
        const endTime = Date.now();
        const durationMs = endTime - startTime;
        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const playTime = parseFloat(`${minutes}.${seconds.toString().padStart(2, "0")}`);
        setElapsedTime(playTime.toFixed(2));
      }, AUTO_NEXT_DELAY);
    };

    const getBorderColor = (index) => {
      if (selected === null) return "transparent";
      if (index === question.answer && index === selected) return "green";
      if (index === selected && index !== question.answer) return "red";
      if (index === question.answer) return "green";
      return "transparent";
    };

    return (
      <ImageBackground style={{ flex: 1 }}>
        <View style={styles.topbar}>
          <View style={styles.topbarContent}>
            <Icon name="emoticon-outline" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
            <Text style={styles.topbarTitle}>เกมจำรูปภาพ</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>เลือกรูปที่ถูกต้อง</Text>
          <View style={styles.choicesContainer}>
            {question.choices.map((choice, index) => (
              <TouchableOpacity key={index} onPress={() => selected === null && handleChoice(index)}>
                <Image source={choice} style={[styles.choiceImg, { borderColor: getBorderColor(index) }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ImageBackground>
    );
  }

  /* ------------------------- Score (UI โทนส้ม + การ์ด) ------------------------- */
  if (screen === "score") {
    return (
      <><View style={styles.topbar}>
          <View style={styles.topbarContent}>
            <Icon name="emoticon-outline" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
            <Text style={styles.topbarTitle}>เกมจำรูปภาพ</Text>
          </View>
        </View>
      <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: vw(2) }}>
              <Icon name="flag-checkered" size={22} color={ORANGE.primaryDark} />
              <Text style={styles.resultTitle}>สรุปผล</Text>
            </View>
            <Text style={styles.resultScore}>ได้ {score} / {gameQuestions.length} ข้อ</Text>
            <View style={styles.resultBar}>
              <View style={[styles.resultFill, { width: `${(score/gameQuestions.length)*100}%` }]} />
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

      
      
      {/* <View style={styles.resultWrap}>
        <View style={styles.resultCard}>
          <Icon name="trophy" size={40} color={ORANGE.primaryDark} style={{ marginBottom: 12 }} />
          <Text style={styles.resultTitle}>เกมจบแล้ว!</Text>
          <Text style={styles.resultScore}>{score} / {gameQuestions.length}</Text>

          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={startGame} activeOpacity={0.9}>
              <Text style={styles.primaryBtnText}>เล่นใหม่อีกครั้ง</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate("MainTabs")}
              activeOpacity={0.9}
            >
              <Text style={styles.secondaryBtnText}>กลับหน้าหลัก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View> */}
      </>
    );
  }

  return null;
}

/* ------------------------- Styles ------------------------- */
const styles = StyleSheet.create({
  // Quiz card (memory/choice)
  card: {
    width: width * 0.9,
    minHeight: height * 0.55,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    alignSelf: "center",
    marginTop: height * 0.02,
    ...cardShadow,
  },
  title: { fontSize: 25, fontWeight: "800", marginBottom: 12, color: ORANGE.textMain },
  timer: { fontSize: 18, color: "#E03131", marginBottom: 10 },
  pic: { width: 280, height: 280, marginTop: 10 },

  choicesContainer: { alignItems: "center" },
  choiceImg: {
    width: width * 0.6,
    height: height * 0.2,
    resizeMode: "contain",
    margin: 10,
    borderWidth: 5,
    borderRadius: 15,
    marginTop: 10,
  },

  // Topbar + Intro
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

  // Shared primary button
  primaryBtn: {
    backgroundColor: ORANGE.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    ...cardShadow,
  },
  primaryBtnText: { fontSize: 18, fontWeight: "600", color: "#fff" },

  // Result screen
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
});
