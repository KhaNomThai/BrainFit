import React, { useState } from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HiddenObjectGame() {
  // --- theme สีส้ม ---
  const ORANGE = {
    primary: "#FF922B",
    border: "#FFD8A8",
    pale: "#FFF5EA",
    text: "#2F2A26",
    success: "#0CA678",
    gray: "#666",
  };

  // --- step: intro -> play ---
  const [step, setStep] = useState("intro");

  // --- pool สิ่งของทั้งหมดในด่านนี้ ---
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

  const handleStart = () => {
    shuffleItems();
    setStep("play");
  };

  const handleFind = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, found: true } : item))
    );
  };

  const allFound = items.length > 0 && items.every((item) => item.found);

  if (step === "intro") {
    return (
      <View style={[styles.container, { paddingHorizontal: 16 }]}>
        <View style={styles.headerRow}>
          <Ionicons name="information-circle" size={24} color={ORANGE.primary} />
          <Text style={[styles.title, { color: ORANGE.text }]}>วิธีเล่น</Text>
        </View>

        <View style={[styles.card, { borderColor: ORANGE.border, backgroundColor: ORANGE.pale }]}>
          <View style={styles.bulletRow}>
            <Ionicons name="list" size={18} color={ORANGE.text} />
            <Text style={styles.bulletText}>ในแต่ละรอบ ระบบจะสุ่มสิ่งของมา 3 ชิ้นจากภาพ</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="finger-print" size={18} color={ORANGE.text} />
            <Text style={styles.bulletText}>แตะบนตำแหน่งของสิ่งของในรูป เพื่อทำเครื่องหมายว่า “เจอแล้ว”</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={18} color={ORANGE.success} />
            <Text style={styles.bulletText}>เมื่อเจอครบ 3 ชิ้น จะขึ้นข้อความสำเร็จ และเริ่มรอบใหม่ได้</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleStart}
          style={[styles.primaryBtn, { backgroundColor: ORANGE.primary, borderColor: ORANGE.border }]}
          activeOpacity={0.9}
        >
          <Ionicons name="play" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>เริ่มเล่น</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- หน้าเล่นเกม ---
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="search" size={24} color={ORANGE.primary} />
        <Text style={[styles.title, { color: ORANGE.text }]}>หาของที่ซ่อนอยู่ในภาพ</Text>
      </View>

      <ImageBackground
        source={require("../../assets/FindPic.png")}
        style={styles.background}
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
          />
        ))}
      </ImageBackground>

      {/* รายการสิ่งของ */}
      <View style={[styles.list, { marginTop: -120 }]}>
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.chip,
              { borderColor: item.found ? ORANGE.success : ORANGE.border, backgroundColor: ORANGE.pale },
            ]}
          >
            <Ionicons
              name={item.found ? "checkmark-circle" : "ellipse-outline"}
              size={18}
              color={item.found ? ORANGE.success : ORANGE.text}
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

      {/* จบเกม */}
      {allFound && (
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="trophy" size={22} color={ORANGE.primary} />
            <Text style={[styles.winText, { color: ORANGE.primary }]}> เก่งมาก! เจอครบแล้ว</Text>
          </View>
          <TouchableOpacity onPress={shuffleItems} style={styles.restartBtn} activeOpacity={0.9}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.restartText}>เริ่มใหม่</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // โครงหลัก
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "flex-start" },
  headerRow: { flexDirection: "row", alignItems: "center", margin: 10},
  title: { fontSize: 22, fontWeight: "bold", marginLeft: 6 },

  // รูปพื้นหลัง (ไม่แก้ไขส่วนรูปตามที่ขอ)
  background: { width: "100%", height: "70%", marginTop: 20 },
  hitbox: { position: "absolute" },

  // รายการสิ่งของใต้รูป
  list: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 4,
  },
  listItem: { fontSize: 18 },

  // ข้อความชนะ + ปุ่มเริ่มใหม่
  winText: { fontSize: 18, fontWeight: "bold", marginLeft: 4 },
  restartBtn: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF922B",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  restartText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 6 },

  // การ์ด intro
  card: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  bulletRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  bulletText: { fontSize: 16, marginLeft: 8, color: "#2F2A26" },

  // ปุ่มเริ่มเล่น
  primaryBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 },
});
