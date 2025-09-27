import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, SafeAreaView, ScrollView, Dimensions } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { post } from "../../api";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const AUTO_NEXT_DELAY = 1000;
// อิโมจิที่ใช้สุ่ม
const EMOJIS = ["🍎", "🐱", "🌟", "🏀", "🍩", "🚗", "🎵", "🦋", "🍓"];

// ฟังก์ชันสุ่มโจทย์
const generateQuestions = (numQuestions = 5) => {
  const qs = [];
  const usedNumbers = new Set();

  for (let i = 0; i < numQuestions; i++) {
    // เลือก number ที่ไม่ซ้ำ
    let number;
    do {
      number = Math.floor(Math.random() * 5) + 1; // 1–5
    } while (usedNumbers.has(number));
    usedNumbers.add(number);

    // เลือก emoji ของโจทย์
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    // ✅ สุ่ม choices จำนวน 4 ตัว โดยจำนวน emoji แต่ละช้อยส์ไม่ซ้ำ
    let counts = new Set();
    while (counts.size < 4) {
      counts.add(Math.floor(Math.random() * 5) + 1);
    }
    counts = Array.from(counts);

    // ✅ ใส่ number ของคำตอบที่ถูกต้องหากยังไม่มี
    if (!counts.includes(number)) {
      counts[Math.floor(Math.random() * counts.length)] = number;
    }

    // ✅ สร้างช้อยส์โดยใช้อิโมจิไม่ซ้ำกัน
    let choicesEmojis = new Set();
    while (choicesEmojis.size < 4) {
      const e = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      choicesEmojis.add(e);
    }
    choicesEmojis = Array.from(choicesEmojis);

    const choices = counts.map((c, index) => ({
      text: choicesEmojis[index].repeat(c),
      count: c,
      correct: c === number,
    }));

    qs.push({ number, emoji, choices });
  }

  return qs;
};


function ScoreScreen({ score, total, onRestart, SetScreen, navigation }) {
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
              <Text style={styles.topbarTitle}>จับคู่ตัวเลขกับจำนวนรูปภาพ</Text>
         </View>
      </View>
    {/* <View style={styles.card}>
      <Text style={styles.title}>🎉 เกมจบแล้ว 🎉</Text>
      <Text style={styles.subtitle}>คะแนน ({score} / {total})</Text>

      <TouchableOpacity style={styles.button} onPress={onRestart}>
        <Text style={styles.buttonText}>เล่นใหม่อีกครั้ง</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button1} onPress={SetScreen}>
        <Text style={styles.buttonText1}>กลับหน้าหลัก</Text>
      </TouchableOpacity>
    </View> */}
    <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: vw(2) }}>
              <Icon name="flag-checkered" size={22} color={ORANGE.primaryDark} />
              <Text style={styles.resultTitle}>สรุปผล</Text>
            </View>
            <Text style={styles.resultScore}>ได้ {score} / {total} ข้อ</Text>
            <View style={styles.resultBar}>
              <View style={[styles.resultFill, { width: `${(score/total)*100}%` }]} />
            </View>
          </View>
          {/* <View style={styles.resultActionsCenter}>
            <PressableScale style={styles.secondaryBtn} onPress={startGame}>
              <Text style={styles.secondaryBtnText}>เล่นอีกครั้ง</Text>
            </PressableScale>
          </View> */}
          <View style={styles.resultActionsCenter}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onRestart}>
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
    </>
  );
}

function IntroScreen({ onStart }) {
  // return (
  //   <ScrollView contentContainerStyle={styles.introWrap}>
  //     <View style={styles.introCard}>
  //       <View style={styles.introRow}>
  //         <Icon name="book-outline" size={28} color={ORANGE.primaryDark} />
  //         <Text style={styles.introText}>จับคู่ตัวเลขกับจำนวนรูปภาพ</Text>
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
              <Text style={styles.topbarTitle}>จับคู่ตัวเลขกับจำนวนรูปภาพ</Text>
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

export default function HomeScreen({ navigation, email }) {
  const [phase, setPhase] = useState("intro"); // intro | quiz | result
  const [selected, setSelected] = useState({});
  const [showScore, setShowScore] = useState(false);

  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [questions, setQuestions] = useState([]);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    setQuestions(generateQuestions()); // โหลดโจทย์ตอนเริ่ม
  }, []);

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
      const data = await 
      post({ 
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
    setQuestions(generateQuestions());
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
        navigation={navigation}
      />
    );
  }

    return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* 🔹 Topbar */}
      <View style={styles.topbar}>
        <View style={styles.topbarContent}>
          <Icon
            name="emoticon-outline"
            size={26}
            color={ORANGE.primaryDark}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.topbarTitle}>จับคู่ตัวเลขกับจำนวนรูปภาพ</Text>
        </View>
      </View>

      {/* 🔹 ScrollView + safe padding */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + vh(2) }} // ✅ เผื่อที่ข้างล่าง
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {questions.map((q, qIndex) => (
            <View key={qIndex} style={styles.card1}>
              <View style={styles.circle}>
                <Text style={styles.point}>{q.number}</Text>
              </View>

              {/* แถวแรก */}
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
                      <Text style={styles.choiceText}>{c.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* แถวสอง */}
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
                      <Text style={styles.choiceText}>{c.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

}

const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;
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
    borderRadius: 24,
    marginTop: height * 0.04,
    marginBottom: height * 0.17,
    // backgroundColor: "black"
  },
  // title: { 
  //   color: "#000", 
  //   fontSize: 25, 
  //   fontWeight: "900", 
  //   marginBottom: 20, 
  // },
  // subtitle1: { 
  //   color: "#000", 
  //   fontSize: 20, 
  //   fontWeight: "400", 
  //   marginBottom: 5, 
  // },
  // subtitle2: { 
  //   color: "#000", 
  //   fontSize: 20, 
  //   fontWeight: "400", 
  //   marginBottom: 30, 
  // },
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
    // marginTop: 50,
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
    // left: 5, 
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