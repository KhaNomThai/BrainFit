import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Platform, BackHandler, Alert, SafeAreaView, StatusBar, } from "react-native";
import { auth, db } from "../firebase";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

export default function CognitiveTestScreen({ navigation }) {
  /** ----------------------- State หลักของหน้า ----------------------- */
  // ลำดับ flow: intro → q1 → q2 → q3 → q4a → q4b → q4c → q4d → q5a → q5b → q5c → q5d → q6_read → q6_answer → review
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
    q1: "",
    q2: "",
    q3: "",
    q4a: "",
    q4b: "",
    q4c: "",
    q4d: "",
    q5a: "",
    q5b: "",
    q5c: "",
    q5d: "",
    q6_name: "",
    q6_surname: "",
    q6_number: "",
    q6_street: "",
    q6_province: "",
  });

  // สรุปคะแนนแยกรายข้อ + รวม + ระดับผล
  const [scores, setScores] = useState({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 });
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState("");

  /** ----------------------- Utilities / Helpers ----------------------- */
  // แผนที่ชื่อเดือน (ไทย/อังกฤษ/ตัวย่อ/เลข 1-12) → ลำดับเดือน 1..12
  const monthMaps = useMemo(() => {
    const map = new Map();
    const th = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const thAbbr = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    const en = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const enAbbr = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
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
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
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
      items.push({ left: start, right: start + 2, ans: start + 1 });
    }
    return items;
  }, [roundId]);

  // ข้อ 5: สุ่มเดือน (m, m+2) วนปี → คำตอบ = m+1 (แบบ modulo 12)
  const q5Qs = useMemo(() => {
    const wrap = (n) => ((n - 1) % 12 + 12) % 12 + 1; // คืนค่าเป็น 1..12
    const items = [];
    for (let i = 0; i < 4; i++) {
      const start = Math.floor(Math.random() * 12) + 1; // 1..12
      items.push({ left: start, right: wrap(start + 2), ans: wrap(start + 1) });
    }
    return items;
  }, [roundId]);

  /** ----------------------- ฟังก์ชันให้คะแนน ----------------------- */
  // ข้อ 1: รองรับทั้ง ค.ศ./พ.ศ. (ตรวจจับคำ: พ.ศ./พศ/พุทธศักราช/B.E./คริสต์ศักราช/ค.ศ./AD/CE)
  const scoreQ1 = (ans) => {
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
  const scoreQ2 = (ans) => (parseMonthToNumber(ans) === currentMonthIdx ? 0 : 3);

  // ข้อ 3: ชั่วโมงตอบถูกภายใน ±1 ชม. = 0 แต้ม, ผิด = 3 แต้ม
  const scoreQ3 = (ans) => {
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
      if (normalizeNumber(ansList[idx]) !== String(q.ans)) errors++;
    });
    return errors === 0 ? 0 : errors === 1 ? 2 : 4;
  };
  const scoreQ5 = (ansList) => {
    let errors = 0;
    q5Qs.forEach((q, idx) => {
      if (parseMonthToNumber(ansList[idx]) !== q.ans) errors++;
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
    const q1 = scoreQ1(answers.q1);
    const q2 = scoreQ2(answers.q2);
    const q3 = scoreQ3(answers.q3);
    const q4 = scoreQ4([answers.q4a, answers.q4b, answers.q4c, answers.q4d]);
    const q5 = scoreQ5([answers.q5a, answers.q5b, answers.q5c, answers.q5d]);
    const q6 = scoreQ6({
      name: answers.q6_name,
      surname: answers.q6_surname,
      number: answers.q6_number,
      street: answers.q6_street,
      province: answers.q6_province,
    });

    const newScores = { q1, q2, q3, q4, q5, q6 };
    const sum = q1 + q2 + q3 + q4 + q5 + q6;
    const lvl = getLevel(sum);
    setScores(newScores);
    setTotal(sum);
    setLevel(lvl);

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("ยังไม่ได้เข้าสู่ระบบ");

      // 1) เก็บประวัติรายรอบ: users/{uid}/cognitiveTests/{timestamp}
      const tsKey = String(Date.now());
      await setDoc(doc(db, "users", uid, "cognitiveTests", tsKey), {
        roundId,
        answers,
        scores: newScores,
        totalScore: sum,
        level: lvl,
        takenAtDeviceTime: now.toISOString(),
        createdAt: serverTimestamp(),
        q4Generated: q4Qs,
        q5Generated: q5Qs,
      });

      // 2) อัปเดตสรุปล่าสุดใน users/{uid}
      await setDoc(
        doc(db, "users", uid),
        {
          lastCognitiveTest: {
            roundId,
            scores: newScores,
            totalScore: sum,
            level: lvl,
            takenAtDeviceTime: now.toISOString(),
            updatedAt: serverTimestamp(),
          },
        },
        { merge: true }
      );

      // 3) ไปหน้าสรุปผล (review) ทันที
      setStep("review");
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", String(error?.message ?? error));
    }
  };

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
    "intro",
    "q1",
    "q2",
    "q3",
    "q4a",
    "q4b",
    "q4c",
    "q4d",
    "q5a",
    "q5b",
    "q5c",
    "q5d",
    "q6_read",
    "q6_answer",
    "review",
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
      q1: "",
      q2: "",
      q3: "",
      q4a: "",
      q4b: "",
      q4c: "",
      q4d: "",
      q5a: "",
      q5b: "",
      q5c: "",
      q5d: "",
      q6_name: "",
      q6_surname: "",
      q6_number: "",
      q6_street: "",
      q6_province: "",
    });
    setScores({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 });
    setTotal(0);
    setLevel("");
    setNow(new Date()); // อัปเดตเวลาใหม่ของรอบ
    setRoundId((r) => r + 1); // ทำให้ q4Qs/q5Qs สุ่มใหม่
    setStep("intro"); // กลับไปหน้าแนะนำ (ถ้าอยากเริ่มที่ q1 ให้เปลี่ยนเป็น "q1")
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
              <Text style={styles.p}>เมื่อพร้อมแล้วกด “เริ่มทำแบบทดสอบ” บางข้อจะอ้างอิงวัน และเวลาปัจจุบันโดยอัตโนมัติ</Text>
              <PrimaryButton label="เริ่มทำแบบทดสอบ" onPress={() => setStep("q1")} />
            </View>
          )}

          {/* Q1 */}
          {step === "q1" && (
            <QuestionBlock
              title="ข้อ 1) ตอนนี้ปีอะไรแล้ว?"
              hint="ตอบได้ทั้ง ค.ศ. และ พ.ศ. เช่น 2025 / พ.ศ. 2568 / 2568 / ค.ศ. 2025"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น 2022 หรือ พ.ศ. 2565"
                  value={answers.q1}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, q1: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("q2")}
            />
          )}

          {/* Q2 */}
          {step === "q2" && (
            <QuestionBlock
              title="ข้อ 2) ตอนนี้เดือนอะไร?"
              hint="พิมพ์ได้ทั้งชื่อเดือน (ไทย/อังกฤษ/ตัวย่อ) หรือเลข 1–12"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น สิงหาคม / Aug / 8"
                  value={answers.q2}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, q2: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("q3")}
            />
          )}

          {/* Q3 */}
          {step === "q3" && (
            <QuestionBlock
              title="ข้อ 3) ตอนนี้ประมาณกี่โมง?"
              hint="ตอบเป็นชั่วโมง (ภายใน ±1 ชั่วโมงถือว่าถูก) ใส่เลข 0–23 หรือ 1–12 ก็ได้"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น 14 หรือ 2"
                  keyboardType="number-pad"
                  value={answers.q3}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, q3: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("q4a")}
            />
          )}

          {/* Q4a-d: เลขที่อยู่ระหว่าง (สุ่ม) */}
          {step === "q4a" && (
            <QuestionBlock
              title={`ข้อ 4.1) เลขใดอยู่ระหว่าง ${q4Qs[0].left} และ ${q4Qs[0].right}?`}
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น 1"
                  keyboardType="number-pad"
                  value={answers.q4a}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, q4a: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("q4b")}
            />
          )}
          {step === "q4b" && (
            <QuestionBlock
              title={`ข้อ 4.2) เลขใดอยู่ระหว่าง ${q4Qs[1].left} และ ${q4Qs[1].right}?`}
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น 2"
                  keyboardType="number-pad"
                  value={answers.q4b}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, q4b: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("q4c")}
            />
          )}
          {step === "q4c" && (
            <QuestionBlock
              title={`ข้อ 4.3) เลขใดอยู่ระหว่าง ${q4Qs[2].left} และ ${q4Qs[2].right}?`}
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น 3"
                  keyboardType="number-pad"
                  value={answers.q4c}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, q4c: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("q4d")}
            />
          )}
          {step === "q4d" && (
            <QuestionBlock
              title={`ข้อ 4.4) เลขใดอยู่ระหว่าง ${q4Qs[3].left} และ ${q4Qs[3].right}?`}
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น 4"
                  keyboardType="number-pad"
                  value={answers.q4d}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, q4d: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("q5a")}
            />
          )}

          {/* Q5a-d: เดือนที่อยู่ระหว่าง (สุ่ม) */}
          {step === "q5a" && (
            <QuestionBlock
              title={`ข้อ 5.1) เดือนใดอยู่ระหว่าง "${monthNamesTh[q5Qs[0].left - 1]}" และ "${monthNamesTh[q5Qs[0].right - 1]}"?`}
              hint="พิมพ์ได้ทั้งไทย/อังกฤษ/ตัวย่อ หรือเลข 1–12"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น สิงหาคม / Aug / 8"
                  value={answers.q5a}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, q5a: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("q5b")}
            />
          )}
          {step === "q5b" && (
            <QuestionBlock
              title={`ข้อ 5.2) เดือนใดอยู่ระหว่าง "${monthNamesTh[q5Qs[1].left - 1]}" และ "${monthNamesTh[q5Qs[1].right - 1]}"?`}
              hint="พิมพ์ได้ทั้งไทย/อังกฤษ/ตัวย่อ หรือเลข 1–12"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น สิงหาคม / Aug / 8"
                  value={answers.q5b}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, q5b: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("q5c")}
            />
          )}
          {step === "q5c" && (
            <QuestionBlock
              title={`ข้อ 5.3) เดือนใดอยู่ระหว่าง "${monthNamesTh[q5Qs[2].left - 1]}" และ "${monthNamesTh[q5Qs[2].right - 1]}"?`}
              hint="พิมพ์ได้ทั้งไทย/อังกฤษ/ตัวย่อ หรือเลข 1–12"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น สิงหาคม / Aug / 8"
                  value={answers.q5c}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, q5c: t }))}
                />
              }
              onPrev={goPrev}
              onNext={() => setStep("q5d")}
            />
          )}
          {step === "q5d" && (
            <QuestionBlock
              title={`ข้อ 5.4) เดือนใดอยู่ระหว่าง "${monthNamesTh[q5Qs[3].left - 1]}" และ "${monthNamesTh[q5Qs[3].right - 1]}"?`}
              hint="พิมพ์ได้ทั้งไทย/อังกฤษ/ตัวย่อ หรือเลข 1–12"
              children={
                <TextInput
                  style={styles.input}
                  placeholder="เช่น สิงหาคม / Aug / 8"
                  value={answers.q5d}
                  onChangeText={(t) => setAnswers((s) => ({ ...s, q5d: t }))}
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
                value={answers.q6_name}
                onChangeText={(t) => setAnswers((s) => ({ ...s, q6_name: t }))}
              />
              <TextInput
                style={styles.input}
                placeholder="นามสกุล"
                value={answers.q6_surname}
                onChangeText={(t) => setAnswers((s) => ({ ...s, q6_surname: t }))}
              />
              <TextInput
                style={styles.input}
                placeholder="บ้านเลขที่"
                keyboardType="number-pad"
                value={answers.q6_number}
                onChangeText={(t) => setAnswers((s) => ({ ...s, q6_number: t }))}
              />
              <TextInput
                style={styles.input}
                placeholder="ถนน"
                value={answers.q6_street}
                onChangeText={(t) => setAnswers((s) => ({ ...s, q6_street: t }))}
              />
              <TextInput
                style={styles.input}
                placeholder="จังหวัด"
                value={answers.q6_province}
                onChangeText={(t) => setAnswers((s) => ({ ...s, q6_province: t }))}
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
                <Text style={styles.resultLine}>ข้อ 1 (ปี): {scores.q1} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 2 (เดือน): {scores.q2} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 3 (ชั่วโมง): {scores.q3} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 4 (เลขที่อยู่ระหว่าง): {scores.q4} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 5 (เดือนที่อยู่ระหว่าง): {scores.q5} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 6 (ที่อยู่): {scores.q6} คะแนน</Text>
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
                  style={{ flex: 1, marginRight: 8 }}
                />
                <PrimaryButton label="ทำอีกรอบ" onPress={resetRound} style={{ flex: 1, marginLeft: 8 }} />
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
        <SecondaryButton label="ย้อนกลับ" onPress={onPrev} style={{ flex: 1, marginRight: 8 }} />
        <PrimaryButton label="ถัดไป" onPress={onNext} style={{ flex: 1, marginLeft: 8 }} />
      </View>
    </View>
  );
}

// ปุ่มหลัก (น้ำเงิน) โทนเข้ม/มุมโค้ง/เงาเล็ก ๆ
function PrimaryButton({ label, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.primaryBtn, style]} onPress={onPress} activeOpacity={0.9}>
      <Text style={styles.primaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ปุ่มรอง (พื้นอ่อน) มุมโค้ง/เงาเบา ๆ
function SecondaryButton({ label, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.secondaryBtn, style]} onPress={onPress} activeOpacity={0.9}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

/** ----------------------- Styles ----------------------- */
const styles = StyleSheet.create({
  // ฉากหลังปลอดภัย ไม่ชนแถบด้านบนของเครื่อง
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6", // gray-100
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
        borderColor: "#eef2f7",
      },
    }),
  },

  // หัวเรื่องหลัก
  title: {
    fontSize: 24,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "800",
    color: "#0F172A", // slate-900
  },

  // ข้อความย่อหน้า
  p: { fontSize: 16, marginBottom: 10, lineHeight: 22, color: "#111827" },

  // หัวข้อคำถาม
  qTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#111827" },

  // คำใบ้
  hint: { fontSize: 13, color: "#6b7280", marginBottom: 8 },

  // ช่องกรอก
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },

  // แถวปุ่มย้อน/ถัดไป
  row: { flexDirection: "row", width: "100%", marginTop: 4 },

  // ปุ่มหลัก
  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#2563EB", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  primaryBtnText: { color: "white", fontWeight: "800", fontSize: 16 },

  // ปุ่มรอง
  secondaryBtn: {
    backgroundColor: "#EEF2FF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  secondaryBtnText: { color: "#1E3A8A", fontWeight: "800", fontSize: 16 },

  // กล่องคำพูด/บทความ
  quote: {
    borderLeftWidth: 4,
    borderLeftColor: "#93C5FD",
    paddingLeft: 10,
    fontSize: 16,
    marginBottom: 10,
    color: "#111827",
  },

  // Progress bar
  progressBarBg: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#60A5FA",
  },

  // กล่องสรุปผล
  resultCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
  },
  resultLine: { fontSize: 16, marginBottom: 6, color: "#111827" },
  totalText: { fontSize: 18, marginBottom: 8, color: "#111827" },

  // ป้ายระดับผล
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
