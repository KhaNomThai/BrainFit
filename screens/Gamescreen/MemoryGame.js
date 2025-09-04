// screens/Gamescreen/HiddenObjectGame.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MemoryGame() {
  /* ---------- THEME (โทนส้มให้เข้าชุดเกมอื่น) ---------- */
  const ORANGE = {
    primary: "#FF8A1F",
    primaryDark: "#E67700",
    light: "#FFE7CC",
    pale: "#FFF6EC",
    border: "#FFD2A3",
    textMain: "#1F1300",
    textSub: "#4A3726",
    success: "#0CA678",
    line: "#F0E7DC",
    card: "#FFFFFF",
  };

  /* ---------- PHASE: intro | play | result ---------- */
  const [phase, setPhase] = useState("intro");

  /* ---------- POOL สิ่งของทั้งหมดในภาพ (คงเดิม) ---------- */
  const allItems = useMemo(
    () => [
      { id: "ชายชุดดำ", top: "11%", left: "90%", width: "10%", height: "14%" },
      { id: "แตงกวา", top: "11%", left: "21%", width: "12%", height: "10%" },
      { id: "น้ำยาบ้วนปาก", top: "30%", left: "50%", width: "10%", height: "8%" },
      { id: "หนู", top: "55%", left: "22%", width: "12%", height: "8%" },
      { id: "ยูง", top: "35%", left: "68%", width: "9%", height: "6%" },
      { id: "ปลาดุก", top: "1%", left: "45%", width: "10%", height: "10%" },
      { id: "แยม", top: "35%", left: "2%", width: "9%", height: "7%" },
      { id: "หมวก", top: "63%", left: "39%", width: "13%", height: "8%" },
      { id: "ไส้เดือน", top: "52%", left: "60%", width: "22%", height: "10%" },
    ],
    []
  );

  /* ---------- เลือกสุ่ม 3 ชิ้นต่อรอบ (คงเดิม) ---------- */
  const [items, setItems] = useState([]);
  const shuffleItems = () => {
    const shuffled = [...allItems]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((item) => ({ ...item, found: false }));
    setItems(shuffled);
  };


  useEffect(() => {
  }, []);

  const handleFind = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, found: true } : item))
    );
  };

  const foundCount = items.filter((i) => i.found).length;
  const allFound = items.length > 0 && foundCount === items.length;

  // ไปหน้า result เมื่อหาเจอครบ
  useEffect(() => {
    if (phase === "play" && allFound) {
      const t = setTimeout(() => setPhase("result"), 600);
      return () => clearTimeout(t);
    }
  }, [phase, allFound]);

  const startGame = () => {
    shuffleItems();
    setPhase("play");
  };

  const restart = () => {
    shuffleItems();
    setPhase("play");
  };

  return (
    <View style={[styles.container, { backgroundColor: "#FFFDF9" }]}>
      {/* ---------- TOPBAR ---------- */}
      <View style={[styles.topbar, { backgroundColor: ORANGE.card, borderBottomColor: ORANGE.line }]}>
        <View style={styles.topbarContent}>
          <Ionicons name="search" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
          <Text style={[styles.topbarTitle, { color: ORANGE.textMain }]}>เกมหาของในภาพ</Text>
        </View>
      </View>

      {/* ---------- INTRO ---------- */}
      {phase === "intro" && (
        <ScrollView contentContainerStyle={styles.introWrap} showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.introCard,
              {
                backgroundColor: ORANGE.card,
                borderColor: ORANGE.border,
              },
            ]}
          >
            <View style={styles.introRow}>
              <Ionicons name="book-outline" size={24} color={ORANGE.primaryDark} />
              <Text style={[styles.introText, { color: ORANGE.textSub }]}>
                แตะบนภาพเพื่อค้นหา “สิ่งของ” ที่กำหนดไว้ด้านล่างให้ครบทั้งหมด
              </Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="hand-left-outline" size={24} color={ORANGE.primaryDark} />
              <Text style={[styles.introText, { color: ORANGE.textSub }]}>
                เมื่อพบสิ่งของแล้ว วงกรอบจะแสดงสีเขียว และชื่อรายการด้านล่างจะขีดทับ
              </Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="checkmark-circle-outline" size={24} color={ORANGE.success} />
              <Text style={[styles.introText, { color: ORANGE.textSub }]}>
                หาให้ครบทุกชิ้น แล้วจะสรุปผลให้โดยอัตโนมัติ
              </Text>
            </View>
          </View>

          <View style={styles.introActions}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: ORANGE.primary, borderColor: ORANGE.border }]}
              onPress={startGame}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ---------- PLAY ---------- */}
      {phase === "play" && (
        <View style={{ flex: 1, alignItems: "center" }}>
          {/* หัวเรื่องเล็ก ๆ */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
          </View>

          {/* พื้นหลังรูปภาพ + hitbox */}
          <ImageBackground
            source={require("../../assets/FindPic.png")}
            style={styles.background}
            resizeMode="cover"
          >
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.hitbox,
                  {
                    top: item.top,
                    left: item.left,
                    width: item.width,
                    height: item.height,
                    borderWidth: item.found ? 3 : 0,
                    borderColor: item.found ? ORANGE.success : "transparent",
                  },
                ]}
                onPress={() => handleFind(item.id)}
                activeOpacity={0.85}
              />
            ))}
          </ImageBackground>

          {/* รายการสิ่งของที่ต้องหา */}
          <View style={[styles.list, { backgroundColor: ORANGE.pale, borderColor: ORANGE.border }]}>
            {items.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.chip,
                  {
                    borderColor: item.found ? ORANGE.success : ORANGE.border,
                    backgroundColor: ORANGE.card,
                  },
                ]}
              >
                <Ionicons
                  name={item.found ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={item.found ? ORANGE.success : ORANGE.textMain}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.listItem,
                    { color: ORANGE.textMain },
                    item.found && { textDecorationLine: "line-through", opacity: 0.6 },
                  ]}
                >
                  {item.id}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ---------- RESULT ---------- */}
      {phase === "result" && (
        <ScrollView contentContainerStyle={styles.resultWrap}>
          <View
            style={[
              styles.resultCard,
              { backgroundColor: ORANGE.card, borderColor: ORANGE.border },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="flag-checkered" size={22} color={ORANGE.primaryDark} />
              <Text style={[styles.resultTitle, { color: ORANGE.textMain }]}>สรุปผล</Text>
            </View>

            <Text style={[styles.resultScore, { color: ORANGE.textSub }]}>
              เจอครบ {foundCount} / {items.length} ชิ้น
            </Text>

            <View style={[styles.resultBar, { backgroundColor: ORANGE.pale }]}>
              <View
                style={[
                  styles.resultFill,
                  {
                    width: `${(foundCount / (items.length || 1)) * 100}%`,
                    backgroundColor: ORANGE.success,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.resultActionsCenter}>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: ORANGE.border, backgroundColor: ORANGE.light }]}
              onPress={() => setPhase("intro")}
              activeOpacity={0.9}
            >
              <Text style={[styles.secondaryBtnText, { color: ORANGE.textMain }]}>กลับหน้าเริ่ม</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: ORANGE.primary }]}
              onPress={restart}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryBtnText}>เล่นอีกครั้ง</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

/* ---------- Styles ---------- */
const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  android: { elevation: 2 },
  default: {},
});

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Topbar */
  topbar: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  topbarContent: { flexDirection: "row", alignItems: "center", alignSelf: "center", maxWidth: "92%" },
  topbarTitle: { fontSize: 24, fontWeight: "900" },

  /* Intro */
  introWrap: { padding: 18, alignItems: "center" },
  introCard: {
    borderRadius: 18,
    borderWidth: 2,
    padding: 18,
    width: "100%",
    ...cardShadow,
  },
  introRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  introText: { fontSize: 18, lineHeight: 26, flexShrink: 1 },
  introActions: { marginTop: 14, gap: 10, alignItems: "center", width: "100%" },
  primaryBtn: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    borderRadius: 14,
    minWidth: 240,
    alignItems: "center",
    borderWidth: 2,
    ...cardShadow,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },

  /* Play */
background: { 
  width: "100%", 
  height: "58%",      // ลดนิดหน่อยเพื่อเว้นให้ list
  marginTop: 12
},

list: {
  width: "92%",
  borderWidth: 2,
  borderRadius: 14,
  paddingVertical: 8,
  paddingHorizontal: 8,
  marginTop: 8,        // ✅ ชิดใต้รูปพอดี
  marginBottom: 12,    // ✅ กันไม่ให้ติดขอบล่างเกินไป
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  backgroundColor: "#FFF",
},


  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 6,
  },
  listItem: { fontSize: 18, fontWeight: "700" },

  /* Result */
  resultWrap: { padding: 18, paddingTop: 36, alignItems: "center" },
  resultCard: {
    borderRadius: 18,
    borderWidth: 2,
    padding: 22,
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
    ...cardShadow,
  },
  resultTitle: { fontSize: 22, fontWeight: "900" },
  resultScore: { fontSize: 18, marginTop: 6, marginBottom: 12 },
  resultBar: { width: "100%", height: 12, borderRadius: 999, overflow: "hidden" },
  resultFill: { height: "100%", borderRadius: 999 },

  resultActionsCenter: { width: "100%", gap: 12, alignItems: "center" },

  secondaryBtn: {
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 14,
    minWidth: 200,
    alignItems: "center",
    borderWidth: 2,
    ...cardShadow,
  },
  secondaryBtnText: { fontSize: 18, fontWeight: "900" },
});
