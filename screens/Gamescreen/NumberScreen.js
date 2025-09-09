import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

function ScoreScreen({ score, total, onRestart, SetScreen }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>🎉 เกมจบแล้ว 🎉</Text>
      <Text style={styles.subtitle}>คะแนน ({score} / {total})</Text>

      <TouchableOpacity style={styles.button} onPress={onRestart}>
        <Text style={styles.buttonText}>เล่นใหม่อีกครั้ง</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button1} onPress={SetScreen}>
        <Text style={styles.buttonText1}>กลับหน้าหลัก</Text>
      </TouchableOpacity>
    </View>
  );
}

function IntroScreen({ onStart }) {
  // return (
  //   <ScrollView contentContainerStyle={styles.introWrap}>
  //     <View style={styles.introCard}>
  //       <View style={styles.introRow}>
  //         <Icon name="book-outline" size={28} color={ORANGE.primaryDark} />
  //         <Text style={styles.introText}>จับคู่ตัวเลขกับจำนวนรูปภาพที่ถูกต้อง</Text>
  //       </View>
  //       <View style={styles.introRow}>
  //         <Icon name="gesture-tap" size={28} color={ORANGE.primaryDark} />
  //         <Text style={styles.introText}>แตะตัวเลือกเพื่อตอบ</Text>
  //       </View>
  //     </View>

  //     <TouchableOpacity style={styles.primaryBtn} onPress={onStart}>
  //       <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
  //     </TouchableOpacity>
  //   </ScrollView>
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
              <TouchableOpacity style={styles.primaryBtn} onPress={onStart}>
                <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      );
}

export default function HomeScreen({ navigation }) {
  const [phase, setPhase] = useState("intro"); // intro | quiz | result
  const [selected, setSelected] = useState({});
  const [showScore, setShowScore] = useState(false);

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
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, index) => {
      if (q.choices[selected[index]]?.correct) score += 1;
    });
    return score;
  };

  const handleRestart = () => {
    setSelected({});
    setShowScore(false);
    setPhase("quiz");
  };

  const SetScreen = () => {
    navigation.navigate("MainTabs");
  };

  if (phase === "intro") {
    return <IntroScreen onStart={() => setPhase("quiz")} />;
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
  card: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingVertical: 20, 
  },
  title: { 
    color: "#000", 
    fontSize: 25, 
    fontWeight: "900", 
    marginBottom: 20, 
  },
  subtitle1: { 
    color: "#000", 
    fontSize: 20, 
    fontWeight: "400", 
    marginBottom: 5, 
  },
  subtitle2: { 
    color: "#000", 
    fontSize: 20, 
    fontWeight: "400", 
    marginBottom: 30, 
  },
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
  point: { 
    color: "#000", 
    fontSize: 25, 
    fontWeight: "900", 
  },
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
  image: { 
    width: "90%", 
    height: 60, 
  },
  subtitle: { 
    color: "#000", 
    fontSize: 20, 
    fontWeight: "400", 
    marginBottom: 30, 
  },
  button: {
    backgroundColor: "#fea468ff",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 0, 
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "500",
  },
  button1: {
    backgroundColor: "#ffffffff",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText1: {
    fontSize: 16,
    color: "#000000ff",
    fontWeight: "400",
  },

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
