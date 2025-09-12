import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { post, isEmail } from "../../api";


// ===== สีแบบ fix: bg / border / icon =====
const CHECKLIST_ITEMS = [
  { key: "exercise", icon: "fitness-outline", label: "วันนี้ท่านได้ออกกำลังกาย", colors: { bg: "#FFF0E6", border: "#FFD8A8", icon: "#E8590C" } },
  { key: "social",   icon: "people-outline",  label: "วันนี้ท่านมีการพูดคุยปฏิสัมพันธ์", colors: { bg: "#E7F5FF", border: "#BDE0FE", icon: "#1C7ED6" } },
  { key: "lunch",    icon: "fast-food-outline", label: "วันนี้ท่านรับประทานอาหารครบ 5 หมู่", colors: { bg: "#FFF5F5", border: "#FFC9C9", icon: "#FA5252" } },
  { key: "sleep",    icon: "moon-outline",   label: "วันนี้ท่านได้พักผ่อนเพียงพอ", colors: { bg: "#E6FCF5", border: "#C3FAE8", icon: "#0CA678" } },
];

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

export default function HomeScreen({ email, setEmail }) {
  const [todayCount, setTodayCount] = useState(0); 
  const [totalCount, setTotalCount] = useState(0); 
  const [saveBars, setSaveBars]   = useState(Array(7).fill(0));
  const [checklist, setChecklist] = useState({});
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  

  const last7 = useMemo(() => lastNDaysKeys(7), []);
  const today = todayKey();

  const fetchSaveStats = async () => {
    try {
      const res = await post({ action: "getSaveStats", email });
      if (res?.success && Array.isArray(res.data)) {
        setSaveBars(res.data.map(d => d.count));
        const t = res.data.find(d => d.date === today)?.count ?? 0;
        setTodayCount(t);

        try {
          const totalRes = await post({ action: "getSaveTotal", email });
          if (totalRes?.success && typeof totalRes.total === "number") {
            setTotalCount(totalRes.total);
          } else {
            setTotalCount(res.data.reduce((s, d) => s + (d.count || 0), 0));
          }
        } catch {
          setTotalCount(res.data.reduce((s, d) => s + (d.count || 0), 0));
        }
      } else {
        setSaveBars(Array(7).fill(0));
        setTodayCount(0);
        setTotalCount(0);
      }
    } catch (e) {
      console.warn("fetchSaveStats error:", e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchSaveStats();
      } catch (e) {
        console.warn("Init error:", e);
      } finally {
        setReady(true);
      }
    })();
  }, [today]);

  const onSelectChecklist = (key, val) => {
    setChecklist(prev => ({ ...prev, [key]: val }));
  };

  const keyToLabel = (key) => {
    if (key === "exercise") return "วันนี้ท่านได้ออกกำลังกาย";
    if (key === "social") return "วันนี้ท่านมีการพูดคุยปฏิสัมพันธ์";
    if (key === "lunch") return "วันนี้ท่านรับประทานอาหารครบ 5 หมู่";
    if (key === "sleep") return "วันนี้ท่านได้พักผ่อนเพียงพอ";
    return key;
  };

  const onSaveChecklist = async () => {
    const allAnswered = CHECKLIST_ITEMS.every(item =>
      checklist[item.key] === true || checklist[item.key] === false
    );

    if (!allAnswered) {
      alert("กรุณาตอบทุกข้อก่อนบันทึก");
      return;
    }

    setLoading(true);
    try {
      const formatted = Object.fromEntries(
        Object.entries(checklist).map(([k, v]) => [keyToLabel(k), v ? "ใช่" : "ไม่ใช่"])
      );
      const data = await post({
        action: "Homescreen",
        email,
        checklist: formatted,
      });
      if (data?.success) {
        setLoading(false);
        // alert("บันทึกสำเร็จ");
        await fetchSaveStats();
      } else {
        setLoading(false);
        throw new Error(data?.message ?? "บันทึกไม่สำเร็จ");
      }
    } catch (e) {
      console.warn("Save checklist error:", e);
      setLoading(false);
    }
  };


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
          <Text style={styles.subHeader}>บันทึกการใช้งาน 7 วันล่าสุด</Text>
          <View style={styles.chartWrap}>
            {saveBars.map((h, idx) => {
              const maxH = Math.max(...saveBars, 1);
              const maxHeight = 100;
              let barHeight = (h / maxH) * maxHeight;
              const isZero = barHeight === 0;
              if (isZero) barHeight = 4;
              return (
                <View key={idx} style={styles.barWrap}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        borderRadius: isZero ? 2 : 8,
                        backgroundColor: ORANGE,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{last7[idx].slice(8)}</Text>
                </View>
              );
            })}
          </View>
        </View>

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
                <Pill label="ใช่" active={value === true}  onPress={() => onSelectChecklist(item.key, true)}  color={item.colors.icon} />
                <Pill label="ไม่ใช่" active={value === false} onPress={() => onSelectChecklist(item.key, false)} color={item.colors.icon} />
              </View>
            </View>
          );
        })}

        <TouchableOpacity onPress={onSaveChecklist} style={styles.saveBtn}>
          {loading ? (<ActivityIndicator color="#fff" />
          ) : (
          <Text style={styles.saveBtnText}>บันทึก</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== UI atoms =====
function Pill({ label, active, onPress, color }) {
  const bgActive = hexToRgba(color, 0.18);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[ styles.pill, { borderColor: color }, active ? { backgroundColor: bgActive } : null ]}
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
  statBox: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12, backgroundColor: ORANGE_LIGHT },
  statNumber: { fontSize: 26, fontWeight: "800", color: ORANGE },
  statLabel: { fontSize: 12, color: GRAY, marginTop: 2 },
  subHeader: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 8, color: "#111827" },
  chartWrap: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 120, paddingHorizontal: 4 },
  barWrap: { alignItems: "center", width: 26 },
  bar: { width: 18, borderRadius: 8, backgroundColor: ORANGE },
  barLabel: { fontSize: 11, color: GRAY, marginTop: 6 },
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
  pill: { borderWidth: 1, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 999, backgroundColor: "transparent" },
  pillText: { fontSize: 14, fontWeight: "700" },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: GRAY },
  saveBtn: { backgroundColor: ORANGE, paddingVertical: 12, borderRadius: 12, alignItems: "center", marginTop: 16 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
