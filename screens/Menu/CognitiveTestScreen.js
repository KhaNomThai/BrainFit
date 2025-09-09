import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Platform,
  BackHandler, Alert, SafeAreaView, StatusBar,
} from "react-native";
import { post, isEmail } from "../../api";

export default function CognitiveTestScreen({ navigation, email, setEmail }) {
  /** ----------------------- State หลักของหน้า ----------------------- */
  // ลำดับ flow: intro → Quiz_1 → Quiz_2 → Quiz_3 → Quiz_4_1 → Quiz_4_2 → Quiz_4_3 → Quiz_4_4 → Quiz_5_1 → Quiz_5_2 → Quiz_5_3 → Quiz_5_4 → q6_read → q6_answer → review
  const [step, setStep] = useState("intro");

  // ใช้ roundId เพื่อ "สุ่มชุดโจทย์ใหม่" เมื่อกดทำอีกรอบ
  const [roundId, setRoundId] = useState(0);

  // เวลาอ้างอิงของ "รอบนี้" (ตรึงตอนเริ่มรอบ เพื่อความยุติธรรม)
  const [now, setNow] = useState(new Date());
  const currentYear = now.getFullYear(); 
  const currentMonthIdx = now.getMonth() + 1; // 1-12
  const currentHour24 = now.getHours(); // 0-23

  // เก็บคำตอบของผู้ทำแบบทดสอบ
  const [answers, setAnswers] = useState({
    Quiz_1: "",
    Quiz_2: "",
    Quiz_3: "",
    Quiz_4_1: "",
    Quiz_4_2: "",
    Quiz_4_3: "",
    Quiz_4_4: "",
    Quiz_5_1: "",
    Quiz_5_2: "",
    Quiz_5_3: "",
    Quiz_5_4: "",
    Quiz6_Name: "",
    Quiz6_Surname: "",
    Quiz6_Number: "",
    Quiz6_Street: "",
    Quiz6_Province: "",
  });

  

  // สรุปคะแนนแยกรายข้อ + รวม + ระดับผล
  const [scores, setScores] = useState({ Quiz_1: 0, Quiz_2: 0, Quiz_3: 0, q4: 0, q5: 0, q6: 0 });
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState("");

  /** ----------------------- Utilities / Helpers ----------------------- */
  // แผนที่ชื่อเดือน (ไทย/อังกฤษ/ตัวย่อ/เลข 1-12) → ลำดับเดือน 1..12
  const monthMaps = useMemo(() => {
    const map = new Map();
    const th = [
      "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
      "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
    ];
    const thAbbr = [
      "ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
      "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.",
    ];
    const en = [
      "january","february","march","april","may","june",
      "july","august","september","october","november","december",
    ];
    const enAbbr = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    for (let i = 0; i < 12; i++) {
      const idx = i + 1;
      map.set(th[i].toLowerCase(), idx);
      map.set(thAbbr[i].toLowerCase(), idx);
      map.set(en[i].toLowerCase(), idx);
      map.set(enAbbr[i].toLowerCase(), idx);
      map.set(String(idx), idx); // รับเป็นเลข 1..12 ด้วย
    }
    return map;
  }, []);
  const monthNamesTh = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
  ];

  // ฟังก์ชันช่วยทำความสะอาด input
  const normalize = (s) => (s ?? "").toString().trim().toLowerCase().replace(/\s+/g, " ");
  const normalizeNumber = (s) => normalize(s).replace(/[^\d]/g, "");
  const parseMonthToNumber = (input) => monthMaps.get(normalize(input)) ?? null;

  // ข้อ 3: รับได้ทั้ง 0–23 หรือ 1–12 (ตีความเป็นชั่วโมงเดิม/หรือ +12)
  const parseHourGuess = (input) => {
    const n = parseInt(normalizeNumber(input), 10);
    if (isNaN(n)) return null;
    if (n >= 0 && n <= 23) return n;
    if (n >= 1 && n <= 12) return [n % 24, (n + 12) % 24];
    return null;
  };

  /** ----------------------- สุ่มโจทย์ ข้อ 4/5 (เปลี่ยนทุกครั้งที่ roundId เปลี่ยน) ----------------------- */
  // ข้อ 4: สุ่มเลข (x, x+2) → คำตอบ = x+1
  const q4Qs = useMemo(() => {
    const items = [];
    for (let i = 0; i < 4; i++) {
      const start = Math.floor(Math.random() * 18) + 1; // 1..18
      items.push({ Min: start, Max: start + 2, Answer: start + 1 });
    }
    return items;
  }, [roundId]);

  // ข้อ 5: สุ่มเดือน (m, m+2) วนปี → คำตอบ = m+1 (แบบ modulo 12)
  const q5Qs = useMemo(() => {
    const wrap = (n) => ((n - 1) % 12 + 12) % 12 + 1; // คืนค่าเป็น 1..12
    const items = [];
    for (let i = 0; i < 4; i++) {
      const start = Math.floor(Math.random() * 12) + 1; // 1..12
      items.push({ Min: start, Max: wrap(start + 2), Answer: wrap(start + 1) });
    }
    return items;
  }, [roundId]);

  /** ----------------------- ฟังก์ชันให้คะแนน ----------------------- */
  // ข้อ 1: รองรับทั้ง ค.ศ./พ.ศ. (ตรวจจับคำ: พ.ศ./พศ/พุทธศักราช/B.E./คริสต์ศักราช/ค.ศ./AD/CE)
  const scoreQuiz_1 = (ans) => {
    const s = normalize(ans);
    const nRaw = parseInt(normalizeNumber(ans), 10);
    if (isNaN(nRaw)) return 4;

    const isBE = /พ\.?\s?ศ|พุทธศักราช|b\.?\s*e\.?/i.test(s);
    const isAD = /ค\.?\s?ศ|คริสต์ศักราช|a\.?\s*d\.?|c\.?\s*e\.?/i.test(s);
    let yearAD = nRaw;
    if (isBE) {
      yearAD = nRaw - 543;
    } else if (!isAD && nRaw >= 2400) {
      // ไม่ได้ระบุศักราช แต่ตัวเลขสูง (เช่น 2568) → ตีเป็น พ.ศ.
      yearAD = nRaw - 543;
    }
    return yearAD === currentYear ? 0 : 4;
  };

  // ข้อ 2: เดือนปัจจุบันตรง = 0 แต้ม, ผิด = 3 แต้ม
  const scoreQuiz_2 = (ans) => (parseMonthToNumber(ans) === currentMonthIdx ? 0 : 3);

  // ข้อ 3: ชั่วโมงตอบถูกภายใน ±1 ชม. = 0 แต้ม, ผิด = 3 แต้ม
  const scoreQuiz_3 = (ans) => {
    const guess = parseHourGuess(ans);
    if (guess == null) return 3;
    const inRange = (h) => Math.abs(h - currentHour24) <= 1;
    if (Array.isArray(guess)) return inRange(guess[0]) || inRange(guess[1]) ? 0 : 3;
    return inRange(guess) ? 0 : 3;
  };

  // ข้อ 4/5: รวมผิด 0 → 0 แต้ม, ผิด 1 → 2 แต้ม, ผิด ≥ 2 → 4 แต้ม
  const scoreQ4 = (ansList) => {
    let errors = 0;
    q4Qs.forEach((q, idx) => {
      if (normalizeNumber(ansList[idx]) !== String(q.Answer)) errors++;
    });
    return errors === 0 ? 0 : errors === 1 ? 2 : 4;
  };

  const scoreQ5 = (ansList) => {
    let errors = 0;
    q5Qs.forEach((q, idx) => {
      if (parseMonthToNumber(ansList[idx]) !== q.Answer) errors++;
    });
    return errors === 0 ? 0 : errors === 1 ? 2 : 4;
  };

  // ข้อ 6: ผิด k ช่อง = k * 2 คะแนน (0/2/4/6/8/10)
  const scoreQ6 = ({ name, surname, number, street, province }) => {
    let errors = 0;
    if (normalize(name) !== "สมหมาย") errors++;
    if (normalize(surname) !== "ยืนคง") errors++;
    if (normalizeNumber(number) !== "27") errors++;
    if (normalize(street) !== "ศรีอุทัย") errors++;
    if (normalize(province) !== "สุพรรณบุรี") errors++;
    return errors * 2;
  };

  // สรุประดับตามคะแนนรวม
  const getLevel = (sum) => {
    if (sum <= 7) return "ปกติ";
    if (sum <= 9) return "ความบกพร่องทางสติปัญญาเล็กน้อย";
    return "ความบกพร่องทางสติปัญญาอย่างมีนัยสำคัญ";
  };

  /** ----------------------- ส่งคำตอบ + บันทึกผลลง Firestore ----------------------- */
  const handleSubmit = async () => {
  // คำนวณคะแนนทุกข้อ
  const newScores = { Sum_Quiz_1, Sum_Quiz_2, Sum_Quiz_3, Sum_Quiz_4, Sum_Quiz_5, Sum_Quiz_6 };
  const sum = Sum_Quiz_1 + Sum_Quiz_2 + Sum_Quiz_3 + Sum_Quiz_4 + Sum_Quiz_5 + Sum_Quiz_6;
  const lvl = getLevel(sum);
  setScores(newScores);
  setTotal(sum);
  setLevel(lvl);

  try {
    const nowISO = new Date().toISOString();
    // ส่งข้อมูลไป Google Sheet
    const data = await post({
      action: "registerCognitiveTest",
      email: email,
      roundId,
      answers,
      scores: newScores,
      totalScore: sum,
      level: lvl,
      takenAtDeviceTime: nowISO,
      q4Generated: q4Qs,
      q5Generated: q5Qs,
      

    });

    if (data?.success) {
      // ไปหน้าสรุปผล (review) ทันที
      setStep("review");
    } else {
      throw new Error(data?.message ?? "ไม่สามารถบันทึกข้อมูลไป Google Sheet ได้");
    }
  } catch (error) {
    Alert.alert("เกิดข้อผิดพลาด", String(error?.message ?? error));
  }
};

  const Sum_Quiz_1 = scoreQuiz_1(answers.Quiz_1);
  const Sum_Quiz_2 = scoreQuiz_2(answers.Quiz_2);
  const Sum_Quiz_3 = scoreQuiz_3(answers.Quiz_3);
  const Sum_Quiz_4 = scoreQ4([answers.Quiz_4_1, answers.Quiz_4_2, answers.Quiz_4_3, answers.Quiz_4_4]);
  const Sum_Quiz_5 = scoreQ5([answers.Quiz_5_1, answers.Quiz_5_2, answers.Quiz_5_3, answers.Quiz_5_4]);
  const Sum_Quiz_6 = scoreQ6({
    name: answers.Quiz6_Name,
    surname: answers.Quiz6_Surname,
    number: answers.Quiz6_Number,
    street: answers.Quiz6_Street,
    province: answers.Quiz6_Province,
  });

  /** ----------------------- กันปุ่ม Back (Android) ตอนอยู่ขั้น q6_* ----------------------- */
  useEffect(() => {
    const blockBack = () => {
      if (step === "q6_read" || step === "q6_answer") return true; // block back
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", blockBack);
    return () => sub.remove();
  }, [step]);

  /** ----------------------- การนำทางระหว่างขั้นตอน + Progress ----------------------- */
  const steps = [
    "intro","Quiz_1","Quiz_2","Quiz_3","Quiz_4_1","Quiz_4_2","Quiz_4_3","Quiz_4_4",
    "Quiz_5_1","Quiz_5_2","Quiz_5_3","Quiz_5_4","q6_read","q6_answer","review",
  ];
  const lastProgressStep = steps.indexOf("q6_answer"); // ใช้ค่านี้ทำ progress 0..1
  const goNext = () => {
    const i = steps.indexOf(step);
    if (i < steps.length - 1) setStep(steps[i + 1]);
  };
  const goPrev = () => {
    // ห้ามย้อนจาก q6_read / q6_answer
    if (step === "q6_read" || step === "q6_answer") return;
    const i = steps.indexOf(step);
    if (i > 0) setStep(steps[i - 1]);
  };
  const progress = Math.max(0, Math.min(steps.indexOf(step), lastProgressStep)) / lastProgressStep;

  /** ----------------------- เริ่มรอบใหม่ (รีเซ็ต + สุ่มโจทย์ใหม่) ----------------------- */
  const resetRound = () => {
    setAnswers({
      Quiz_1: "", Quiz_2: "", Quiz_3: "",
      Quiz_4_1: "", Quiz_4_2: "", Quiz_4_3: "", Quiz_4_4: "",
      Quiz_5_1: "", Quiz_5_2: "", Quiz_5_3: "", Quiz_5_4: "",
      Quiz6_Name: "", Quiz6_Surname: "", Quiz6_Number: "", Quiz6_Street: "", Quiz6_Province: "",
    });
    setScores({ Quiz_1: 0, Quiz_2: 0, Quiz_3: 0, q4: 0, q5: 0, q6: 0 });
    setTotal(0);
    setLevel("");
    setNow(new Date()); // อัปเดตเวลาใหม่ของรอบ
    setRoundId((r) => r + 1); // ทำให้ q4Qs/q5Qs สุ่มใหม่
    setStep("intro"); // กลับไปหน้าแนะนำ (ถ้าอยากเริ่มที่ Quiz_1 ให้เปลี่ยนเป็น "Quiz_1")
  };

  /** ----------------------- UI ----------------------- */
  const topInset = Platform.OS === "android" ? (StatusBar.currentHeight || 12) : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topInset }]}>
      <ScrollView contentContainerStyle={styles.outer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerGap} />{/* เว้นระยะบนเพิ่มเพื่อไม่ให้ชนแถบเครื่อง */}
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.title}>🧠 แบบทดสอบ 6CIT</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>

          {/* Intro */}
          {step === "intro" && (
            <View>
              <Text style={styles.p}>
                6CIT (Six-Item Cognitive Impairment Test) เป็นแบบคัดกรองความบกพร่องทางสติปัญญาอย่างรวดเร็ว
                แบบทดสอบมี 6 ข้อ คะแนนรวมยิ่งมาก แปลว่ามีโอกาสบกพร่องมากขึ้น
              </Text>
              <Text style={styles.p}>
                เมื่อพร้อมแล้วกด “เริ่มทำแบบทดสอบ” บางข้อจะอ้างอิงวัน และเวลาปัจจุบันโดยอัตโนมัติ
              </Text>
              <PrimaryButton label="เริ่มทำแบบทดสอบ" onPress={() => setStep("Quiz_1")} />
            </View>
          )}

          {/* Quiz_1 */}
          {step === "Quiz_1" && (
            <QuestionBlock
              title="ข้อ 1) ตอนนี้ปีอะไรแล้ว?"
              hint="ตอบได้ทั้ง ค.ศ. และ พ.ศ. เช่น 2025 / พ.ศ. 2568 / 2568 / ค.ศ. 2025"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น 2022 หรือ พ.ศ. 2565"
                  value={answers.Quiz_1}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz_1: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("Quiz_2")}
            />
          )}

          {/* Quiz_2 */}
          {step === "Quiz_2" && (
            <QuestionBlock
              title="ข้อ 2) ตอนนี้เดือนอะไร?"
              hint="พิมพ์ได้ทั้งชื่อเดือน (ไทย/อังกฤษ/ตัวย่อ) หรือเลข 1–12"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น สิงหาคม / Aug / 8"
                  value={answers.Quiz_2}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz_2: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("Quiz_3")}
            />
          )}

          {/* Quiz_3 */}
          {step === "Quiz_3" && (
            <QuestionBlock
              title="ข้อ 3) ตอนนี้ประมาณกี่โมง?"
              hint="ตอบเป็นชั่วโมง (ภายใน ±1 ชั่วโมงถือว่าถูก) ใส่เลข 0–23 หรือ 1–12 ก็ได้"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น 14 หรือ 2"
                  keyboardType="number-pad"
                  value={answers.Quiz_3}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz_3: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("Quiz_4_1")}
            />
          )}

          {/* Quiz_4_1-d: เลขที่อยู่ระหว่าง (สุ่ม) */}
          {step === "Quiz_4_1" && (
            <QuestionBlock
              title={`ข้อ 4.1) เลขใดอยู่ระหว่าง ${q4Qs[0].Min} และ ${q4Qs[0].Max}?`}
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น 1"
                  keyboardType="number-pad"
                  value={answers.Quiz_4_1}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz_4_1: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("Quiz_4_2")}
            />
          )}
          {step === "Quiz_4_2" && (
            <QuestionBlock
              title={`ข้อ 4.2) เลขใดอยู่ระหว่าง ${q4Qs[1].Min} และ ${q4Qs[1].Max}?`}
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น 2"
                  keyboardType="number-pad"
                  value={answers.Quiz_4_2}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz_4_2: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("Quiz_4_3")}
            />
          )}
          {step === "Quiz_4_3" && (
            <QuestionBlock
              title={`ข้อ 4.3) เลขใดอยู่ระหว่าง ${q4Qs[2].Min} และ ${q4Qs[2].Max}?`}
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น 3"
                  keyboardType="number-pad"
                  value={answers.Quiz_4_3}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz_4_3: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("Quiz_4_4")}
            />
          )}
          {step === "Quiz_4_4" && (
            <QuestionBlock
              title={`ข้อ 4.4) เลขใดอยู่ระหว่าง ${q4Qs[3].Min} และ ${q4Qs[3].Max}?`}
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น 4"
                  keyboardType="number-pad"
                  value={answers.Quiz_4_4}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz_4_4: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("Quiz_5_1")}
            />
          )}

          {/* Quiz_5_1-d: เดือนที่อยู่ระหว่าง (สุ่ม) */}
          {step === "Quiz_5_1" && (
            <QuestionBlock
              title={`ข้อ 5.1) เดือนใดอยู่ระหว่าง "${monthNamesTh[q5Qs[0].Min - 1]}" และ "${monthNamesTh[q5Qs[0].Max - 1]}"?`}
              hint="พิมพ์ได้ทั้งไทย/อังกฤษ/ตัวย่อ หรือเลข 1–12"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น สิงหาคม / Aug / 8"
                  value={answers.Quiz_5_1}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz_5_1: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("Quiz_5_2")}
            />
          )}
          {step === "Quiz_5_2" && (
            <QuestionBlock
              title={`ข้อ 5.2) เดือนใดอยู่ระหว่าง "${monthNamesTh[q5Qs[1].Min - 1]}" และ "${monthNamesTh[q5Qs[1].Max - 1]}"?`}
              hint="พิมพ์ได้ทั้งไทย/อังกฤษ/ตัวย่อ หรือเลข 1–12"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น สิงหาคม / Aug / 8"
                  value={answers.Quiz_5_2}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz_5_2: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("Quiz_5_3")}
            />
          )}
          {step === "Quiz_5_3" && (
            <QuestionBlock
              title={`ข้อ 5.3) เดือนใดอยู่ระหว่าง "${monthNamesTh[q5Qs[2].Min - 1]}" และ "${monthNamesTh[q5Qs[2].Max - 1]}"?`}
              hint="พิมพ์ได้ทั้งไทย/อังกฤษ/ตัวย่อ หรือเลข 1–12"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น สิงหาคม / Aug / 8"
                  value={answers.Quiz_5_3}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz_5_3: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("Quiz_5_4")}
            />
          )}
          {step === "Quiz_5_4" && (
            <QuestionBlock
              title={`ข้อ 5.4) เดือนใดอยู่ระหว่าง "${monthNamesTh[q5Qs[3].Min - 1]}" และ "${monthNamesTh[q5Qs[3].Max - 1]}"?`}
              hint="พิมพ์ได้ทั้งไทย/อังกฤษ/ตัวย่อ หรือเลข 1–12"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น สิงหาคม / Aug / 8"
                  value={answers.Quiz_5_4}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz_5_4: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("q6_read")}
            />
          )}

          {/* Q6 - หน้าบทความ (ห้ามย้อนกลับ) */}
          {step === "q6_read" && (
            <View>
              <Text style={styles.qTitle}>ข้อ 6) อ่านแล้วจำรายละเอียด</Text>
              <Text style={styles.quote}>
                “คุณสมหมาย ยืนคง อยู่บ้านเลขที่ 27 ถนนศรีอุทัย จังหวัดสุพรรณบุรี”
              </Text>
              <Text style={[styles.hint, { marginBottom: 12 }]}>
                เมื่อพร้อมกด “เริ่มตอบข้อ 6” และจะไม่สามารถย้อนกลับมาหน้านี้ได้
              </Text>
              <PrimaryButton label="เริ่มตอบข้อ 6" onPress={() => setStep("q6_answer")} />
            </View>
          )}

          {/* Q6 - หน้าตอบ (ห้ามย้อนกลับ) */}
          {step === "q6_answer" && (
            <View>
              <Text style={styles.qTitle}>ข้อ 6) กรอกคำตอบจากบทความที่อ่าน</Text>
              <TextInput
                style={styles.input}
                placeholder="ชื่อ"
                value={answers.Quiz6_Name}
                onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz6_Name: t }))}
              />
              <TextInput
                style={styles.input}
                placeholder="นามสกุล"
                value={answers.Quiz6_Surname}
                onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz6_Surname: t }))}
              />
              <TextInput
                style={styles.input}
                placeholder="บ้านเลขที่"
                keyboardType="number-pad"
                value={answers.Quiz6_Number}
                onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz6_Number: t }))}
              />
              <TextInput
                style={styles.input}
                placeholder="ถนน"
                value={answers.Quiz6_Street}
                onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz6_Street: t }))}
              />
              <TextInput
                style={styles.input}
                placeholder="จังหวัด"
                value={answers.Quiz6_Province}
                onChangeText={(t) => setAnswers((s) => ({ ...s, Quiz6_Province: t }))}
              />
              {/* ไม่มีปุ่มย้อนกลับในขั้นนี้ */}
              <PrimaryButton label="ส่งคำตอบ" onPress={handleSubmit} style={{ marginTop: 4 }} />
            </View>
          )}

          {/* Review / สรุปผล */}
          {step === "review" && (
            <View>
              <Text style={styles.title}>ผลคะแนน</Text>
              <Text style={[styles.p, { textAlign: "center", marginBottom: 12 }]}>
                คุณได้ {total} คะแนน ({level})
              </Text>
              <View style={styles.resultCard}>
                <Text style={styles.resultLine}>ข้อ 1 (ปี): {Sum_Quiz_1} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 2 (เดือน): {Sum_Quiz_2} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 3 (ชั่วโมง): {Sum_Quiz_3} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 4 (เลขที่อยู่ระหว่าง): {Sum_Quiz_4} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 5 (เดือนที่อยู่ระหว่าง): {Sum_Quiz_5} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 6 (ที่อยู่): {Sum_Quiz_6} คะแนน</Text>
                <View style={styles.divider} />
                <Text style={styles.totalText}>
                  คะแนนรวม: <Text style={{ fontWeight: "800" }}>{total}</Text>
                </Text>
                <View style={[styles.badge, getBadgeStyle(level)]}>
                  <Text style={styles.badgeText}>{level}</Text>
                </View>
              </View>

              <View style={[styles.row, { marginTop: 12 }]}>
                <SecondaryButton
                  label="กลับ"
                  onPress={() => navigation.goBack()}
                  style={{ flex: 1, marginMax: 8 }}
                />
                <PrimaryButton label="ทำอีกรอบ" onPress={resetRound} style={{ flex: 1, marginMin: 8 }} />
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />{/* เว้นระยะล่างเพื่อไม่ให้ติดขอบ */}
      </ScrollView>
    </SafeAreaView>
  );
}

/** ----------------------- Components ย่อย  ----------------------- */
// กล่องคำถามมาตรฐาน: แสดงหัวข้อ/คำใบ้/children (เช่น TextInput) และปุ่มย้อน-ถัดไป
function QuestionBlock({ title, hint, children, onPrev, onNext }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.qTitle}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
      <View style={styles.row}>
        <SecondaryButton label="ย้อนกลับ" onPress={onPrev} style={{ flex: 1, marginMax: 8 }} />
        <PrimaryButton label="ถัดไป" onPress={onNext} style={{ flex: 1, marginMin: 8 }} />
      </View>
    </View>
  );
}

// ปุ่มหลัก (โทนส้ม) โทนเข้ม/มุมโค้ง/เงาเล็ก ๆ
function PrimaryButton({ label, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.primaryBtn, style]} onPress={onPress} activeOpacity={0.9}>
      <Text style={styles.primaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ปุ่มรอง (พื้นส้มอ่อน) มุมโค้ง/เส้นขอบอุ่นตา
function SecondaryButton({ label, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.secondaryBtn, style]} onPress={onPress} activeOpacity={0.9}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

/** ----------------------- Styles (Orange Theme) ----------------------- */
const styles = StyleSheet.create({
  // ฉากหลังปลอดภัย ไม่ชนแถบด้านบนของเครื่อง
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF", // orange-50
  },

  // ช่องว่างส่วนหัว (เผื่อกรณีบางเครื่อง safe area ยังติด)
  headerGap: {
    height: 6,
  },

  // เนื้อหา Scroll ทั้งหน้า
  outer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: "center",
  },

  // การ์ดกลางหน้าจอ
  card: {
    width: "100%",
    maxWidth: 680,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginTop: 8, // ขยับลงมานิดนึงไม่ให้ชนขอบ
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 4,
        borderWidth: 1,
        borderColor: "#FFE4D6", // orange-200
      },
    }),
  },

  // หัวเรื่องหลัก
  title: {
    fontSize: 24,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "800",
    color: "#7C2D12", // orange-900
  },

  // ข้อความย่อหน้า
  p: { fontSize: 16, marginBottom: 10, lineHeight: 22, color: "#111827" },

  // หัวข้อคำถาม
  qTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#111827" },

  // คำใบ้
  hint: { fontSize: 13, color: "#9A3412", marginBottom: 8 }, // orange-800

  // ช่องกรอก
  input: {
    borderWidth: 1,
    borderColor: "#FED7AA", // orange-200
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#FFFBEB", // amber-50 (นุ่มตา)
  },

  // แถวปุ่มย้อน/ถัดไป
  row: { flexDirection: "row", width: "100%", marginTop: 4 },

  // ปุ่มหลัก (ส้ม)
  primaryBtn: {
    backgroundColor: "#F97316", // orange-500
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#F97316", shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  primaryBtnText: { color: "white", fontWeight: "800", fontSize: 16 },

  // ปุ่มรอง (ส้มอ่อน)
  secondaryBtn: {
    backgroundColor: "#FFF7ED", // orange-50
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FED7AA", // orange-200
  },
  secondaryBtnText: { color: "#9A3412", fontWeight: "800", fontSize: 16 }, // orange-800

  // กล่องคำพูด/บทความ
  quote: {
    borderMinWidth: 4,
    borderMinColor: "#FDBA74", // orange-300
    paddingMin: 10,
    fontSize: 16,
    marginBottom: 10,
    color: "#111827",
  },

  // Progress bar
  progressBarBg: {
    height: 10,
    backgroundColor: "#FFE4D6", // orange-200
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FB923C", // orange-400
  },

  // กล่องสรุปผล
  resultCard: {
    backgroundColor: "#FFFAF5", // ส้มอ่อนมาก
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFE4D6", // orange-200
  },
  divider: {
    height: 1,
    backgroundColor: "#FDEAD7", // orange-100/200
    marginVertical: 10,
  },
  resultLine: { fontSize: 16, marginBottom: 6, color: "#111827" },
  totalText: { fontSize: 18, marginBottom: 8, color: "#111827" },

  // ป้ายระดับผล (คงสี semantic เดิม: เขียว/ส้ม/แดง)
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  badgeText: { color: "white", fontWeight: "800" },
});

/** ----------------------- ฟังก์ชันกำหนดสีป้ายระดับ ----------------------- */
function getBadgeStyle(level) {
  if (level === "ปกติ") return { backgroundColor: "#16A34A" }; // green-600
  if (level === "ความบกพร่องทางสติปัญญาเล็กน้อย") return { backgroundColor: "#F59E0B" }; // amber-500
  return { backgroundColor: "#EF4444" }; // red-500
}
