import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions  } from "react-native";
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
        exercise: formatted[keyToLabel("exercise")],
        social: formatted[keyToLabel("social")],
        lunch: formatted[keyToLabel("lunch")],
        sleep: formatted[keyToLabel("sleep")],
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
    <SafeAreaView style={styles.safe}
    >
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
      <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: 8 }]} showsVerticalScrollIndicator={false}>
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

const ORANGE = "#FB923C";
const ORANGE_LIGHT = "#FFEDD5";
const GRAY = "#6B7280";
const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff",padding: vw(5),},
  screen: { flex: 1, backgroundColor: "#fff", paddingBottom: vh(11) },
  content: { padding: vw(4), paddingBottom: vh(4) },

  header: { fontSize: vh(2.8), fontWeight: "700", marginBottom: vh(1.5), color: "#111827" },

  card: {
    backgroundColor: "#fff",
    borderRadius: vw(4),
    padding: vw(4),
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: vw(2),
    shadowOffset: { width: 0, height: vh(0.3) },
    elevation: 2,
    marginBottom: vh(1.8),
  },

  cardTitle: { fontSize: vh(2.3), fontWeight: "700", marginBottom: vh(1), color: "#111827" },

  statsRow: { flexDirection: "row", gap: vw(4), marginTop: vh(1), marginBottom: vh(0.8) },

  statBox: { flex: 1, alignItems: "center", paddingVertical: vh(1), borderRadius: vw(3), backgroundColor: ORANGE_LIGHT },
  statNumber: { fontSize: vh(3.3), fontWeight: "800", color: ORANGE },
  statLabel: { fontSize: vh(1.5), color: GRAY, marginTop: vh(0.3) },

  subHeader: { fontSize: vh(1.8), fontWeight: "600", marginTop: vh(1.5), marginBottom: vh(1), color: "#111827" },

  chartWrap: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: vh(15), paddingHorizontal: vw(1) },
  barWrap: { alignItems: "center", width: vw(6.5) },
  bar: { width: vw(4.5), borderRadius: vw(2), backgroundColor: ORANGE },
  barLabel: { fontSize: vh(1.4), color: GRAY, marginTop: vh(0.8) },

  listCard: {
    borderRadius: vw(4.5),
    paddingVertical: vh(1),
    paddingHorizontal: vw(4),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: vh(1.5),
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: vw(1),
    shadowOffset: { width: 0, height: vh(0.3) },
    elevation: 1,
  },
  
  listIcon: { marginRight: vw(2.5) },
  listText: { flex: 1, fontSize: vh(1.6), fontWeight: "700", color: "#111827" },

  pillRow: { flexDirection: "row", gap: vw(2), marginLeft: vw(3) },
  pill: { borderWidth: 1, paddingVertical: vh(0.8), paddingHorizontal: vw(4), borderRadius: 999, backgroundColor: "transparent" },
  pillText: { fontSize: vh(1.5), fontWeight: "700" },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: vh(2), color: GRAY },

  saveBtn: { backgroundColor: "#ff7f32",
    paddingVertical: vh(1.5),
    borderRadius: vw(2.5),
    alignItems: "center",
    marginTop: vh(1.2),
  },
  saveBtnText: { color: "#fff",
    fontSize: vh(1.5),
    fontWeight: "bold",
  },
});
