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
  Dimensions
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");

export default function GamepictureScreen({navigation}) {
  const [screen, setScreen] = useState("home");
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5); // ⬅️ ย้ายขึ้นมาที่ top-level

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

  // ===== เริ่มเกม: สุ่ม 4 ข้อ =====
  const startGame = () => {
    setScore(0);
    const shuffled = shuffle(allQuestions).slice(0, 4);
    setGameQuestions(shuffled);
    setCurrentIndex(0);
    setTimeLeft(5); // reset timer
    setScreen("memory");
  };

  // ไปข้อถัดไป
  const nextQuestion = (isCorrect) => {
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    if (currentIndex + 1 < gameQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setTimeLeft(5); // reset timer
      setScreen("memory");
    } else {
      setScreen("score");
    }
  };

  // ใช้ effect จัดการ countdown timer เมื่ออยู่ใน memory screen
  useEffect(() => {
    if (screen === "memory") {
      if (timeLeft === 0) {
        setScreen("choice");
        return;
      }
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, screen]);

  /* ------------------------- Home ------------------------- */
  if (screen === "home") {
    // return (
    //   <View style={styles.container}>
    //     <Text style={styles.title}>เกมจำรูปภาพ</Text>
    //     <Text style={styles.subtitle}>สุ่มมาเล่น 4 ข้อ จากทั้งหมด 10 ข้อ</Text>
    //     <TouchableOpacity style={styles.button} onPress={startGame}>
    //       <Text style={styles.buttonText}>เริ่มเกม</Text>
    //     </TouchableOpacity>
    //   </View>
    // );
    return (
            <>
              <View style={styles.topbar}>
                <View style={styles.topbarContent}>
                  <Icon
                    name="emoticon-outline"
                    size={26}
                    color={ORANGE.primaryDark}
                    style={{ marginRight: 8 }}
                  />
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
                    <Text style={styles.introText}>จำตำแหน่งตัวการ์ตูนที่อยู่ในภาพ โดยมีเวลาในการจำ 5 วินาที แล้วเลือกคำตอบ</Text>
                  </View>
                  <View style={styles.introRow}>
                    <Icon name="gesture-tap" size={26} color={ORANGE.primaryDark} />
                    <Text style={styles.introText}>แตะเลือกรูปภาพที่ตำแหน่งตัวการ์ตูนตรงกับภาพที่ให้จำ</Text>
                  </View>
                  <View style={styles.introRow}>
                    <Icon name="check-circle-outline" size={26} color={ORANGE.okBd} />
                    <Text style={styles.introText}>ตอบถูก = กรอบ/พื้นหลังสีเขียว, ตอบผิด = กรอบ/พื้นหลังสีแดง </Text>
                  </View>
                </View>
      
                <View style={styles.introActions}>
                  <TouchableOpacity style={styles.primaryBtn} onPress={startGame}>
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
      }, 1200);
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
        <View style={styles.card}>
          <Text style={styles.title}>เลือกรูปที่ถูกต้อง</Text>
          <View style={styles.choicesContainer}>
            {question.choices.map((choice, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => selected === null && handleChoice(index)}
              >
                <Image
                  source={choice}
                  style={[
                    styles.choiceImg,
                    { borderColor: getBorderColor(index) },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ImageBackground>
    );
  }

  /* ------------------------- Score ------------------------- */
  if (screen === "score") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎉 จบเกมแล้ว 🎉</Text>
        <Text style={styles.scoreText}>
          ได้คะแนน {score} / {gameQuestions.length}
        </Text>
        <TouchableOpacity style={styles.button} onPress={startGame}>
          <Text style={styles.buttonText}>เล่นใหม่อีกครั้ง</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonOutline}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Text style={styles.buttonOutlineText}>กลับหน้าหลัก</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

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


/* ------------------------- Styles ------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 25, fontWeight: "800", marginBottom: 20 },
  subtitle: { fontSize: 18, marginBottom: 30 },
  button: {
    backgroundColor: "#fea468",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: { fontSize: 18, color: "#fff", fontWeight: "600" },
  buttonOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonOutlineText: { fontSize: 18, color: "#333" },
  card: {
    width: width * 0.9,
    minHeight: height * 0.55,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    alignSelf: "center",
    marginTop: height * 0.05,
    ...cardShadow,
  },
  timer: { fontSize: 20, color: "red", marginBottom: 10 },
  pic: { width: 280, height: 280, marginTop: 20 },
  choicesContainer: { alignItems: "center" },
  choiceImg: {
    width: 250,
    height: 200,
    margin: 10,
    borderWidth: 5,
    borderRadius: 15,
    marginTop: 10,
  },
  scoreText: { fontSize: 22, fontWeight: "600", marginBottom: 30 },

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

  primaryBtn: {
    backgroundColor: ORANGE.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    ...cardShadow,
  },
  primaryBtnText: { fontSize: 18, fontWeight: "600", color: "#fff" },


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
