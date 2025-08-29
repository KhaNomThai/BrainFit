import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { auth, db } from "../firebase";
import {
  doc, setDoc, updateDoc, getDoc, increment, serverTimestamp
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// ===== สีแบบ fix: bg / border / icon =====
const CHECKLIST_ITEMS = [
  { key: "exercise", icon: "fitness-outline", label: "วันนี้ท่านได้ออกกำลังกาย",
    colors: { bg: "#FFF0E6", border: "#FFD8A8", icon: "#E8590C" } }, // ส้มพาสเทล
  { key: "social",   icon: "people-outline",  label: "วันนี้ท่านมีการพูดคุยปฏิสัมพันธ์",
    colors: { bg: "#E7F5FF", border: "#BDE0FE", icon: "#1C7ED6" } }, // ฟ้าอ่อน
  { key: "lunch",    icon: "fast-food-outline", label: "วันนี้ท่านรับประทานอาหารครบ 5 หมู่",
    colors: { bg: "#FFF5F5", border: "#FFC9C9", icon: "#FA5252" } }, // ชมพูอ่อน
  { key: "sleep",    icon: "moon-outline",    label: "วันนี้ท่านได้พักผ่อนพอ",
    colors: { bg: "#E6FCF5", border: "#C3FAE8", icon: "#0CA678" } }, // เขียวมิ้นท์
];

// helper: แปลง #RRGGBB เป็น rgba(r,g,b,a)
const hexToRgba = (hex, a) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
};

const todayKey = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};
const lastNDaysKeys = (n = 7) => {
  const arr = [];
  const base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    arr.push(`${d.getFullYear()}-${m}-${day}`);
  }
  return arr;
};

// Firestore refs
const dailyRef = (uid, dateKey) => doc(db, "users", uid, "daily", dateKey);
const statsRefDaily = (uid, dateKey) => doc(db, "users", uid, "stats", dateKey); // รายวัน
const metaRef = (uid) => doc(db, "users", uid, "meta", "aggregate");             // รวมทั้งหมด

export default function HomeScreen() {
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [bars, setBars] = useState(Array(7).fill(0));
  const [checklist, setChecklist] = useState({});
  const [ready, setReady] = useState(false);

  const last7 = useMemo(() => lastNDaysKeys(7), []);
  const today = todayKey();

  // โหลดครั้งแรก
  useEffect(() => {
    (async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setTodayCount(0);
          setTotalCount(0);
          setBars(Array(7).fill(0));
          setChecklist({});
          return;
        }
        await Promise.all([
          loadToday(user.uid, today, setTodayCount, setChecklist),
          loadStats(user.uid, setTotalCount),
          load7Days(user.uid, last7, setBars),
        ]);
      } catch (e) {
        console.warn("Init error:", e);
      } finally {
        setReady(true);
      }
    })();
  }, [today, last7]);

  // เพิ่ม usage เมื่อหน้าโฟกัส
  useFocusEffect(
    useCallback(() => {
      let canceled = false;
      (async () => {
        const user = auth.currentUser;
        if (!user) { setReady(true); return; }
        try {
          const dRef = dailyRef(user.uid, today);
          const dSnap = await getDoc(dRef);
          if (!dSnap.exists()) {
            await setDoc(dRef, {
              usageCount: 0,
              checklist: { exercise: null, sleep: null, social: null, lunch: null },
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          await updateDoc(dRef, { usageCount: increment(1), updatedAt: serverTimestamp() });
          await setDoc(statsRefDaily(user.uid, today), { count: increment(1), updatedAt: serverTimestamp() }, { merge: true });
          await setDoc(metaRef(user.uid), { totalCount: increment(1), updatedAt: serverTimestamp() }, { merge: true });

          if (!canceled) {
            await Promise.all([
              loadToday(user.uid, today, setTodayCount, setChecklist),
              loadStats(user.uid, setTotalCount),
              load7Days(user.uid, last7, setBars),
            ]);
          }
        } catch (e) {
          console.warn("Focus increment error:", e);
        } finally {
          setReady(true);
        }
      })();
      return () => { canceled = true; };
    }, [today, last7])
  );

  // อัปเดต checklist
  const onUpdateChecklist = async (key, val) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const dRef = dailyRef(user.uid, today);
      await setDoc(
        dRef,
        { checklist: { ...checklist, [key]: val }, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setChecklist(prev => ({ ...prev, [key]: val }));
    } catch (e) {
      console.warn("update checklist error:", e);
    }
  };

  // Loading
  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}><Text style={styles.loadingText}>กำลังโหลด...</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: 8 }]}>
        <Text style={styles.header}>กิจกรรมประจำวัน</Text>

        {/* การ์ดสถิติ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>สถิติการใช้งาน</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="time-outline" size={22} color={ORANGE} style={{ marginBottom: 4 }} />
              <Text style={styles.statNumber}>{totalCount}</Text>
              <Text style={styles.statLabel}>ครั้งทั้งหมด</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="today-outline" size={22} color={ORANGE} style={{ marginBottom: 4 }} />
              <Text style={styles.statNumber}>{todayCount}</Text>
              <Text style={styles.statLabel}>วันนี้</Text>
            </View>
          </View>

          <Text style={styles.subHeader}>การใช้งาน 7 วันล่าสุด</Text>
          <View style={styles.chartWrap}>
            {bars.map((h, idx) => (
              <View key={idx} style={styles.barWrap}>
                <View style={[styles.bar, { height: 8 + h * 0.9 }]} />
                <Text style={styles.barLabel}>{last7[idx].slice(8)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* เช็กลิสต์ (bg อ่อน + กรอบ + ไอคอนมีสี) */}
        {CHECKLIST_ITEMS.map((item) => {
          const value = checklist?.[item.key];
          return (
            <View
              key={item.key}
              style={[
                styles.listCard,
                { backgroundColor: item.colors.bg, borderColor: item.colors.border, borderWidth: 1 }
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Ionicons name={item.icon} size={24} color={item.colors.icon} style={styles.listIcon} />
                <Text style={styles.listText}>{item.label}</Text>
              </View>
              <View style={styles.pillRow}>
                <Pill label="ใช่"    active={value === true}  onPress={() => onUpdateChecklist(item.key, true)}  color={item.colors.icon} />
                <Pill label="ไม่ใช่" active={value === false} onPress={() => onUpdateChecklist(item.key, false)} color={item.colors.icon} />
              </View>
            </View>
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== fetch helpers =====
async function loadToday(uid, dateKey, setCount, setChecklist) {
  const snap = await getDoc(dailyRef(uid, dateKey));
  if (snap.exists()) {
    const data = snap.data() || {};
    setCount(data.usageCount || 0);
    setChecklist(data.checklist || {});
  } else {
    setCount(0);
    setChecklist({});
  }
}
async function loadStats(uid, setTotalCount) {
  const sSnap = await getDoc(metaRef(uid));
  setTotalCount(sSnap.exists() ? (sSnap.data().totalCount || 0) : 0);
}
async function load7Days(uid, keys, setBars) {
  const counts = [];
  for (const k of keys) {
    const snap = await getDoc(dailyRef(uid, k));
    counts.push(snap.exists() ? (snap.data().usageCount || 0) : 0);
  }
  const max = Math.max(1, ...counts);
  const heights = counts.map((c) => Math.round((c / max) * 100));
  setBars(heights);
}

// ===== UI atoms =====
function Pill({ label, active, onPress, color }) {
  const bgActive = hexToRgba(color, 0.18); // พื้นจางเมื่อเลือก
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pill,
        { borderColor: color },
        active ? { backgroundColor: bgActive } : null
      ]}
    >
      <Text style={[styles.pillText, active ? { color: "#111827" } : { color: "#374151" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ===== styles =====
const ORANGE = "#FB923C";
const ORANGE_LIGHT = "#FFEDD5";
const GRAY = "#6B7280";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 32 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: "#111827" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#111827" },

  statsRow: { flexDirection: "row", gap: 16, marginTop: 8, marginBottom: 6 },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: ORANGE_LIGHT,
  },
  statNumber: { fontSize: 26, fontWeight: "800", color: ORANGE },
  statLabel: { fontSize: 12, color: GRAY, marginTop: 2 },

  subHeader: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 8, color: "#111827" },

  chartWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
    paddingHorizontal: 4,
  },
  barWrap: { alignItems: "center", width: 26 },
  bar: { width: 22, borderRadius: 8, backgroundColor: ORANGE },
  barLabel: { fontSize: 11, color: GRAY, marginTop: 6 },

  // Checklist
  listCard: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  listIcon: { marginRight: 10 },
  listText: { flex: 1, fontSize: 16, fontWeight: "700", color: "#111827" },

  pillRow: { flexDirection: "row", gap: 8, marginLeft: 12 },
  pill: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "transparent",
  },
  pillText: { fontSize: 14, fontWeight: "700" },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: GRAY },
});
