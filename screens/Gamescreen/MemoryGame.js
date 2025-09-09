// screens/Gamescreen/HiddenObjectGame.js
import React, { useState, useEffect } from "react";
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

/* ===== THEME ===== */
const ORANGE = {
  primary: "#FF8A1F",
  primaryDark: "#E67700",
  light: "#FFE7CC",
  pale: "#FFF6EC",
  border: "#FFD2A3",
  textMain: "#1F1300",
  textSub: "#4A3726",
  success: "#1DBF73",
  gray: "#666",
};
const NEUTRAL = { bg: "#FFFDF9", line: "#F0E7DC", card: "#FFFFFF" };

const cardShadow = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  android: { elevation: 2 },
  default: {},
});

export default function HiddenObjectGame() {
  // phase: intro | play | result
  const [phase, setPhase] = useState("intro");

  // --- HITBOX DATA (ห้ามแก้) ---
  const allItems = [
    { id: "ชายชุดดำ", top: "11%", left: "90%", width: "10%", height: "14%" },
    { id: "แตงกวา", top: "11%", left: "21%", width: "12%", height: "10%" },
    { id: "น้ำยาบ้วนปาก", top: "30%", left: "50%", width: "10%", height: "8%" },
    { id: "หนู", top: "55%", left: "22%", width: "12%", height: "8%" },
    { id: "ยูง", top: "35%", left: "68%", width: "9%", height: "6%" },
    { id: "ปลาดุก", top: "1%", left: "45%", width: "10%", height: "10%" },
    { id: "แยม", top: "35%", left: "2%", width: "9%", height: "7%" },
    { id: "หมวก", top: "63%", left: "39%", width: "13%", height: "8%" },
    { id: "ไส้เดือน", top: "52%", left: "60%", width: "22%", height: "10%" },
  ];

  const [items, setItems] = useState([]);

  const shuffleItems = () => {
    const shuffled = [...allItems]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((item) => ({ ...item, found: false }));
    setItems(shuffled);
  };

  const startGame = () => {
    shuffleItems();
    setPhase("play");
  };

  useEffect(() => {
    // เตรียมของไว้ล่วงหน้า
    shuffleItems();
  }, []);

  const handleFind = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, found: true } : item))
    );
  };

  const allFound = items.length > 0 && items.every((item) => item.found);

  // เมื่อหาเจอครบ ให้ข้ามไปหน้า result ผ่าน useEffect (ไม่เปลี่ยน state ระหว่าง render)
  useEffect(() => {
    if (phase === "play" && allFound) {
      setPhase("result");
    }
  }, [allFound, phase]);

  /* ===== RENDER ===== */

  // INTRO
  if (phase === "intro") {
    return (
      <View style={styles.containerBG}>
        <View style={styles.topbar}>
          <View style={styles.topbarContent}>
            <Ionicons name="search" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
            <Text style={styles.topbarTitle}>เกมหาของในภาพ</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.introWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.introCard}>
            <View style={styles.introRow}>
              <Ionicons name="image" size={24} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>
                ในแต่ละรอบจะสุ่มรายชื่อสิ่งของ <Text style={{fontWeight: "900"}}>3 ชิ้น</Text> ให้คุณตามหาในภาพ
              </Text>
            </View>
            <View style={styles.introRow}>
              {/* ใช้ชื่อไอคอนที่มีจริง เพื่อลด error */}
              <Ionicons name="finger-print" size={24} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>
                แตะบริเวณที่คิดว่าเป็นตำแหน่งของสิ่งของนั้น ๆ เพื่อทำเครื่องหมาย “เจอแล้ว”
              </Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="checkmark-circle-outline" size={24} color={ORANGE.success} />
              <Text style={styles.introText}>
                รายการด้านล่างภาพจะมี <Text style={{ fontWeight: "900" }}>วงกลม</Text> แสดงสถานะว่าพบสิ่งของนั้น ๆ หรือยัง
              </Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="refresh" size={24} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>
                เจอครบ 3 ชิ้นแล้ว กด “เริ่มใหม่” เพื่อสุ่มชุดใหม่และเล่นต่อ
              </Text>
            </View>
          </View>

          <View style={styles.introActions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={startGame}>
              <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // RESULT
  if (phase === "result") {
    return (
      <View style={styles.containerBG}>
        <View style={styles.topbar}>
          <View style={styles.topbarContent}>
            <Ionicons name="search" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
            <Text style={styles.topbarTitle}>เกมหาของในภาพ</Text>
          </View>
        </View>

        <View style={{ padding: 20, alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Ionicons name="trophy" size={22} color={ORANGE.primary} />
            <Text style={{ fontSize: 20, fontWeight: "900", color: ORANGE.primary, marginLeft: 6 }}>
              เก่งมาก! เจอครบแล้ว
            </Text>
          </View>

          <TouchableOpacity style={styles.secondaryBtn} onPress={startGame}>
            <Text style={styles.secondaryBtnText}>เล่นอีกครั้ง</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.linkBtn, { marginTop: 10 }]} onPress={() => setPhase("intro")}>
            <Text style={styles.linkBtnText}>ดูวิธีเล่น</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // PLAY
  return (
    <View style={styles.containerBG}>
      {/* TOPBAR */}
      <View style={styles.topbar}>
        <View style={styles.topbarContent}>
          <Ionicons name="search" size={26} color={ORANGE.primaryDark} style={{ marginRight: 8 }} />
          <Text style={styles.topbarTitle}>เกมหาของในภาพ</Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            เจอแล้ว {items.filter((i) => i.found).length}/{items.length}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setPhase("intro")} style={styles.badgeOutline}>
          <Ionicons name="help-circle-outline" size={18} color={ORANGE.primary} style={{ marginRight: 6 }} />
          <Text style={styles.badgeOutlineText}>วิธีเล่น</Text>
        </TouchableOpacity>
      </View>

      {/* ภาพ + HITBOX (ไม่แตะการทำงานเดิม) */}
      <ImageBackground
        source={require("../../assets/FindPic.png")}
        style={styles.background}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.hitbox, // ห้ามแก้
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
          />
        ))}
      </ImageBackground>

      {/* รายการสิ่งของ (ชิป + วงกลม/ติ๊กถูก) */}
      <View style={[styles.list, { marginTop: -120 }]}>
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.chip,
              {
                borderColor: item.found ? ORANGE.success : ORANGE.border,
                backgroundColor: ORANGE.pale,
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
                item.found && { textDecorationLine: "line-through", color: ORANGE.gray },
              ]}
            >
              {item.id}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  containerBG: { flex: 1, backgroundColor: NEUTRAL.bg },

  // TOPBAR
  topbar: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: NEUTRAL.card,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL.line,
  },
  topbarContent: { flexDirection: "row", alignItems: "center", alignSelf: "center", maxWidth: "92%" },
  topbarTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: ORANGE.textMain,
    textAlign: "center",
    flexShrink: 1,
  },

  // INTRO
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
  primaryBtn: {
    backgroundColor: ORANGE.primary,
    paddingVertical: 18,
    paddingHorizontal: 26,
    borderRadius: 14,
    minWidth: 240,
    alignItems: "center",
    ...cardShadow,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },

  // HEADER (play)
  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  badge: {
    backgroundColor: ORANGE.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  badgeOutline: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: ORANGE.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeOutlineText: { color: ORANGE.primary, fontWeight: "700", fontSize: 16 },

  // PLAY
  background: { width: "100%", height: "70%", marginTop: 10, backgroundColor: "#fff" },
  hitbox: { position: "absolute" }, // ห้ามแก้

  // LIST
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
    backgroundColor: ORANGE.pale,
  },
  listItem: { fontSize: 16, color: ORANGE.textMain },

  // RESULT
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
  secondaryBtnText: { color: ORANGE.textMain, fontSize: 18, fontWeight: "900" },
  linkBtn: { paddingVertical: 8, paddingHorizontal: 10 },
  linkBtnText: { color: ORANGE.primary, fontWeight: "800", fontSize: 16 },
});
