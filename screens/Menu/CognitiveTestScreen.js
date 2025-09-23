import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Platform,
  BackHandler, Alert, SafeAreaView, StatusBar, Animated, Easing,
} from "react-native";
import { post } from "../../api";

/* ----------------------- Helpers ----------------------- */
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const ensureAnim = (mapObj, key) => {
  if (!mapObj[key]) {
    mapObj[key] = {
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      tx: new Animated.Value(0),
    };
  }
  return mapObj[key];
};

/* ----------------------- Q6 BANK ----------------------- */
const Q6_BANK = [
  { name: "อนันต์", surname: "อยู่ดี", number: "15", street: "มาลัย", province: "สุพรรณบุรี" },
  { name: "กาญจนา", surname: "ดำรงค์", number: "89", street: "นางพญา", province: "พิษณุโลก" },
  { name: "วรชัย", surname: "ยั่งยืน", number: "42", street: "สวรรค์วิถี", province: "นครสวรรค์" },
  { name: "ปาณิตา", surname: "อยู่เย็น", number: "30", street: "พระปิ่นเกล้า", province: "กรุงเทพมหานคร" },
  { name: "ฐากูร", surname: "รุ่งเรือง", number: "79", street: "เจริญเมือง", province: "เชียงใหม่" },
  { name: "ณรงค์", surname: "ก้าวหน้า", number: "52", street: "พระรามหก", province: "กรุงเทพมหานคร" },
  { name: "จิราภา", surname: "อยู่มั่น", number: "12", street: "บรมราชชนนี", province: "นครปฐม" },
  { name: "ธีรพงษ์", surname: "เจริญสุข", number: "21", street: "อินทวโรรส", province: "ลำปาง" },
  { name: "วิไล", surname: "รื่นรมย์", number: "93", street: "เทพประสิทธิ์", province: "ชลบุรี" },
  { name: "กิตติ", surname: "มั่งมี", number: "10", street: "รามคำแหง", province: "กรุงเทพมหานคร" },
  { name: "ปรีชา", surname: "รุ่งเรือง", number: "67", street: "สรรพสิทธิ์", province: "อุบลราชธานี" },
  { name: "สมชาย", surname: "อยู่ดีมีสุข", number: "82", street: "กลางเมือง", province: "ขอนแก่น" },
  { name: "อาทิตย์", surname: "ไพบูลย์", number: "76", street: "โพศรี", province: "อุดรธานี" },
  { name: "พีรภพ", surname: "ตั้งตรง", number: "23", street: "สุริยวงศ์", province: "สุรินทร์" },
  { name: "สมเกียรติ", surname: "อุดมผล", number: "34", street: "หน้าสถานี", province: "นครราชสีมา" },
  { name: "อารีย์", surname: "เพิ่มพูน", number: "19", street: "ราชการุญ", province: "พิจิตร" },
  { name: "นพดล", surname: "พิพัฒน์", number: "27", street: "สีหราชเดโชชัย", province: "พิษณุโลก" },
  { name: "ปาริชาติ", surname: "ศรีสวัสดิ์", number: "71", street: "ราชดำเนิน", province: "พระนครศรีอยุธยา" },
  { name: "ธนกร", surname: "สายชล", number: "34", street: "จอมพล", province: "ขอนแก่น" },
  { name: "วุฒิพงษ์", surname: "วัฒนชัย", number: "56", street: "มหาราช", province: "สงขลา" },
];

export default function CognitiveTestScreen({ navigation, email }) {
  /* ----------------------- State หลักของหน้า ----------------------- */
  // flow: intro → Quiz_1 → Quiz_2 → Quiz_3 → Quiz_4 → Quiz_5 → q6_read → q6_answer → review
  const [step, setStep] = useState("intro");

  // ใช้ roundId เพื่อสุ่มใหม่เมื่อกดทำอีกรอบ
  const [roundId, setRoundId] = useState(0);

  // เวลาอ้างอิงของ "รอบนี้"
  const [now, setNow] = useState(new Date());
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth() + 1; // 1-12
  const currentHour24 = now.getHours(); // 0-23

  // คำตอบ/บันทึก
  const [answersQ_1, setAnswersQ_1] = useState({
    Quiz_1: "",
  });

  const [answersQ_2, setAnswersQ_2] = useState({
    Quiz_2: "",
  });

  const [answersQ_3, setAnswersQ_3] = useState({
    Quiz_3: "",
  });

  const [answersQ_4, setAnswersQ_4] = useState({
    Q4_Start: 0,
    Q4_ExpectedSeq: [],
    Q4_Taps: [],
  });

  const [answersQ_5, setAnswersQ_5] = useState({
    Q5_StartMonth: 0,
    Q5_ExpectedSeq: [],
    Q5_Taps: [],
  });

  const [answersQ_6, setAnswersQ_6] = useState({
    Q6_Index: 0,
    Quiz6_Name: "",
    Quiz6_Surname: "",
    Quiz6_Number: "",
    Quiz6_Street: "",
    Quiz6_Province: "",
  });

  // คะแนน
  const [scores, setScores] = useState({ Quiz_1: 0, Quiz_2: 0, Quiz_3: 0, Quiz_4: 0, Quiz_5: 0, Quiz_6: 0 });
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState("");

  /* ----------------------- Utilities / Helpers ----------------------- */
  const monthMaps = useMemo(() => {
    const map = new Map();
    const th = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
    const thAbbr = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    const en = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    const enAbbr = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    for (let i = 0; i < 12; i++) {
      const idx = i + 1;
      map.set(th[i].toLowerCase(), idx);
      map.set(thAbbr[i].toLowerCase(), idx);
      map.set(en[i].toLowerCase(), idx);
      map.set(enAbbr[i].toLowerCase(), idx);
      map.set(String(idx), idx);
    }
    return map;
  }, []);
  const monthNamesTh = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

  const normalize = (s) => (s ?? "").toString().trim().toLowerCase().replace(/\s+/g, " ");
  const normalizeNumber = (s) => normalize(s).replace(/[^\d]/g, "");
  const parseMonthToNumber = (input) => monthMaps.get(normalize(input)) ?? null;

  /* --- ข้อ 3: รับเฉพาะ 00–23 --- */
  const isValidHour00to23 = (val) => {
    const raw = normalizeNumber(val);
    if (raw === "") return false;
    if (!/^\d{1,2}$/.test(raw)) return false;
    const n = parseInt(raw, 10);
    return n >= 0 && n <= 23;
  };

  /* ----------------------- Q4: เลขฟองสบู่ 20 ฟอง (มาก → น้อย) ----------------------- */
  const [q4Start, setQ4Start] = useState(0);
  const [q4Buttons, setQ4Buttons] = useState([]);
  const [q4Next, setQ4Next] = useState(0);
  const [q4CorrectSet, setQ4CorrectSet] = useState(new Set());
  const [q4WrongCount, setQ4WrongCount] = useState(0);
  const [q4Complete, setQ4Complete] = useState(false);
  const [q4WrongFlash, setQ4WrongFlash] = useState(new Set());
  const q4TimersRef = useRef({});
  const q4AnimMapRef = useRef({}); // {num: {scale, opacity, tx}}

  const flashQ4Wrong = (num) => {
    setQ4WrongFlash((prev) => {
      const n = new Set(prev); n.add(num); return n;
    });
    // shake
    const anim = ensureAnim(q4AnimMapRef.current, num);
    Animated.sequence([
      Animated.timing(anim.tx, { toValue: -8, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(anim.tx, { toValue: 8, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(anim.tx, { toValue: -6, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(anim.tx, { toValue: 4, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(anim.tx, { toValue: 0, duration: 60, easing: Easing.linear, useNativeDriver: true }),
    ]).start();

    if (q4TimersRef.current[num]) clearTimeout(q4TimersRef.current[num]);
    q4TimersRef.current[num] = setTimeout(() => {
      setQ4WrongFlash((prev) => {
        const n = new Set(prev); n.delete(num); return n;
      });
      delete q4TimersRef.current[num];
    }, 350);
  };

  const initQ4 = () => {
    // รอบแรก: ใช้ 1..20 → กดจาก 20→1; รอบถัดไป: ใช้ start 20..100 ไล่ลง 20 ตัว
    let start;
    let descSeq;
    if (roundId === 0) {
      start = 20;
      descSeq = Array.from({ length: 20 }, (_, i) => 20 - i); // 20..1
    } else {
      start = randInt(20, 100);
      descSeq = Array.from({ length: 20 }, (_, i) => start - i); // start..start-19
    }
    const seqShuffled = shuffle([...descSeq]);

    // reset anims
    const map = q4AnimMapRef.current;
    seqShuffled.forEach((n) => {
      const a = ensureAnim(map, n);
      a.scale.setValue(1);
      a.opacity.setValue(1);
      a.tx.setValue(0);
    });

    setQ4Start(start);
    setQ4Buttons(seqShuffled);
    setQ4Next(descSeq[0]); // ตัวใหญ่สุด
    setQ4CorrectSet(new Set());
    setQ4WrongCount(0);
    setQ4Complete(false);
    setQ4WrongFlash(new Set());
    setAnswersQ_4((prev) => ({
      ...prev,
      Q4_Start: start,
      Q4_ExpectedSeq: descSeq,
      Q4_Taps: [],
    }));
  };

  const onTapQ4 = (num) => {
    const minVal = q4Start - 19;
    setAnswersQ_4((p) => ({ ...p, Q4_Taps: [...p.Q4_Taps, num] }));

    if (num === q4Next) {
      // correct → pop & fade
      const anim = ensureAnim(q4AnimMapRef.current, num);
      Animated.sequence([
        Animated.spring(anim.scale, { toValue: 1.08, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 0, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(anim.scale, { toValue: 0, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]).start();

      const newSet = new Set(q4CorrectSet);
      newSet.add(num);
      setQ4CorrectSet(newSet);

      const nextVal = q4Next - 1;
      if (nextVal < minVal) setQ4Complete(true);
      else setQ4Next(nextVal);
    } else {
      setQ4WrongCount((c) => c + 1);
      flashQ4Wrong(num);
    }
  };

  /* ----------------------- Q5: เดือนฟองสบู่ 12 ฟอง ----------------------- */
  const wrapMonth = (n) => ((n - 1) % 12 + 12) % 12 + 1; // 1..12
  const getRandomMonthExcept = (except) => {
    let n = randInt(1, 12);
    if (n === except) n = ((n % 12) + 1); // เปลี่ยนให้ต่างแน่ๆ
    return n;
  };

  const [q5StartMonth, setQ5StartMonth] = useState(12);
  const [q5Buttons, setQ5Buttons] = useState([]); // {num,label}[]
  const [q5ExpectedSeq, setQ5ExpectedSeq] = useState([]);
  const [q5Index, setQ5Index] = useState(0);
  const [q5CorrectSet, setQ5CorrectSet] = useState(new Set());
  const [q5WrongCount, setQ5WrongCount] = useState(0);
  const [q5Complete, setQ5Complete] = useState(false);

  const [q5WrongFlash, setQ5WrongFlash] = useState(new Set());
  const q5TimersRef = useRef({});
  const q5AnimMapRef = useRef({}); // {num: {scale, opacity, tx}}

  const flashQ5Wrong = (num) => {
    setQ5WrongFlash((prev) => {
      const n = new Set(prev); n.add(num); return n;
    });

    const anim = ensureAnim(q5AnimMapRef.current, num);
    Animated.sequence([
      Animated.timing(anim.tx, { toValue: -8, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(anim.tx, { toValue: 8, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(anim.tx, { toValue: -6, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(anim.tx, { toValue: 4, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(anim.tx, { toValue: 0, duration: 60, easing: Easing.linear, useNativeDriver: true }),
    ]).start();

    if (q5TimersRef.current[num]) clearTimeout(q5TimersRef.current[num]);
    q5TimersRef.current[num] = setTimeout(() => {
      setQ5WrongFlash((prev) => {
        const n = new Set(prev); n.delete(num); return n;
      });
      delete q5TimersRef.current[num];
    }, 350);
  };

  const initQ5 = () => {
    const start = roundId === 0 ? 12 : getRandomMonthExcept(12);
    const seq = [];
    for (let i = 0; i < 12; i++) seq.push(wrapMonth(start - i)); // เริ่ม start แล้วย้อนหลัง 12 เดือน

    const btns = shuffle(
      Array.from({ length: 12 }, (_, i) => ({ num: i + 1, label: monthNamesTh[i] }))
    );

    // reset anims
    const map = q5AnimMapRef.current;
    btns.forEach((b) => {
      const a = ensureAnim(map, b.num);
      a.scale.setValue(1);
      a.opacity.setValue(1);
      a.tx.setValue(0);
    });

    setQ5StartMonth(start);
    setQ5ExpectedSeq(seq);
    setQ5Buttons(btns);
    setQ5Index(0);
    setQ5CorrectSet(new Set());
    setQ5WrongCount(0);
    setQ5Complete(false);
    setQ5WrongFlash(new Set());

    setAnswersQ_5((prev) => ({
      ...prev,
      Q5_StartMonth: start,
      Q5_ExpectedSeq: seq,
      Q5_Taps: [],
    }));
  };

  const onTapQ5 = (monthNum) => {
    setAnswersQ_5((p) => ({ ...p, Q5_Taps: [...p.Q5_Taps, monthNum] }));
    const expected = q5ExpectedSeq[q5Index];

    if (monthNum === expected) {
      const anim = ensureAnim(q5AnimMapRef.current, monthNum);
      Animated.sequence([
        Animated.spring(anim.scale, { toValue: 1.08, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 0, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(anim.scale,   { toValue: 0, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]).start();

      const newSet = new Set(q5CorrectSet);
      newSet.add(monthNum);
      setQ5CorrectSet(newSet);

      const next = q5Index + 1;
      if (next >= 12) setQ5Complete(true);
      else setQ5Index(next);
    } else {
      setQ5WrongCount((c) => c + 1);
      flashQ5Wrong(monthNum);
    }
  };

  /* ----------------------- สุ่ม Q4 / Q5 / Q6 เมื่อเริ่มรอบ ----------------------- */
  useEffect(() => {
    initQ4();
    initQ5();
    // init Q6
    const idx = randInt(0, Q6_BANK.length - 1);
    setAnswersQ_6((prev) => ({
      ...prev,
      Q6_Index: idx,
      Quiz6_Name: "",
      Quiz6_Surname: "",
      Quiz6_Number: "",
      Quiz6_Street: "",
      Quiz6_Province: "",
    }));
  }, [roundId]);

  /* ----------------------- Cleanup timers ----------------------- */
  useEffect(() => {
    return () => {
      Object.values(q4TimersRef.current).forEach(clearTimeout);
      Object.values(q5TimersRef.current).forEach(clearTimeout);
    };
  }, []);

  /* ----------------------- ฟังก์ชันให้คะแนน ----------------------- */
  const scoreQuiz_1 = (ans) => {
    const s = normalize(ans);
    const nRaw = parseInt(normalizeNumber(ans), 10);
    if (isNaN(nRaw)) return 4;
    const isBE = /พ\.?\s?ศ|พุทธศักราช|b\.?\s*e\.?/i.test(s);
    const isAD = /ค\.?\s?ศ|คริสต์ศักราช|a\.?\s*d\.?|c\.?\s*e\.?/i.test(s);
    let yearAD = nRaw;
    if (isBE) yearAD = nRaw - 543;
    else if (!isAD && nRaw >= 2400) yearAD = nRaw - 543;
    return yearAD === currentYear ? 0 : 4;
  };
  const scoreQuiz_2 = (ans) => (parseMonthToNumber(ans) === currentMonthIdx ? 0 : 3);
  const scoreQuiz_3 = (ans) => {
    if (!isValidHour00to23(ans)) return 3;
    const n = parseInt(normalizeNumber(ans), 10);
    return Math.abs(n - currentHour24) <= 1 ? 0 : 3;
  };
  const scoreFromWrong = (wrong) => (wrong === 0 ? 0 : wrong === 1 ? 2 : 4);

  const scoreQ6 = ({ name, surname, number, street, province }, picked) => {
    let errors = 0;
    if (normalize(name) !== normalize(picked.name)) errors++;
    if (normalize(surname) !== normalize(picked.surname)) errors++;
    if (normalizeNumber(number) !== normalizeNumber(picked.number)) errors++;
    if (normalize(street) !== normalize(picked.street)) errors++;
    if (normalize(province) !== normalize(picked.province)) errors++;
    return errors * 2; // 0/2/4/6/8/10
  };

  const getLevel = (sum) =>
    sum <= 7 ? "ปกติ" : sum <= 9 ? "ความบกพร่องทางสติปัญญาเล็กน้อย" : "ความบกพร่องทางสติปัญญาอย่างมีนัยสำคัญ";

  const getAdvice = (sum) => {
    if (sum <= 7) {
      return {
        heading: "คำแนะนำ (ปกติ)",
        bullets: [
          "ดูแลสุขภาพสมองต่อเนื่อง: ออกกำลังกายสม่ำเสมอ กินอาหารมีประโยชน์",
          "ฝึกสมาธิ อ่านหนังสือ เล่นเกมฝึกสมอง",
          "นอนหลับพักผ่อนให้เพียงพอ",
        ],
      };
    }
    if (sum <= 9) {
      return {
        heading: "คำแนะนำ (ผิดปกติเล็กน้อย/ต้องเฝ้าระวัง)",
        bullets: [
          "ติดตามประเมินซ้ำภายใน 6–12 เดือน",
          "ส่งเสริมกิจกรรมกระตุ้นสมอง",
          "ตรวจสุขภาพทั่วไป เช่น เบาหวาน ความดัน ไขมัน",
        ],
      };
    }
    return {
      heading: "คำแนะนำ (มีความเสี่ยงภาวะสมองเสื่อม)",
      bullets: [
        "ควรส่งต่อพบแพทย์เฉพาะทาง เพื่อตรวจเพิ่มเติม เช่น MMSE, MoCA หรือการตรวจทางห้องปฏิบัติการ/ภาพสมอง",
        "แนะนำครอบครัวให้สังเกตพฤติกรรม การใช้ชีวิตประจำวัน และวางแผนการดูแล",
      ],
    };
  };

  /* ----------------------- ส่งคำตอบ + บันทึกไป API ----------------------- */
  const handleSubmit = async () => {
    // ตรวจว่ากรอกครบข้อ 6
    if (
      !answersQ_6.Quiz6_Name?.trim() ||
      !answersQ_6.Quiz6_Surname?.trim() ||
      !answersQ_6.Quiz6_Number?.trim() ||
      !answersQ_6.Quiz6_Street?.trim() ||
      !answersQ_6.Quiz6_Province?.trim()
    ) {
      Alert.alert("กรอกไม่ครบ", "กรุณากรอกข้อมูลให้ครบทุกช่องในข้อ 6");
      return;
    }

    const Sum_Quiz_1 = scoreQuiz_1(answersQ_1.Quiz_1);
    const Sum_Quiz_2 = scoreQuiz_2(answersQ_2.Quiz_2);
    const Sum_Quiz_3 = scoreQuiz_3(answersQ_3.Quiz_3);
    const Sum_Quiz_4 = scoreFromWrong(q4WrongCount);
    const Sum_Quiz_5 = scoreFromWrong(q5WrongCount);
    const picked = Q6_BANK[answersQ_6.Q6_Index] || Q6_BANK[0];
    const Sum_Quiz_6 = scoreQ6(
      {
        name: answersQ_6.Quiz6_Name,
        surname: answersQ_6.Quiz6_Surname,
        number: answersQ_6.Quiz6_Number,
        street: answersQ_6.Quiz6_Street,
        province: answersQ_6.Quiz6_Province,
      },
      picked
    );

    const newScores = {
      Quiz_1: Sum_Quiz_1, Quiz_2: Sum_Quiz_2, Quiz_3: Sum_Quiz_3,
      Quiz_4: Sum_Quiz_4, Quiz_5: Sum_Quiz_5, Quiz_6: Sum_Quiz_6,
    };
    const sum = Object.values(newScores).reduce((a, b) => a + b, 0);
    const lvl = getLevel(sum);

    setScores(newScores);
    setTotal(sum);
    setLevel(lvl);

    try {
      const nowISO = new Date().toISOString();
      const data = await post({
        action: "registerCognitiveTest",
        email,
        // roundId,
        sum_Quiz_1 : Sum_Quiz_1,
        sum_Quiz_2 : Sum_Quiz_2,
        sum_Quiz_3 : Sum_Quiz_3,
        sum_Quiz_4 : Sum_Quiz_4,
        sum_Quiz_5 : Sum_Quiz_5,
        sum_Quiz_6 : Sum_Quiz_6,
        scores: newScores,
        totalScore: sum,
        level: lvl,
        // takenAtDeviceTime: nowISO,
        // q4Generated: { start: q4Start, expected: answers.Q4_ExpectedSeq, shuffled: q4Buttons },
        // q5Generated: { startMonth: q5StartMonth, expected: answers.Q5_ExpectedSeq, shuffled: q5Buttons },
        q6Picked: picked,
      });
      if (data?.success) setStep("review");
      else throw new Error(data?.message ?? "ไม่สามารถบันทึกข้อมูลไป Google Sheet ได้");
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", String(error?.message ?? error));
    }
  };

  /* ----------------------- กันปุ่ม Back (Android) ตอน q6_* ----------------------- */
  useEffect(() => {
    const blockBack = () => {
      if (step === "q6_read" || step === "q6_answer") return true;
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", blockBack);
    return () => sub.remove();
  }, [step]);

  /* ----------------------- Progress & canProceed ----------------------- */
  const steps = ["intro","Quiz_1","Quiz_2","Quiz_3","Quiz_4","Quiz_5","q6_read","q6_answer","review"];
  const lastProgressStep = steps.indexOf("q6_answer");
  const progress = Math.max(0, Math.min(steps.indexOf(step), lastProgressStep)) / lastProgressStep;

  const canProceed = (() => {
    switch (step) {
      case "Quiz_1": return !!answersQ_1.Quiz_1?.trim();
      case "Quiz_2": return !!answersQ_2.Quiz_2?.trim();
      case "Quiz_3": return isValidHour00to23(answersQ_3.Quiz_3);
      case "Quiz_4": return q4Complete;
      case "Quiz_5": return q5Complete;
      case "q6_read": return true;
      default: return true;
    }
  })();

  /* ----------------------- เริ่มรอบใหม่ ----------------------- */
  const resetRound = () => {
    setAnswersQ_1({ Quiz_1: "" });
    setAnswersQ_2({ Quiz_2: "" });
    setAnswersQ_3({ Quiz_3: "" });

    setAnswersQ_4({
      Q4_Start: 0,
      Q4_ExpectedSeq: [],
      Q4_Taps: [],
    });

    setAnswersQ_5({
      Q5_StartMonth: 0,
      Q5_ExpectedSeq: [],
      Q5_Taps: [],
    });

    setAnswersQ_6({
      Q6_Index: 0,
      Quiz6_Name: "",
      Quiz6_Surname: "",
      Quiz6_Number: "",
      Quiz6_Street: "",
      Quiz6_Province: "",
    });

    setScores({ Quiz_1: 0, Quiz_2: 0, Quiz_3: 0, Quiz_4: 0, Quiz_5: 0, Quiz_6: 0 });
    setTotal(0);
    setLevel("");
    setNow(new Date());
    setRoundId((r) => r + 1); // trigger init Q4/Q5/Q6 ใหม่
    setStep("intro");
  };

  /* ----------------------- UI ----------------------- */
  const topInset = Platform.OS === "android" ? (StatusBar.currentHeight || 12) : 0;
  const advice = useMemo(() => getAdvice(total), [total]);

  const pickedQ6 = Q6_BANK[answersQ_6.Q6_Index] || Q6_BANK[0];
  const q6Text = `“คุณ${pickedQ6.name} ${pickedQ6.surname} อยู่บ้านเลขที่ ${pickedQ6.number} ถนน${pickedQ6.street} จังหวัด${pickedQ6.province}”`;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topInset }]}>
      <ScrollView contentContainerStyle={styles.outer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerGap} />
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
              onNext={() => canProceed && setStep("Quiz_2")}
              disabledNext={!canProceed}
            >
              <TextInput
                style={styles.input}
                placeholder="เช่น 2025 หรือ พ.ศ. 2568"
                value={answersQ_1.Quiz_1}
                onChangeText={(t) => setAnswersQ_1((s) => ({ ...s, Quiz_1: t }))}
              />
            </QuestionBlock>
          )}

          {/* Quiz_2 */}
          {step === "Quiz_2" && (
            <QuestionBlock
              title="ข้อ 2) ตอนนี้เดือนอะไร?"
              hint="พิมพ์ได้ทั้งชื่อเดือน (ไทย/อังกฤษ/ตัวย่อ) หรือเลข 1–12"
              onNext={() => canProceed && setStep("Quiz_3")}
              disabledNext={!canProceed}
            >
              <TextInput
                style={styles.input}
                placeholder="เช่น สิงหาคม / Aug / 8"
                value={answersQ_2.Quiz_2}
                onChangeText={(t) => setAnswersQ_2((s) => ({ ...s, Quiz_2: t }))}
              />
            </QuestionBlock>
          )}

          {/* Quiz_3 */}
          {step === "Quiz_3" && (
            <QuestionBlock
              title="ข้อ 3) ตอนนี้ประมาณกี่โมง?"
              hint="ตอบเป็นเวลา 00 - 23 น. (±1 ชั่วโมงถือว่าถูก เเละห้ามดูนาฬิกา)"
              onNext={() => canProceed && setStep("Quiz_4")}
              disabledNext={!canProceed}
            >
              <TextInput
                style={styles.input}
                placeholder="เช่น 14"
                keyboardType="number-pad"
                maxLength={2}
                value={answersQ_3.Quiz_3}
                onChangeText={(t) => {
                  const digits = t.replace(/[^\d]/g, "").slice(0, 2);
                  setAnswersQ_3((s) => ({ ...s, Quiz_3: digits }));
                }}
              />
              {answersQ_3.Quiz_3 !== "" && !isValidHour00to23(answersQ_3.Quiz_3) ? (
                <Text style={styles.errorText}>กรุณาใส่ชั่วโมง 00–23</Text>
              ) : null}
            </QuestionBlock>
          )}

          {/* Quiz_4: ฟองเลข 20 ฟอง (มาก→น้อย) */}
          {step === "Quiz_4" && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.qTitle}>ข้อ 4) แตะตัวเลขเรียงจากมาก → น้อย</Text>
              <Text style={styles.hint}>เริ่มจากเลข:</Text>
              <Text style={styles.startBig}>{q4Start}</Text>

              <View style={styles.gridWrap}>
                {q4Buttons.map((n) => {
                  const done = q4CorrectSet.has(n);
                  const wrongBlink = q4WrongFlash.has(n);
                  const anim = ensureAnim(q4AnimMapRef.current, n);
                  return (
                    <Animated.View
                      key={n}
                      pointerEvents={done ? "none" : "auto"}
                      style={[
                        styles.gridCell,
                        { transform: [{ translateX: anim.tx }, { scale: anim.scale }], opacity: anim.opacity },
                      ]}
                    >
                      <TouchableOpacity
                        style={[styles.gridBtn, wrongBlink && styles.gridBtnWrong]}
                        onPress={() => onTapQ4(n)}
                        disabled={done}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.gridBtnText, wrongBlink && styles.gridBtnTextWrong]}>{n}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.statusText}>
                  คงเหลือ: <Text style={styles.bold}>{20 - q4CorrectSet.size}</Text> ตัว
                </Text>
                <Text style={styles.statusText}>
                  ผิดพลาด: <Text style={styles.bold}>{q4WrongCount}</Text> ครั้ง
                </Text>
              </View>

              <View style={{ width: "100%", marginTop: 8 }}>
                <PrimaryButton label="ถัดไป" onPress={() => setStep("Quiz_5")} disabled={!q4Complete} />
              </View>
            </View>
          )}

          {/* Quiz_5: ฟองเดือน 12 ฟอง (เริ่มเดือนสุ่ม แล้วย้อนครบ 12) */}
          {step === "Quiz_5" && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.qTitle}>ข้อ 5) แตะชื่อเดือนเริ่มจากเดือนที่กำหนด แล้วย้อนกลับให้ครบ 12 เดือน</Text>
              <Text style={styles.hint}>เริ่มจากเดือน:</Text>
              <Text style={styles.startBig}>{monthNamesTh[q5StartMonth - 1]}</Text>

              <View style={styles.gridWrap}>
                {q5Buttons.map((b) => {
                  const done = q5CorrectSet.has(b.num);
                  const wrongBlink = q5WrongFlash.has(b.num);
                  const anim = ensureAnim(q5AnimMapRef.current, b.num);
                  return (
                    <Animated.View
                      key={b.num}
                      pointerEvents={done ? "none" : "auto"}
                      style={[
                        styles.gridCell,
                        { transform: [{ translateX: anim.tx }, { scale: anim.scale }], opacity: anim.opacity },
                      ]}
                    >
                      <TouchableOpacity
                        style={[styles.gridBtn, wrongBlink && styles.gridBtnWrong]}
                        onPress={() => onTapQ5(b.num)}
                        disabled={done}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.gridBtnText, wrongBlink && styles.gridBtnTextWrong]}>{b.label}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.statusText}>
                  คงเหลือ: <Text style={styles.bold}>{12 - q5Index}</Text> เดือน
                </Text>
                <Text style={styles.statusText}>
                  ผิดพลาด: <Text style={styles.bold}>{q5WrongCount}</Text> ครั้ง
                </Text>
              </View>

              <View style={{ width: "100%", marginTop: 8 }}>
                <PrimaryButton label="ถัดไป" onPress={() => setStep("q6_read")} disabled={!q5Complete} />
              </View>
            </View>
          )}

          {/* Q6 - หน้าบทความ */}
          {step === "q6_read" && (
            <View>
              <Text style={styles.qTitle}>ข้อ 6) อ่านแล้วจำรายละเอียด</Text>
              <Text style={styles.quote}>{q6Text}</Text>
              <Text style={[styles.hint, { marginBottom: 12 }]}>
                เมื่อพร้อมกด “เริ่มตอบข้อ 6” และจะไม่สามารถย้อนกลับมาหน้านี้ได้
              </Text>
              <PrimaryButton label="เริ่มตอบข้อ 6" onPress={() => setStep("q6_answer")} />
            </View>
          )}

          {/* Q6 - หน้าตอบ */}
          {step === "q6_answer" && (
            <View>
              <Text style={styles.qTitle}>ข้อ 6) กรอกคำตอบจากบทความที่อ่าน</Text>
              <TextInput
                style={styles.input}
                placeholder="ชื่อ"
                value={answersQ_6.Quiz6_Name}
                onChangeText={(t) => setAnswersQ_6((s) => ({ ...s, Quiz6_Name: t }))}
              />
              <TextInput
                style={styles.input}
                placeholder="นามสกุล"
                value={answersQ_6.Quiz6_Surname}
                onChangeText={(t) => setAnswersQ_6((s) => ({ ...s, Quiz6_Surname: t }))}
              />
              <TextInput
                style={styles.input}
                placeholder="บ้านเลขที่"
                keyboardType="number-pad"
                value={answersQ_6.Quiz6_Number}
                onChangeText={(t) => setAnswersQ_6((s) => ({ ...s, Quiz6_Number: t }))}
              />
              <TextInput
                style={styles.input}
                placeholder="ถนน"
                value={answersQ_6.Quiz6_Street}
                onChangeText={(t) => setAnswersQ_6((s) => ({ ...s, Quiz6_Street: t }))}
              />
              <TextInput
                style={styles.input}
                placeholder="จังหวัด"
                value={answersQ_6.Quiz6_Province}
                onChangeText={(t) => setAnswersQ_6((s) => ({ ...s, Quiz6_Province: t }))}
              />
              <PrimaryButton label="ส่งคำตอบ" onPress={handleSubmit} style={{ marginTop: 4 }} />
            </View>
          )}

          {/* Review */}
          {step === "review" && (
            <View>
              <Text style={styles.title}>ผลคะแนน</Text>
              <Text style={[styles.p, { textAlign: "center", marginBottom: 12 }]}>
                คุณได้ {total} คะแนน ({level})
              </Text>

              <View style={styles.resultCard}>
                <Text style={styles.resultLine}>ข้อ 1 (ปี): {scores.Quiz_1} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 2 (เดือน): {scores.Quiz_2} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 3 (ชั่วโมง): {scores.Quiz_3} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 4 (เกมตัวเลข): {scores.Quiz_4} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 5 (เกมเดือน): {scores.Quiz_5} คะแนน</Text>
                <Text style={styles.resultLine}>ข้อ 6 (ที่อยู่): {scores.Quiz_6} คะแนน</Text>
                <View style={styles.divider} />
                <Text style={styles.totalText}>
                  คะแนนรวม: <Text style={{ fontWeight: "800" }}>{total}</Text>
                </Text>
                <View style={[styles.badge, getBadgeStyle(level)]}>
                  <Text style={styles.badgeText}>{level}</Text>
                </View>
              </View>

              {/* คำแนะนำตามระดับคะแนน */}
              <View style={styles.adviceCard}>
                <Text style={styles.adviceTitle}>{advice.heading}</Text>
                {advice.bullets.map((b, i) => (
                  <Text key={i} style={styles.adviceItem}>• {b}</Text>
                ))}
              </View>

              <PrimaryButton label="ทำอีกรอบ" onPress={resetRound} style={{ marginTop: 12 }} />
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ----------------------- Components ย่อย ----------------------- */
function QuestionBlock({ title, hint, onNext, disabledNext, children }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.qTitle}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
      <View style={{ width: "100%", marginTop: 4 }}>
        <PrimaryButton label="ถัดไป" onPress={onNext} disabled={disabledNext} />
      </View>
    </View>
  );
}

function PrimaryButton({ label, onPress, style, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, disabled && styles.btnDisabled, style]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.9}
      disabled={disabled}
    >
      <Text style={[styles.primaryBtnText, disabled && styles.btnDisabledText]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ----------------------- Styles (Orange Theme) ----------------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  headerGap: { height: 6 },
  outer: { paddingHorizontal: 16, paddingBottom: 16, alignItems: "center" },
  card: {
    width: "100%", maxWidth: 680, backgroundColor: "white", borderRadius: 20, padding: 16, marginTop: 8,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 4, borderWidth: 1, borderColor: "#FFE4D6" },
    }),
  },
  title: { fontSize: 24, marginBottom: 12, textAlign: "center", fontWeight: "800", color: "#7C2D12" },
  p: { fontSize: 16, marginBottom: 10, lineHeight: 22, color: "#111827" },
  qTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#111827" },
  hint: { fontSize: 13, color: "#9A3412", marginBottom: 8 },
  bold: { fontWeight: "800", color: "#7C2D12" },

  startBig: { fontSize: 28, fontWeight: "900", color: "#7C2D12", marginTop: -4, marginBottom: 6 },

  input: {
    borderWidth: 1, borderColor: "#FED7AA", padding: 12, borderRadius: 12, marginBottom: 12, backgroundColor: "#FFFBEB", color: '#000',
  },
  errorText: { fontSize: 12, color: "#DC2626", marginTop: -6, marginBottom: 8 },

  primaryBtn: {
    backgroundColor: "#F97316", paddingVertical: 12, borderRadius: 12, alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#F97316", shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  primaryBtnText: { color: "white", fontWeight: "800", fontSize: 16 },
  btnDisabled: { backgroundColor: "#FED7AA" },
  btnDisabledText: { color: "#FFF" },

  quote: { borderLeftWidth: 4, borderLeftColor: "#FDBA74", paddingLeft: 10, fontSize: 16, marginBottom: 10, color: "#111827" },

  progressBarBg: { height: 10, backgroundColor: "#FFE4D6", borderRadius: 999, overflow: "hidden", marginBottom: 14 },
  progressBarFill: { height: "100%", backgroundColor: "#FB923C" },

  resultCard: { backgroundColor: "#FFFAF5", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#FFE4D6" },
  divider: { height: 1, backgroundColor: "#FDEAD7", marginVertical: 10 },
  resultLine: { fontSize: 16, marginBottom: 6, color: "#111827" },
  totalText: { fontSize: 18, marginBottom: 8, color: "#111827" },

  badge: { alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  badgeText: { color: "white", fontWeight: "800" },

  adviceCard: { marginTop: 12, backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FED7AA", borderRadius: 14, padding: 12 },
  adviceTitle: { fontSize: 16, fontWeight: "800", color: "#7C2D12", marginBottom: 6 },
  adviceItem: { fontSize: 14, color: "#7C2D12", lineHeight: 20, marginBottom: 4 },

  /* --- ฟองสบู่กริด Q4/Q5 — คงพื้นที่ ไม่ขยับเมื่อฟองหาย --- */
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 6,
  },
  gridCell: {
    width: "31%",
    marginBottom: 8,
  },
  gridBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 999,                // ฟองสบู่
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FED7AA",
    backgroundColor: "#FFF7ED",
    minHeight: 48,
    justifyContent: "center",
  },
  gridBtnWrong: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },
  gridBtnText: {
    color: "#7C2D12",
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
  gridBtnTextWrong: { color: "#B91C1C" },

  rowBetween: { marginTop: 2, flexDirection: "row", justifyContent: "space-between" },
  statusText: { fontSize: 14, color: "#7C2D12", marginTop: 4 },
});

/* ----------------------- สีป้ายระดับ ----------------------- */
function getBadgeStyle(level) {
  if (level === "ปกติ") return { backgroundColor: "#16A34A" };
  if (level === "ความบกพร่องทางสติปัญญาเล็กน้อย") return { backgroundColor: "#F59E0B" };
  return { backgroundColor: "#EF4444" };
}
